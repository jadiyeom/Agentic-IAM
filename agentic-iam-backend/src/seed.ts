import { Identity } from './models/Identity';
import { Role } from './models/Role';
import { Entitlement } from './models/Entitlement';
import { Policy } from './models/Policy';

export function seedRoles(): Role[] {
  return [
    {
      id: 'role-intern-engineer',
      name: 'Engineering Intern',
      description: 'Basic engineering intern role with limited access to dev resources.',
      sensitivity: 'LOW',
      domains: ['DEV_CODE_REPO'],
    },
    {
      id: 'role-software-engineer',
      name: 'Software Engineer',
      description: 'Standard software engineer role with access to development and staging.',
      sensitivity: 'MEDIUM',
      domains: ['DEV_CODE_REPO', 'STAGING_APP'],
    },
    {
      id: 'role-prod-db-admin',
      name: 'Production Database Admin',
      description: 'Full administrative access to production databases.',
      sensitivity: 'CRITICAL',
      domains: ['PRODUCTION_DB', 'CUSTOMER_DATA'],
    },
    {
      id: 'role-finance-analyst',
      name: 'Finance Analyst',
      description: 'Read/write access to financial systems.',
      sensitivity: 'HIGH',
      domains: ['FINANCE_SYSTEM'],
    },
    {
      id: 'role-finance-approver',
      name: 'Finance Approver',
      description: 'Approves financial transactions.',
      sensitivity: 'HIGH',
      domains: ['FINANCE_SYSTEM'],
    },
  ];
}

export function seedEntitlements(): Entitlement[] {
  return [
    {
      id: 'ent-dev-read',
      name: 'Dev Repo Read',
      description: 'Read access to development repositories.',
      category: 'GIT',
      resource: 'dev-repo',
    },
    {
      id: 'ent-prod-db-superuser',
      name: 'Prod DB Superuser',
      description: 'Superuser on production database.',
      category: 'DATABASE',
      resource: 'prod-db',
    },
  ];
}

export function seedIdentities(): Identity[] {
  return [
    {
      id: 'id-ishwari',
      name: 'Ishwari',
      attributes: {
        department: 'Platform',
        title: 'Production Database Admin',
        seniority: 'SENIOR',
        employmentType: 'FULL_TIME',
        location: 'NYC',
      },
      roles: ['role-prod-db-admin'],
      entitlements: ['ent-prod-db-superuser'],
      history: [],
    },
    {
      id: 'id-praniti',
      name: 'Praniti',
      attributes: {
        department: 'Finance',
        title: 'Finance Approver',
        seniority: 'SENIOR',
        employmentType: 'FULL_TIME',
        location: 'Remote',
      },
      roles: ['role-finance-approver'],
      entitlements: [],
      history: [],
    },
    {
      id: 'id-chirag',
      name: 'Chirag',
      attributes: {
        department: 'Engineering',
        title: 'Software Engineer',
        seniority: 'MID',
        employmentType: 'FULL_TIME',
        location: 'NYC',
      },
      roles: ['role-software-engineer'],
      entitlements: ['ent-dev-read'],
      history: [],
    },
    {
      id: 'id-om',
      name: 'Om',
      attributes: {
        department: 'Engineering',
        title: 'Engineering Intern',
        seniority: 'INTERN',
        employmentType: 'INTERN',
        location: 'NYC',
      },
      roles: ['role-intern-engineer'],
      entitlements: ['ent-dev-read'],
      history: [],
    },
    {
      id: 'id-5',
      name: 'Aarav',
      attributes: {
        department: 'Engineering',
        title: 'Software Engineer',
        seniority: 'JUNIOR',
        employmentType: 'FULL_TIME',
        location: 'NYC',
      },
      roles: ['role-software-engineer'],
      entitlements: ['ent-dev-read'],
      history: [],
    },
    {
      id: 'id-6',
      name: 'Meera',
      attributes: {
        department: 'Finance',
        title: 'Finance Analyst',
        seniority: 'MID',
        employmentType: 'FULL_TIME',
        location: 'Remote',
      },
      roles: ['role-finance-analyst'],
      entitlements: [],
      history: [],
    },
    {
      id: 'id-7',
      name: 'Rohan',
      attributes: {
        department: 'Platform',
        title: 'Database Admin',
        seniority: 'SENIOR',
        employmentType: 'FULL_TIME',
        location: 'NYC',
      },
      roles: ['role-prod-db-admin'],
      entitlements: ['ent-prod-db-superuser'],
      history: [],
    },
    {
      id: 'id-8',
      name: 'Sneha',
      attributes: {
        department: 'Engineering',
        title: 'Software Engineer',
        seniority: 'MID',
        employmentType: 'FULL_TIME',
        location: 'Remote',
      },
      roles: ['role-software-engineer'],
      entitlements: ['ent-dev-read'],
      history: [],
    },
    {
      id: 'id-9',
      name: 'Vikram',
      attributes: {
        department: 'Finance',
        title: 'Finance Approver',
        seniority: 'SENIOR',
        employmentType: 'FULL_TIME',
        location: 'Remote',
      },
      roles: ['role-finance-approver'],
      entitlements: [],
      history: [],
    },
    {
      id: 'id-10',
      name: 'Priya',
      attributes: {
        department: 'Engineering',
        title: 'Engineering Intern',
        seniority: 'INTERN',
        employmentType: 'INTERN',
        location: 'NYC',
      },
      roles: ['role-intern-engineer'],
      entitlements: ['ent-dev-read'],
      history: [],
    },
  ];
}

export function seedPolicies(): Policy[] {
  return [
    {
      id: 'policy-least-privilege',
      name: 'Least Privilege by Domain Spread',
      type: 'LEAST_PRIVILEGE',
      description:
        'Flags identities with much broader domain coverage than peers with similar department and seniority.',
      config: {},
    },
    {
      id: 'policy-sod-finance',
      name: 'Finance SoD: Analyst vs Approver',
      type: 'SOD',
      description: 'Prevents a single identity from both initiating and approving financial transactions.',
      config: {
        conflictingRoles: [['role-finance-analyst', 'role-finance-approver']],
      },
    },
    {
      id: 'policy-role-eligibility',
      name: 'Role Eligibility by Seniority and Employment Type',
      type: 'ROLE_ELIGIBILITY',
      description:
        'Controls eligibility for highly sensitive roles based on seniority, employment type, and department.',
      config: {
        rules: [
          {
            roleId: 'role-prod-db-admin',
            minSeniority: 'SENIOR',
            allowedEmploymentTypes: ['FULL_TIME'],
            allowedDepartments: ['Platform', 'Security'],
          },
        ],
      },
    },
  ];
}

