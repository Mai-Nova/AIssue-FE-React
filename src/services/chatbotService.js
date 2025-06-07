import api from './api.js';

// 대화 조회
async function getConversation({ repoId, userId, accessToken }) {
  return api.apiRequest(
    `/chatbot/conversation?repoId=${encodeURIComponent(repoId)}&userId=${encodeURIComponent(userId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

// 대화 생성
async function createConversation({ repoId, userId, accessToken }) {
  return api.apiRequest('/chatbot/conversation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoId, userId }),
  });
}

// 대화 삭제
async function deleteConversation({ repoId, userId, accessToken }) {
  return api.apiRequest('/chatbot/conversation', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoId, userId }),
  });
}

// 메시지 저장
async function saveChatMessage({ conversationId, senderType, content, accessToken }) {
  return api.apiRequest('/chatbot/message', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId,
      senderType,
      content,
    }),
  });
}

export default {
  getConversation,
  createConversation,
  deleteConversation,
  saveChatMessage,
};