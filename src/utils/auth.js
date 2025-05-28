// 로컬스토리지에서 인증 정보 제거
export const removeAuthStorage = () => {
  const itemsToRemove = [
    'token',
    'accessToken',
    'username',
    'email',
    'avatarUrl',
  ];

  itemsToRemove.forEach((item) => {
    localStorage.removeItem(item);
  });
};

// 현재 로그인 상태 확인
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = () => {
  return {
    token: localStorage.getItem('token'),
    accessToken: localStorage.getItem('accessToken'),
    username: localStorage.getItem('username'),
    email: localStorage.getItem('email'),
    avatarUrl: localStorage.getItem('avatarUrl'),
  };
};
