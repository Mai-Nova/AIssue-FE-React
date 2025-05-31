export function removeAuthStorage() {
  // 삭제할 항목들을 배열로 관리
  const itemsToRemove = [
    'token',
    'accessToken',
    'username',
    'email',
    'avatarUrl',
  ];
  itemsToRemove.forEach((item) => localStorage.removeItem(item));
}

export function isLoggedIn() {
  return !!localStorage.getItem('token');
}