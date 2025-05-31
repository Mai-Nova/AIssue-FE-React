import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { processGithubCallback } from '../services/authService';
import { API_BASE_URL } from '../services/api';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      fetch(`${API_BASE_URL}/auth/github/callback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then((res) => {
          if (!res.ok) {
            navigate('/login', { replace: true });
            throw new Error('HTTP error: ' + res.status);
          }
          return res.json();
        })
        .then((data) => {
          if (data.token) {
            localStorage.setItem('token', data.token);
            if (data.githubAccessToken) localStorage.setItem('githubAccessToken', data.githubAccessToken);
            if (data.username) localStorage.setItem('username', data.username);
            if (data.email) localStorage.setItem('email', data.email);
            if (data.avatarUrl) localStorage.setItem('avatarUrl', data.avatarUrl);
            window.location.replace('/profile?tab=subscription');
          } else {
            navigate('/login', { replace: true });
          }
        })
        .catch(() => {
          navigate('/login', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // 콜백 처리 중에는 아무것도 렌더링하지 않음
  return null;
}
