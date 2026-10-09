import { createHash, createHmac, createSign } from 'node:crypto';
import type { Request, Response } from 'express';

export type SyncedIdentity = {
  id: string; source: string; displayName: string; email?: string;
  status?: string; kind: 'user' | 'service' | 'ai-agent'; department?: string;
  roles: string[]; groups: string[]; rawId: string; updatedAt?: string;
};
export type SyncedResource = {
  id: string; source: string; name: string; kind: 'group' | 'application' | 'role' | 'repository' | 'policy' | 'team';
  description?: string; risk?: 'low' | 'medium' | 'high'; members?: number;
};
export type SyncedEvent = {
  id: string; source: string; timestamp?: string; actor?: string;
  action: string; target?: string; severity: 'info' | 'warning' | 'critical'; summary: string;
};
export type ConnectorSnapshot = {
  connectorId: string; provider: string; syncedAt: string;
  counts: { identities: number; resources: number; events: number };
  identities: SyncedIdentity[]; resources: SyncedResource[]; events: SyncedEvent[];
  warnings: string[];
};

const snapshots = new Map<string, ConnectorSnapshot>();
const timeout = () => AbortSignal.timeout(20000);
const safe = (value: unknown) => typeof value === 'string' ? value : '';
const arr = (value: unknown) => Array.isArray(value) ? value as any[] : [];
const encode = (value: string | Buffer) => Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

async function json(url: string, headers: Record<string, string> = {}): Promise<any> {
  const response = await fetch(url, { headers, signal: timeout() });
  if (!response.ok) throw new Error(`Provider request failed (${response.status})`);
  return response.json();
}
async function textResponse(url: string, headers: Record<string, string> = {}): Promise<string> {
  const response = await fetch(url, { headers, signal: timeout() });
  if (!response.ok) throw new Error(`Provider request failed (${response.status})`);
  return response.text();
}
function id(source: string, raw: string) { return source + ':' + raw; }

async function entra(): Promise<ConnectorSnapshot> {
  const tokenResponse = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(process.env.ENTRA_TENANT_ID!)}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.ENTRA_CLIENT_ID!, client_secret: process.env.ENTRA_CLIENT_SECRET!, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }),
    signal: timeout()
  });
  if (!tokenResponse.ok) throw new Error('Microsoft Entra authentication failed (' + tokenResponse.status + ')');
  const token = (await tokenResponse.json() as { access_token: string }).access_token;
  const h = { authorization: 'Bearer ' + token };
  const warnings: string[] = [];
  async function pages(url: string, label: string): Promise<any[]> {
    const all: any[] = [];
    try {
      let next: string | undefined = url;
      while (next && all.length < 5000) {
        const page = await json(next, h); all.push(...arr(page.value));
        next = page['@odata.nextLink'];
      }
    } catch (e) { warnings.push(label + ': ' + (e instanceof Error ? e.message : 'unavailable')); }
    return all;
  }
  const [users, groups, roles, apps, audits] = await Promise.all([
    pages('https://graph.microsoft.com/v1.0/users?$select=id,displayName,userPrincipalName,mail,accountEnabled,department,jobTitle,createdDateTime&$top=999', 'Users'),
    pages('https://graph.microsoft.com/v1.0/groups?$select=id,displayName,description,mailEnabled,securityEnabled&$top=999', 'Groups'),
    pages('https://graph.microsoft.com/v1.0/directoryRoles?$select=id,displayName,description', 'Directory roles'),
    pages('https://graph.microsoft.com/v1.0/servicePrincipals?$select=id,displayName,appId,accountEnabled,servicePrincipalType&$top=999', 'Service principals'),
    pages('https://graph.microsoft.com/v1.0/auditLogs/directoryAudits?$top=100', 'Directory audit events')
  ]);
  const identities: SyncedIdentity[] = [
    ...users.map(u => ({ id:id('entra',safe(u.id)), rawId:safe(u.id), source:'entra', displayName:safe(u.displayName)||safe(u.userPrincipalName), email:safe(u.mail)||safe(u.userPrincipalName), status:u.accountEnabled===false?'disabled':'active', kind:'user' as const, department:safe(u.department), roles:[], groups:[], updatedAt:safe(u.createdDateTime) })),
    ...apps.map(a => ({ id:id('entra',safe(a.id)), rawId:safe(a.id), source:'entra', displayName:safe(a.displayName), status:a.accountEnabled===false?'disabled':'active', kind:'service' as const, roles:[], groups:[] }))
  ];
  const resources: SyncedResource[] = [
    ...groups.map(g => ({ id:id('entra-group',safe(g.id)), source:'entra', name:safe(g.displayName), kind:'group' as const, description:safe(g.description) })),
    ...roles.map(r => ({ id:id('entra-role',safe(r.id)), source:'entra', name:safe(r.displayName), kind:'role' as const, description:safe(r.description), risk:/global administrator|privileged|administrator/i.test(safe(r.displayName))?'high' as const:'medium' as const })),
    ...apps.map(a => ({ id:id('entra-app',safe(a.id)), source:'entra', name:safe(a.displayName), kind:'application' as const, description:safe(a.appId) }))
  ];
  const events: SyncedEvent[] = audits.map(a => ({ id:id('entra-audit',safe(a.id)||JSON.stringify(a)), source:'entra', timestamp:safe(a.activityDateTime), actor:safe(a.initiatedBy?.user?.userPrincipalName||a.initiatedBy?.app?.displayName), action:safe(a.activityDisplayName), target:arr(a.targetResources).map(t=>safe(t.displayName)).filter(Boolean).join(', '), severity:/delete|disable|remove|credential|role/i.test(safe(a.activityDisplayName))?'warning':'info', summary:safe(a.activityDisplayName)||'Directory activity' }));
  return make('entra','Microsoft Entra ID',identities,resources,events,warnings);
}

