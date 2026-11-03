export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "FINANCE"
  | "APPROVER"
  | "VIEWER";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  role: OrganizationRole | string;
}

export interface CurrentSession {
  user: CurrentUser;
  organization: OrganizationSummary;
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  organization: OrganizationSummary;
}
