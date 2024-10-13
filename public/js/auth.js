function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to login if no token is found
    window.location.href = '/login';
    return;
  }

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
}