async function google(): Promise<ConnectorSnapshot> {
  const email = process.env.GOOGLE_WORKSPACE_SERVICE_ACCOUNT_EMAIL!;
  const privateKey = process.env.GOOGLE_WORKSPACE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now()/1000);
  const header=encode(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const claim=encode(JSON.stringify({iss:email,sub:process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL!,scope:[
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
    'https://www.googleapis.com/auth/admin.directory.group.readonly',
    'https://www.googleapis.com/auth/admin.directory.orgunit.readonly',
    'https://www.googleapis.com/auth/admin.reports.audit.readonly'
  ].join(' '),aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}));
  const unsigned=header+'.'+claim; const signer=createSign('RSA-SHA256'); signer.update(unsigned);
  const assertion=unsigned+'.'+encode(signer.sign(privateKey));
  const tokenRes=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:timeout()});
  if(!tokenRes.ok) throw new Error('Google Workspace authentication failed ('+tokenRes.status+')');
  const token=(await tokenRes.json() as {access_token:string}).access_token; const h={authorization:'Bearer '+token};
  const warnings:string[]=[];
  async function collect(url:string,label:string,itemsKey:string):Promise<any[]>{
    const out:any[]=[]; let next:string|undefined=url;
    try { while(next&&out.length<5000){const p=await json(next,h);out.push(...arr(p[itemsKey]));next=p.nextPageToken?url+(url.includes('?')?'&':'?')+'pageToken='+encodeURIComponent(p.nextPageToken):undefined;} }
    catch(e){warnings.push(label+': '+(e instanceof Error?e.message:'unavailable'));}
    return out;
  }
  const [users,groups,orgs,activities]=await Promise.all([
    collect('https://admin.googleapis.com/admin/directory/v1/users?customer=my_customer&maxResults=500','Users','users'),
    collect('https://admin.googleapis.com/admin/directory/v1/groups?customer=my_customer&maxResults=200','Groups','groups'),
    collect('https://admin.googleapis.com/admin/directory/v1/customer/my_customer/orgunits?type=all','Organizational units','organizationUnits'),
    collect('https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/admin?maxResults=100','Admin audit events','items')
  ]);
  const identities:SyncedIdentity[]=users.map(u=>({id:id('google',safe(u.id)),rawId:safe(u.id),source:'google-workspace',displayName:safe(u.name?.fullName)||safe(u.primaryEmail),email:safe(u.primaryEmail),status:u.suspended?'disabled':'active',kind:'user',department:safe(u.orgUnitPath),roles:arr(u.isAdmin?[{name:'Super Admin'}]:[]).map(r=>safe(r.name)),groups:[]}));
  const resources:SyncedResource[]=[
    ...groups.map(g=>({id:id('google-group',safe(g.id)),source:'google-workspace',name:safe(g.name)||safe(g.email),kind:'group' as const,description:safe(g.description)})),
    ...orgs.map(o=>({id:id('google-org',safe(o.orgUnitId),),source:'google-workspace',name:safe(o.name),kind:'group' as const,description:safe(o.orgUnitPath)}))
  ];
  const events:SyncedEvent[]=activities.map(a=>({id:id('google-audit',safe(a.id?.uniqueQualifier)||JSON.stringify(a)),source:'google-workspace',timestamp:safe(a.id?.time),actor:safe(a.actor?.email),action:safe(a.events?.map((e:any)=>e.name).join(', ')),target:safe(a.events?.flatMap((e:any)=>arr(e.parameters).map((p:any)=>p.value)).join(', ')),severity:/delete|suspend|admin|privilege|role/i.test(JSON.stringify(a.events))?'warning':'info',summary:safe(a.events?.map((e:any)=>e.name).join(', '))||'Admin activity'}));
  return make('google-workspace','Google Workspace',identities,resources,events,warnings);
}

