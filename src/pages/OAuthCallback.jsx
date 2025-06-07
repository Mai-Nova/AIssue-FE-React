import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authUtils from '../utils/auth';
import authService from '../services/authService';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      authService.processGithubCallback(code)
        .then(({ success, data }) => {
          if (success && data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);

            // accessToken에서 payload 추출
            const payload = authUtils.parseJwt(data.accessToken);
            if (payload?.userId) localStorage.setItem('userId', payload.userId);
            if (payload?.username) localStorage.setItem('username', payload.username);
            if (payload?.email) localStorage.setItem('email', payload.email);
            if (payload?.avatarUrl) localStorage.setItem('avatarUrl', payload.avatarUrl);

            window.location.replace('/dashboard');
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

  return null;
}
