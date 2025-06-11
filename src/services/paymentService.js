import api from './api.js';
import errorHandler from './errorHandler.js';

// 결제/플랜 상태 조회
async function paymentStatus() {
  try {
    const data = await api.apiRequest('/payment/status', {
      credentials: 'include',
    });
    return { success: true, data };
  } catch (error) {
    return errorHandler.handleError(error, '결제 상태 조회에 실패했습니다.');
  }
}

async function getMonthlyUsage() {
  return api.apiRequest('/payment/monthly-usage', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
}

async function increaseAiMessageCount() {
  return api.apiRequest('/payment/increase-ai-message', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
}

export default {
  paymentStatus,
  getMonthlyUsage,
  increaseAiMessageCount,
};