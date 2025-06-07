import { useState, useEffect, useRef } from 'react';
import notificationService from '../services/notificationService';

export function useNotification() {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);

  const USER_INFO = 'username';
  const NOTIFICATION_PERMISSION_KEY = 'notificationPermissionStatus';

  useEffect(() => {
    const username = localStorage.getItem(USER_INFO);
    if (!username) return;

    let reconnectTimeout = null;

    const connect = () => {
      const currentStatus = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);

      // 권한이 허용된 경우에만 연결 시도
      if (currentStatus !== 'granted') {
        console.log('알림 권한이 허용되지 않아 SSE 연결을 생략합니다.');
        setIsConnected(false);
        return;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(
        `http://localhost:3001/notification/stream/?clientName=${encodeURIComponent(
          username
        )}`,
        { withCredentials: false }
      );

      es.onopen = () => {
        console.log('SSE 연결 성공');
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const updatedStatus = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
          if (
            updatedStatus === 'granted' &&
            ['analysis_complete', 'analysis_failed', 'analysis_error'].includes(data.type)
          ) {
            notificationService.sendNotification(data);
          }
        } catch (error) {
          console.error('알림 파싱 실패:', error);
        }
      };

      es.onerror = (error) => {
        console.warn('SSE 오류 발생:', error);
        setIsConnected(false);
        es.close();
        eventSourceRef.current = null;

        // 권한이 여전히 허용된 상태에서만 재연결 시도
        const currentStatus = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
        if (currentStatus === 'granted' && !reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            connect();
          }, 3000);
        }
      };

      eventSourceRef.current = es;
    };

    connect(); // 초기 연결

    // 권한 변경 감지 핸들러
    const handlePermissionChange = () => {
      const newStatus = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      if (newStatus === 'granted') {
        connect();
      } else {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
          setIsConnected(false);
        }
      }
    };

    // 커스텀 이벤트로 권한 변경 감지
    window.addEventListener(
      'notificationPermissionChanged',
      handlePermissionChange
    );

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      window.removeEventListener(
        'notificationPermissionChanged',
        handlePermissionChange
      );
    };
  }, []);

  return { isConnected };
}
