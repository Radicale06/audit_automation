import { apiWithRetry } from './config';

export interface AdminConversation {
  id: string;
  title: string;
  timestamp: Date;
  user?: {
    id: string;
    firstname: string;
    lastname: string;
  } | null;
  messageCount?: number;
}

class AdminChatService {
  async getAllConversations(): Promise<AdminConversation[]> {
    const response = await apiWithRetry.get<any>('/chat/list');
    const responseData = response.data;
    
    let conversationList: any[] = [];

    if (Array.isArray(responseData)) {
      conversationList = responseData;
    } else if (responseData && typeof responseData === 'object') {
      // Extract conversations from response data
      const arrayInData = Object.values(responseData).find(Array.isArray);
      if (arrayInData) {
        conversationList = arrayInData;
      } else {
        console.error('API response is an object but contains no array:', responseData);
        return [];
      }
    } else {
      console.error('Unexpected API response structure:', responseData);
      return [];
    }

    return conversationList.map((conv: any) => {
      const u = conv?.user ?? null;
      const mappedUser = u
        ? {
            id: u._id ?? u.id,
            firstname: u.firstname ?? '',
            lastname: u.lastname ?? '',
          }
        : null;

      return {
        id: conv._id,
        title: conv.chatName,
        timestamp: new Date(conv.createdAt),
        user: mappedUser,
      } as AdminConversation;
    });
  }

  async deleteConversation(chatId: string): Promise<void> {
    await apiWithRetry.post('/chat/delete', { chatId });
  }

  async getConversationMessages(chatId: string): Promise<any[]> {
    const response = await apiWithRetry.post('/chat/messages', { chatId });
    return (response.data as any)?.data || [];
  }
}

export const adminChatService = new AdminChatService();
