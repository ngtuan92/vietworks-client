import api from './api';

export const sendAiChatMessage = async ({ message, messages }) => {
  const response = await api.post('/ai-chatbot/chat', { message, messages });
  return response.data;
};
