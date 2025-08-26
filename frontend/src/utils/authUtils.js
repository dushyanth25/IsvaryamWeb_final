export function getToken() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    // Optional: check expiration if stored
    if (!user.token) {
      localStorage.removeItem('user');
      return null;
    }
    return user.token;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}
