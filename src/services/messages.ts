import api from '@/lib/api';
import { getCurrentSessionId, getSessionToken } from '@/lib/session';

export interface MessageCreate {
  content: string;
  message_type?: 'text' | 'image';
  // receiver_idは不要（バックエンドで自動的にパートナーに送信される）
}

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: 'text' | 'image';
  created_at: string; // sent_at -> created_at
  is_read: boolean;
}

export interface ConversationResponse {
  messages: Array<Message & {
    sender: {
      user_id: number;
      username: string;
      display_name: string;
      profile_image_url?: string;
    };
  }>;
  unread_count: number;
  partner: {
    user_id: number;
    username: string;
    display_name: string;
    profile_image_url?: string;
  };
}

// メッセージを送信
export const sendMessage = async (messageData: MessageCreate): Promise<Message> => {
  // デバッグ用ログ
  console.log('Sending message:', messageData);
  console.log('Current session ID:', getCurrentSessionId());
  console.log('Session token exists:', !!getSessionToken(getCurrentSessionId() || ''));
  
  try {
    // バックエンドのAPIエンドポイントに合わせて修正
    const response = await api.post<Message>('/messages/', messageData);
    console.log('Message sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Send message error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};

// 会話履歴を取得
export const getConversation = async (skip: number = 0, limit: number = 50): Promise<ConversationResponse> => {
  const response = await api.get<ConversationResponse>(`/messages/conversation?skip=${skip}&limit=${limit}`);
  return response.data;
};

// メッセージを既読にする
export const markAsRead = async (messageIds: number[]): Promise<void> => {
  await api.put('/messages/read', { message_ids: messageIds });
}; 