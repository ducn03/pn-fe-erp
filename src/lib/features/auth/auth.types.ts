export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserPrincipalData {
  userId: number;
  username: string;
  companyId: number;
  roles: string[];
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserPrincipalData;
}
