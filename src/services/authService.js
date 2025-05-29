import { apiRequest, API_BASE_URL } from './api.js';

// GitHub OAuth 콜백 처리
export async function processGithubCallback(code) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/github/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
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

// GitHub 연동 해제
export async function unlinkGithubAccount(accessToken) {
  try {
    const response = await apiRequest('/auth/github/logout', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
    window.location.replace('/');
    return {
      success: true,
      message: response.message || '연동 해제가 완료되었습니다.',
    };
  } catch (error) {
    console.error('연동 해제 오류:', error);
    return {
      success: false,
      message: error.message || '연동 해제에 실패했습니다.',
    };
  }
}

// 계정 데이터 삭제
export async function deleteGithubAccount(accessToken) {
  try {
    const response = await apiRequest('/auth/github/delete', {
      method: 'DELETE',
      body: JSON.stringify({ accessToken }),
    });
    window.location.replace('/');
    return {
      success: true,
      message: response.message || '계정 삭제가 완료되었습니다.',
    };
  } catch (error) {
    console.error('계정 삭제 오류:', error);
    return {
      success: false,
      message: error.message || '계정 삭제에 실패했습니다.',
    };
  }
}

// 로그아웃 처리
export async function logout() {
  try {
    await fetch(`${API_BASE_URL}/auth/github/logout`, {
      method: 'GET',
      credentials: 'include',
    });
    window.location.replace('/');
    return { success: true };
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    return { success: false };
  }
}