async function okta(): Promise<ConnectorSnapshot> {
  const base=process.env.OKTA_ORG_URL!.replace(/\/$/,''); const h={authorization:'SSWS '+process.env.OKTA_API_TOKEN!,accept:'application/json'};
  const warnings:string[]=[];
  async function collect(path:string,label:string):Promise<any[]>{
    const out:any[]=[]; let next:string|undefined=base+path;
    try {while(next&&out.length<5000){const res=await fetch(next,{headers:h,signal:timeout()});if(!res.ok)throw new Error('HTTP '+res.status);out.push(...arr(await res.json()));const link=res.headers.get('link');const match=link?.split(',').find(s=>s.includes('rel="next"'));next=match?.match(/<([^>]+)>/)?.[1];}}
    catch(e){warnings.push(label+': '+(e instanceof Error?e.message:'unavailable'));}
    return out;
  }
  const [users,groups,apps,logs]=await Promise.all([
    collect('/api/v1/users?limit=200','Users'),collect('/api/v1/groups?limit=200','Groups'),
    collect('/api/v1/apps?limit=200','Applications'),collect('/api/v1/logs?since='+encodeURIComponent(new Date(Date.now()-7*86400000).toISOString())+'&limit=200','System Log')
  ]);
  const identities:SyncedIdentity[]=users.map(u=>({id:id('okta',safe(u.id)),rawId:safe(u.id),source:'okta',displayName:safe(u.profile?.displayName)||[u.profile?.firstName,u.profile?.lastName].filter(Boolean).join(' '),email:safe(u.profile?.email)||safe(u.profile?.login),status:safe(u.status).toLowerCase()==='active'?'active':'disabled',kind:'user',department:safe(u.profile?.department),roles:[],groups:[]}));
  const resources:SyncedResource[]=[
    ...groups.map(g=>({id:id('okta-group',safe(g.id)),source:'okta',name:safe(g.profile?.name),kind:'group' as const,description:safe(g.profile?.description)})),
    ...apps.map(a=>({id:id('okta-app',safe(a.id)),source:'okta',name:safe(a.label),kind:'application' as const,description:safe(a.name)}))
  ];
  const events:SyncedEvent[]=logs.map(e=>({id:id('okta-event',safe(e.uuid)||JSON.stringify(e)),source:'okta',timestamp:safe(e.published),actor:safe(e.actor?.alternateId||e.actor?.displayName),action:safe(e.eventType),target:arr(e.target).map(t=>safe(t.displayName)).filter(Boolean).join(', '),severity:/denied|failure|delete|deactivate|privilege|policy/i.test(safe(e.eventType))?'warning':'info',summary:safe(e.displayMessage)||safe(e.eventType)}));
  return make('okta','Okta',identities,resources,events,warnings);
}

