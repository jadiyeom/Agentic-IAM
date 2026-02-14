import { Identity, IdentityStateSnapshot } from '../models/Identity';
import { Role } from '../models/Role';
import { Entitlement } from '../models/Entitlement';

export interface IdentityChangeEvent {
  type: 'ROLE_ASSIGNED' | 'ROLE_REVOKED' | 'ENTITLEMENT_ASSIGNED' | 'ENTITLEMENT_REVOKED';
  identityId: string;
  payload: {
    roleId?: string;
    entitlementId?: string;
  };
  timestamp: number;
}

export interface IdentityMonitoringState {
  identities: Map<string, Identity>;
  roles: Map<string, Role>;
  entitlements: Map<string, Entitlement>;
  events: IdentityChangeEvent[];
}

export class IdentityMonitoringAgent {
    removeIdentity(identityId: string): boolean {
      if (!this.state.identities.has(identityId)) return false;
      this.state.identities.delete(identityId);
      return true;
    }
  private state: IdentityMonitoringState;

  constructor(initialState?: Partial<IdentityMonitoringState>) {
    this.state = {
      identities: initialState?.identities ?? new Map(),
      roles: initialState?.roles ?? new Map(),
      entitlements: initialState?.entitlements ?? new Map(),
      events: initialState?.events ?? [],
    };
  }

  getSnapshot(): IdentityMonitoringState {
    return {
      identities: new Map(this.state.identities),
      roles: new Map(this.state.roles),
      entitlements: new Map(this.state.entitlements),
      events: [...this.state.events],
    };
  }

  upsertRole(role: Role) {
    this.state.roles.set(role.id, role);
  }

  upsertEntitlement(entitlement: Entitlement) {
    this.state.entitlements.set(entitlement.id, entitlement);
  }

  upsertIdentity(identity: Identity) {
    this.state.identities.set(identity.id, identity);
  }

  recordSnapshot(identityId: string, snapshot: Omit<IdentityStateSnapshot, 'timestamp'> & { timestamp?: number }) {
    const identity = this.state.identities.get(identityId);
    if (!identity) return;
    const ts = snapshot.timestamp ?? Date.now();
    identity.history.push({
      ...snapshot,
      timestamp: ts,
    });
  }

  assignRole(identityId: string, roleId: string): IdentityChangeEvent | null {
    const identity = this.state.identities.get(identityId);
    if (!identity) return null;
    if (!identity.roles.includes(roleId)) {
      identity.roles.push(roleId);
    }
    const event: IdentityChangeEvent = {
      type: 'ROLE_ASSIGNED',
      identityId,
      payload: { roleId },
      timestamp: Date.now(),
    };
    this.state.events.push(event);
    return event;
  }

  revokeRole(identityId: string, roleId: string): IdentityChangeEvent | null {
    const identity = this.state.identities.get(identityId);
    if (!identity) return null;
    identity.roles = identity.roles.filter((r) => r !== roleId);
    const event: IdentityChangeEvent = {
      type: 'ROLE_REVOKED',
      identityId,
      payload: { roleId },
      timestamp: Date.now(),
    };
    this.state.events.push(event);
    return event;
  }

  assignEntitlement(identityId: string, entitlementId: string): IdentityChangeEvent | null {
    const identity = this.state.identities.get(identityId);
    if (!identity) return null;
    if (!identity.entitlements.includes(entitlementId)) {
      identity.entitlements.push(entitlementId);
    }
    const event: IdentityChangeEvent = {
      type: 'ENTITLEMENT_ASSIGNED',
      identityId,
      payload: { entitlementId },
      timestamp: Date.now(),
    };
    this.state.events.push(event);
    return event;
  }

  revokeEntitlement(identityId: string, entitlementId: string): IdentityChangeEvent | null {
    const identity = this.state.identities.get(identityId);
    if (!identity) return null;
    identity.entitlements = identity.entitlements.filter((e) => e !== entitlementId);
    const event: IdentityChangeEvent = {
      type: 'ENTITLEMENT_REVOKED',
      identityId,
      payload: { entitlementId },
      timestamp: Date.now(),
    };
    this.state.events.push(event);
    return event;
  }
}

