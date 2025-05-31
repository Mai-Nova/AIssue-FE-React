import { apiRequest, API_BASE_URL } from './api.js';
import { removeAuthStorage } from '../utils/auth.js';

// GitHub OAuth 콜백 처리
export async function processGithubCallback(code) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/github/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('HTTP error: ' + response.status);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('GitHub 콜백 처리 오류:', error);
    return {
      success: false,
      message: error.message || 'GitHub 로그인 처리에 실패했습니다.',
    };
  }
}

// 로그아웃
export async function logout() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/github/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '로그아웃 실패');
    }

    removeAuthStorage();
    window.location.replace('/');
    return { success: true };
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    return { success: false, message: error.message || '로그아웃에 실패했습니다.' };
  }
}

// 연동 해제
export async function unlinkGithubAccount() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/github/unlink`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // body 필요 없음 (쿠키 기반)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '연동 해제 실패');
    }

    removeAuthStorage();
    window.location.replace('/');
    return { success: true };
  } catch (error) {
    console.error('연동 해제 오류:', error);
    return { success: false, message: error.message || '연동 해제에 실패했습니다.' };
  }
}

// 계정 데이터 삭제
export async function deleteGithubAccount() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/github/delete`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // body 필요 없음 (쿠키 기반)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '계정 삭제 실패');
    }

    removeAuthStorage();
    window.location.replace('/');
    return {
      success: true,
      message: '계정 삭제가 완료되었습니다.',
    };
  } catch (error) {
    console.error('계정 삭제 오류:', error);
    return {
      success: false,
      message: error.message || '계정 삭제에 실패했습니다.',
    };
  }
}