function awsAuth(host:string,path:string,body:string,region:string,amzDate:string,dateStamp:string):string {
  const access=process.env.AWS_ACCESS_KEY_ID!, secret=process.env.AWS_SECRET_ACCESS_KEY!;
  const payload=createHash('sha256').update(body).digest('hex');
  const token=process.env.AWS_SESSION_TOKEN;
  const canonicalHeaders='content-type:application/x-www-form-urlencoded; charset=utf-8\nhost:'+host+'\nx-amz-date:'+amzDate+'\n'+(token?'x-amz-security-token:'+token+'\n':'');
  const signed=token?'content-type;host;x-amz-date;x-amz-security-token':'content-type;host;x-amz-date';
  const request=['POST',path,'',canonicalHeaders,signed,payload].join('\n');
  const scope=dateStamp+'/'+region+'/iam/aws4_request';
  const toSign=['AWS4-HMAC-SHA256',amzDate,scope,createHash('sha256').update(request).digest('hex')].join('\n');
  const h=(k:string|Buffer,v:string)=>createHmac('sha256',k).update(v).digest();
  const key=h(h(h(h('AWS4'+secret,dateStamp),region),'iam'),'aws4_request');
  const sig=createHmac('sha256',key).update(toSign).digest('hex');
  return 'AWS4-HMAC-SHA256 Credential='+access+'/'+scope+', SignedHeaders='+signed+', Signature='+sig;
}
async function awsCall(action:string):Promise<any>{
  const region=process.env.AWS_REGION||'us-east-1',host='iam.'+region+'.amazonaws.com',now=new Date();
  const amzDate=now.toISOString().replace(/[:-]|\.\d{3}/g,''),stamp=amzDate.slice(0,8);
  const body='Action='+encodeURIComponent(action)+'&Version=2010-05-08';
  const headers:Record<string,string>={'authorization':awsAuth(host,'/',body,region,amzDate,stamp),'content-type':'application/x-www-form-urlencoded; charset=utf-8','host':host,'x-amz-date':amzDate};
  if(process.env.AWS_SESSION_TOKEN)headers['x-amz-security-token']=process.env.AWS_SESSION_TOKEN;
  const xml=await textResponse('https://'+host+'/',{...headers, 'x-action':action});
  return xml;
}
function xmlItems(xml:string, tag:string):Array<Record<string,string>>{
  const out:Array<Record<string,string>>=[]; const blocks=xml.match(new RegExp('<'+tag+'>([\\s\\S]*?)</'+tag+'>','g'))||[];
  for(const block of blocks){const item:Record<string,string>={};for(const m of block.matchAll(/<([A-Za-z0-9]+)>([^<]*)<\/[A-Za-z0-9]+>/g))item[m[1]]=m[2];out.push(item);}
  return out;
}
async function aws():Promise<ConnectorSnapshot>{
  const warnings:string[]=[]; let users:any[]=[],roles:any[]=[],policies:any[]=[];
  try{users=xmlItems(await awsCall('ListUsers'),'member');}catch(e){warnings.push('Users: '+(e instanceof Error?e.message:'unavailable'));}
  try{roles=xmlItems(await awsCall('ListRoles'),'member');}catch(e){warnings.push('Roles: '+(e instanceof Error?e.message:'unavailable'));}
  try{policies=xmlItems(await awsCall('ListPolicies'),'member');}catch(e){warnings.push('Policies: '+(e instanceof Error?e.message:'unavailable'));}
  const identities:SyncedIdentity[]=users.map(u=>({id:id('aws',u.UserId||u.Arn||u.UserName),rawId:u.UserId||u.Arn||u.UserName,source:'aws-iam',displayName:u.UserName||u.Arn,email:undefined,status:'active',kind:'user',roles:[],groups:[],updatedAt:u.CreateDate}));
  const resources:SyncedResource[]=[
    ...roles.map(r=>({id:id('aws-role',r.RoleId||r.Arn||r.RoleName),source:'aws-iam',name:r.RoleName||r.Arn,kind:'role' as const,description:r.Description,risk:/admin|root|poweruser/i.test(r.RoleName||'')?'high' as const:'medium' as const})),
    ...policies.map(p=>({id:id('aws-policy',p.PolicyId||p.Arn||p.PolicyName),source:'aws-iam',name:p.PolicyName||p.Arn,kind:'policy' as const,description:p.Description,risk:/administratoraccess|poweruseraccess/i.test(p.PolicyName||'')?'high' as const:'medium' as const}))
  ];
  return make('aws-iam','AWS IAM',identities,resources,[],warnings.concat('AWS CloudTrail audit events are not included in this sync; configure a separate CloudTrail adapter.'));
}

