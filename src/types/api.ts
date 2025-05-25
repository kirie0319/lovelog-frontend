// ユーザー関連の型定義
export interface UserPublic {
  user_id: number;
  username: string;
  display_name: string;
  profile_image_url?: string;
}

export interface UserWithPartner {
  user_id: number;
  username: string;
  email: string;
  display_name: string;
  profile_image_url?: string;
  partner_id?: number;
  partner?: UserPublic;
  has_partner: boolean;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  display_name: string;
  profile_image_url?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

// 認証関連の型定義
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserWithPartner;
}

// 招待コード関連の型定義
export interface InviteCodeResponse {
  invite_code: string;
  message: string;
}

// パートナー検索・接続関連の型定義
export interface PartnerSearchResponse {
  user_id: number;
  username: string;
  display_name: string;
  profile_image_url?: string;
  invite_code: string;
  can_connect: boolean;
}

export interface PartnerConnectByCode {
  invite_code: string;
}

export interface PartnerConnectById {
  partner_id: number;
}

export interface PartnerConnectResponse {
  message: string;
  partner: UserPublic;
  chat_ready: boolean;
}

export interface PartnerStatusResponse {
  has_partner: boolean;
  partner?: UserPublic;
  can_chat: boolean;
  message: string;
}

// メッセージ関連の型定義
export interface MessageCreate {
  receiver_id: number;
  content: string;
  message_type?: string;
  file_url?: string;
}

export interface MessageWithSender {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: string;
  file_url?: string;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender: UserPublic;
}

export interface ConversationResponse {
  messages: MessageWithSender[];
  unread_count: number;
  partner: UserPublic;
}

export interface MessageReadUpdate {
  message_ids: number[];
}

// パートナー関連の型定義（旧バージョン）
export interface PartnerRequest {
  partner_username: string;
}

// APIエラーレスポンス
export interface APIError {
  detail: string;
} 