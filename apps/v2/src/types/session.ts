// apps/v2/src/types/session.ts

/**
 * Session and audit-related type definitions
 * Migrated from:
 *   - vendor/desktop/webapp/platform/types/src/sessions.ts
 *   - vendor/desktop/webapp/platform/types/src/audits.ts
 */

import type { ITeamMembership } from "./team";

//#region Session

export type ISession = {
  id: string;
  token: string;
  create_at: number;
  expires_at: number;
  last_activity_at: number;
  user_id: string;
  device_id: string;
  roles: string;
  is_oauth: boolean;
  props: Record<string, unknown>;
  team_members: ITeamMembership[];
  local: boolean;
};

//#endregion

//#region Audit

export type IAudit = {
  id: string;
  create_at: number;
  user_id: string;
  action: string;
  extra_info: string;
  ip_address: string;
  session_id: string;
};

//#endregion
