import { apiWithRetry } from './config';
import { validateMessageText, validateChatName } from '../utils/validation';
import { messageRateLimiter, chatRateLimiter } from '../utils/rateLimit';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  user?: {
    id: string;
    firstname: string;
    lastname: string;
  } | null;
}

class ChatService {
  async getConversations(): Promise<Conversation[]> {
    return chatRateLimiter.execute('chat_get_conversations', async () => {
      const response = await apiWithRetry.get<any>('/chat/list');
      const responseData = response.data;

      let conversationList: any[] = [];

      if (Array.isArray(responseData)) {
        conversationList = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // Find the first property that is an array and assume it's the conversation list
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
        } as Conversation;
      });
    });
  }

  async createChat(chatName: string): Promise<Conversation> {
    return chatRateLimiter.execute('chat_create', async () => {
      const validationError = validateChatName(chatName);
      if (validationError) {
        throw new Error(validationError.message);
      }

      const response = await apiWithRetry.post('/chat/create', { chatName });
      const { chat } = response.data as any;
      // This assumes the backend returns a user object with _id, firstname, and lastname.
      // If not, this will need to be adjusted based on the actual API response.
      return {
        id: chat._id,
        title: chat.chatName,
        timestamp: new Date(chat.createdAt),
        user: {
          id: chat.user?._id,
          firstname: chat.user?.firstname,
          lastname: chat.user?.lastname,
        },
      };
    });
  }

  async sendMessage(chatId: string, prompt: string): Promise<Message> {
    return messageRateLimiter.execute('chat_send_message', async () => {
      const validationError = validateMessageText(prompt);
      if (validationError) {
        throw new Error(validationError.message);
      }

      const response = await apiWithRetry.post<{ message: Message }>('/chat/message', {
        chatId,
        prompt
      }, {});
      return {
        ...response.data.message,
        timestamp: new Date(response.data.message.timestamp)
      };
    });
  }

  async deleteConversation(id: string): Promise<void> {
    await apiWithRetry.post(`/chat/delete`, { chatId: id });
  }

  async getConversationMessages(chatId: string): Promise<Message[]> {
    return chatRateLimiter.execute(`chat_get_messages_${chatId}`, async () => {
      const response = await apiWithRetry.post(`/chat/messages`, {
        chatId, page: 1
      });
      const { data } = response.data as any;

      return data.map((msg: any) => ({
        id: msg._id,
        text: msg.message,
        sender: msg.type,
        timestamp: new Date(msg.createdAt)
      }));
    });
  }
}

export const chatService = new ChatService();
