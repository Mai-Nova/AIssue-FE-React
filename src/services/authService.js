import api from './api.js';
import authUtils from '../utils/auth.js';
import errorHandler from './errorHandler.js';

// 인증 후 공통 후처리 (스토리지 삭제 및 새로고침)
function handlePostAuthCleanup() {
  authUtils.removeAuthStorage();
  window.location.reload();
}

// GitHub OAuth 콜백 처리
async function processGithubCallback(code) {
  try {
    const data = await api.apiRequest('/auth/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
      credentials: 'include',
    });
    return { success: true, data };
  } catch (error) {
    return errorHandler.handleError(error, 'GitHub 로그인 처리에 실패했습니다.');
  }
}

// 로그아웃 처리
async function logout() {
  try {
    await api.apiRequest('/auth/logout', { method: 'POST', credentials: 'include' });
  } finally {
    handlePostAuthCleanup();
  }
  return { success: true };
}

// 계정 연동 해제 처리
async function unlinkAccount() {
  try {
    await api.apiRequest('/auth/unlink', { method: 'POST', credentials: 'include' });
    handlePostAuthCleanup();
    return { success: true };
  } catch (error) {
    return errorHandler.handleError(error, '계정 연동 해제에 실패했습니다.');
  }
}

// 계정 삭제 처리
async function deleteAccount() {
  try {
    await api.apiRequest('/auth/delete', { method: 'DELETE', credentials: 'include' });
    handlePostAuthCleanup();
    return { success: true };
  } catch (error) {
    return errorHandler.handleError(error, '계정 삭제에 실패했습니다.');
  }
}

// accessToken 갱신 처리
async function refreshAccessToken() {
  try {
    const data = await api.apiRequest('/auth/token/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);

      // accessToken에서 payload 추출
      const payload = authUtils.parseJwt(data.accessToken);
      if (payload?.userId) localStorage.setItem('userId', payload.userId);
      if (payload?.username) localStorage.setItem('username', payload.username);
      if (payload?.email) localStorage.setItem('email', payload.email);
      if (payload?.avatarUrl) localStorage.setItem('avatarUrl', payload.avatarUrl);

      return { success: true, accessToken: data.accessToken };
    }
    throw new Error('토큰이 없습니다.');
  } catch (error) {
    authUtils.removeAuthStorage();
    return errorHandler.handleError(error, '토큰 갱신에 실패했습니다.');
  }
}

export default {
  processGithubCallback,
  logout,
  unlinkAccount,
  deleteAccount,
  refreshAccessToken,
};
