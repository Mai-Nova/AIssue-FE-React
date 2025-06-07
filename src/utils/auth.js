// JWT 토큰을 파싱하여 payload(JSON) 반환
function parseJwt(token) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// 인증 관련 localStorage 항목 삭제
function removeAuthStorage() {
  // 삭제할 항목들을 배열로 관리
  const itemsToRemove = [
    'userId',
    'accessToken',
    'username',
    'email',
    'avatarUrl',
  ];
  itemsToRemove.forEach((item) => localStorage.removeItem(item));
}

// 로그인 상태 확인 (토큰 존재 및 만료 여부)
function isLoggedIn() {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  try {
    const [, payload] = token.split('.');
    if (!payload) return false;
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const { exp } = JSON.parse(atob(base64));
    if (!exp) return false;
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

export default {
  removeAuthStorage,
  isLoggedIn,
  parseJwt,
};