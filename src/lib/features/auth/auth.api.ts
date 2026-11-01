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
    let fullName = user.username;
    if (user.username === 'admin') {
      fullName = 'Quản Trị Viên Hệ Thống';
    } else if (user.username === 'director') {
      fullName = 'Đặng Thái Giám Đốc';
    }

    const sessionUser: AuthUser = {
      id: user.userId,
      username: user.username,
      fullName: fullName,
      email: `${user.username}@premiernuts.vn`,
      roles: user.roles || [],
      permissions: user.permissions || [],
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

export async function refreshSessionToken(): Promise<boolean> {
  return await authStore.refreshSession();
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.IDENTITY.LOGOUT);
  } catch {
    // ignore
  } finally {
    authStore.logout();
  }
}
