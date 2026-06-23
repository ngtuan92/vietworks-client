import api from './api';

export const getConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export const getUnreadMessageCount = async () => {
  const response = await api.get('/conversations/unread-count');
  return response.data;
};

export const getOrCreateConversation = async (applicationId, jobseekerId = null) => {
  const payload = {};
  if (applicationId) payload.applicationId = applicationId;
  if (jobseekerId) payload.jobseekerId = jobseekerId;
  const response = await api.post('/conversations', payload);
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendMessage = async (conversationId, payload) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, payload);
  return response.data;
};

export const markAsRead = async (conversationId) => {
  const response = await api.patch(`/conversations/${conversationId}/read`);
  window.dispatchEvent(new CustomEvent('vietworks:chat-read'));
  return response.data;
};

export const uploadChatFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads/chat-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
