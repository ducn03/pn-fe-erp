import { apiClient, type ApiEnvelope } from '$core/api';
import { ENDPOINTS } from '$core/api';
import { authStore, type AuthUser } from '$core/stores';
import type { LoginRequest, LoginResponseData, UserPrincipalData } from './auth.types';

export async function login(input: LoginRequest): Promise<LoginResponseData> {
  const envelope = await apiClient.post<ApiEnvelope<LoginResponseData>>(
    ENDPOINTS.IDENTITY.LOGIN,
    input
  );

  const resData = envelope.data;

  if (resData && resData.accessToken) {
    const user = resData.user;
    const sessionUser: AuthUser = {
      id: user.userId,
      username: user.username,
      fullName: user.username === 'admin' ? 'Quản Trị Viên Hệ Thống' : user.username,
      email: `${user.username}@premiernuts.vn`,
      roles: user.roles || [],
      companyId: user.companyId
    };

    authStore.setSession(resData.accessToken, sessionUser, resData.refreshToken);
  }

  return resData;
}

export async function getCurrentUser(): Promise<UserPrincipalData> {
  const envelope = await apiClient.get<ApiEnvelope<UserPrincipalData>>(ENDPOINTS.IDENTITY.ME);
  return envelope.data;
}

export function logout() {
  authStore.logout();
}