async function github():Promise<ConnectorSnapshot>{
  const token=process.env.GITHUB_TOKEN!,org=process.env.GITHUB_ORG!;
  const h={authorization:'Bearer '+token,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28'};
  const warnings:string[]=[];
  async function collect(path:string,label:string):Promise<any[]>{
    const out:any[]=[];let next:string|undefined='https://api.github.com'+path;
    try{while(next&&out.length<5000){const res=await fetch(next,{headers:h,signal:timeout()});if(!res.ok)throw new Error('HTTP '+res.status);out.push(...arr(await res.json()));const link=res.headers.get('link');const match=link?.split(',').find(s=>s.includes('rel="next"'));next=match?.match(/<([^>]+)>/)?.[1];}}
    catch(e){warnings.push(label+': '+(e instanceof Error?e.message:'unavailable'));}
    return out;
  }
  const prefix='/orgs/'+encodeURIComponent(org);
  const [members,teams,repos]=await Promise.all([
    collect(prefix+'/members?per_page=100','Organization members'),
    collect(prefix+'/teams?per_page=100','Teams'),
    collect(prefix+'/repos?per_page=100&sort=updated','Repositories')
  ]);
  const identities:SyncedIdentity[]=members.map(u=>({id:id('github',safe(u.id)),rawId:safe(u.id),source:'github',displayName:safe(u.login),status:'active',kind:'user',roles:[],groups:[],updatedAt:safe(u.updated_at)}));
  const resources:SyncedResource[]=[
    ...teams.map(t=>({id:id('github-team',safe(t.id)),source:'github',name:safe(t.name)||safe(t.slug),kind:'team' as const,description:safe(t.description),members:typeof t.members_count==='number'?t.members_count:undefined})),
    ...repos.map(r=>({id:id('github-repo',safe(r.id)),source:'github',name:safe(r.full_name)||safe(r.name),kind:'repository' as const,description:safe(r.description),risk:r.private?'medium' as const:'low' as const}))
  ];
  let events:SyncedEvent[]=[];
  try{
    const audit=await collect(prefix+'/audit-log?phrase=created:>='+new Date(Date.now()-7*86400000).toISOString().slice(0,10)+'&per_page=100','Organization audit log');
    events=audit.map(e=>({id:id('github-audit',safe(e['@timestamp'])+':'+safe(e.action)+':'+safe(e.actor)),source:'github',timestamp:typeof e['@timestamp']==='number'?new Date(e['@timestamp']).toISOString():safe(e['@timestamp']),actor:safe(e.actor),action:safe(e.action),target:safe(e.repo||e.org),severity:/remove|delete|disable|secret|permission|member/i.test(safe(e.action))?'warning':'info',summary:safe(e.action)||'Organization activity'}));
  }catch(e){warnings.push('Organization audit log: '+(e instanceof Error?e.message:'unavailable'));}
  return make('github','GitHub',identities,resources,events,warnings);
}

function make(connectorId:string,provider:string,identities:SyncedIdentity[],resources:SyncedResource[],events:SyncedEvent[],warnings:string[]):ConnectorSnapshot{
  return {connectorId,provider,syncedAt:new Date().toISOString(),counts:{identities:identities.length,resources:resources.length,events:events.length},identities,resources,events,warnings};
}
export async function syncConnector(id:string):Promise<ConnectorSnapshot>{
  const envs:Record<string,string[]>={
    entra:['ENTRA_TENANT_ID','ENTRA_CLIENT_ID','ENTRA_CLIENT_SECRET'],
    'google-workspace':['GOOGLE_WORKSPACE_SERVICE_ACCOUNT_EMAIL','GOOGLE_WORKSPACE_PRIVATE_KEY','GOOGLE_WORKSPACE_ADMIN_EMAIL'],
    okta:['OKTA_ORG_URL','OKTA_API_TOKEN'],
    'aws-iam':['AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_REGION'],
    github:['GITHUB_TOKEN','GITHUB_ORG']
  };
  if(!envs[id])throw new Error('Unknown connector');
  const missing=envs[id].filter(k=>!process.env[k]?.trim());
  if(missing.length)throw new Error('Missing environment variables: '+missing.join(', '));
  const snapshot=id==='entra'?await entra():id==='google-workspace'?await google():id==='okta'?await okta():id==='aws-iam'?await aws():await github();
  snapshots.set(id,snapshot);
  return snapshot;
}
export function getConnectorSnapshot(id:string){return snapshots.get(id)||null;}
export function listConnectorSnapshots(){return [...snapshots.values()].map(s=>({connectorId:s.connectorId,provider:s.provider,syncedAt:s.syncedAt,counts:s.counts,warnings:s.warnings}));}
export function createSyncRouter(){
  const router=(require('express') as typeof import('express')).Router();
  router.get('/snapshots',(_req:Request,res:Response)=>res.json(listConnectorSnapshots()));
  router.get('/:id/data', (req:Request,res:Response)=>{
    const snapshot=getConnectorSnapshot(req.params.id);
    if(!snapshot){res.status(404).json({error:'No snapshot yet. Run a sync first.'});return;}
    res.json(snapshot);
  });
  router.post('/:id/sync',async(req:Request,res:Response)=>{
    try{const snapshot=await syncConnector(req.params.id);res.json(snapshot);}
    catch(error){const message=error instanceof Error?error.message:'Sync failed';const status=message.startsWith('Unknown connector')?404:message.startsWith('Missing environment')?400:502;res.status(status).json({error:message});}
  });
  return router;
}
