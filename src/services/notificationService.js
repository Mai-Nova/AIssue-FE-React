// 브라우저 알림 권한 요청
async function permissionNotificationWindow() {
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다.');
    return false;
  }
  const realPermission = await Notification.requestPermission();
  console.log('허용여부', realPermission);
  if (realPermission === 'granted') {
    return true;
  } else if (realPermission === 'denied' || realPermission === 'default') {
    return false;
  }
  return false;
}

// 브라우저 알림 전송
function sendNotification(data) {
  try {
    // 데이터 검증
    if (!data || !data.type) {
      console.warn('알림 데이터가 유효하지 않습니다.');
      return;
    }

    // 브라우저 알림 권한 재확인
    if (Notification.permission !== 'granted') {
      console.warn('알림 권한이 없어 알림을 표시할 수 없습니다.');
      return;
    }

    new Notification(data.title, {
      body: `요청하신 ${data.message}`,
      tag: `${data.status}-${data.repoName}`,
    });
  } catch (error) {
    console.error('알림 표시 중 오류:', error);
  }
}

// 알림 서비스 (권한 확인 후 알림 전송)
async function notificationService(data) {
  try {
    const hasPermission = await permissionNotificationWindow();
    if (hasPermission) {
      sendNotification(data);
    } else {
      console.log('알림 권한이 없어 알림을 보낼 수 없습니다.');
    }
  } catch (error) {
    console.error('알림 서비스 오류:', error);
  }
}

export default {
  permissionNotificationWindow,
  sendNotification,
  notificationService,
};
