import api from '@/lib/api';
import { TokenResponse, UserLogin, UserCreate, UserWithPartner } from '@/types/api';
import { 
  generateSessionId, 
  saveSessionInfo, 
  getSessionToken, 
  setSessionToken, 
  removeSessionToken, 
  isSessionAuthenticated,
  getCurrentSessionId 
} from '@/lib/session';

// 登録（セッションベース）
export const registerUser = async (userData: UserCreate): Promise<{ tokenResponse: TokenResponse; sessionId: string }> => {
  const response = await api.post<TokenResponse>('/auth/register', userData);
  
  // 新しいセッションIDを生成
  const sessionId = generateSessionId();
  
  // セッション用トークンを保存
  setSessionToken(sessionId, response.data.access_token);
  
  // セッション情報を保存
  saveSessionInfo({
    sessionId,
    userId: response.data.user.user_id.toString(),
    username: response.data.user.username,
    createdAt: new Date()
  });
  
  return { tokenResponse: response.data, sessionId };
};

// ログイン（セッションベース）
export const loginUser = async (credentials: UserLogin): Promise<{ tokenResponse: TokenResponse; sessionId: string }> => {
  const response = await api.post<TokenResponse>('/auth/login', credentials);
  
  // 新しいセッションIDを生成
  const sessionId = generateSessionId();
  
  // セッション用トークンを保存
  setSessionToken(sessionId, response.data.access_token);
  
  // セッション情報を保存
  saveSessionInfo({
    sessionId,
    userId: response.data.user.user_id.toString(),
    username: response.data.user.username,
    createdAt: new Date()
  });
  
  return { tokenResponse: response.data, sessionId };
};

// ログアウト（セッションベース）
export const logoutUser = (sessionId?: string): void => {
  const targetSessionId = sessionId || getCurrentSessionId();
  if (targetSessionId) {
    removeSessionToken(targetSessionId);
  }
};

// 現在のユーザー情報を取得（セッションベース）
export const getCurrentUser = async (sessionId?: string): Promise<UserWithPartner> => {
  const targetSessionId = sessionId || getCurrentSessionId();
  if (!targetSessionId) {
    throw new Error('No session ID found');
  }
  
  const token = getSessionToken(targetSessionId);
  if (!token) {
    throw new Error('No token found for session');
  }
  
  // APIクライアントに一時的にトークンを設定
  const response = await api.get<UserWithPartner>('/users/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

// セッションが認証済みかチェック
export const isAuthenticated = (sessionId?: string): boolean => {
  const targetSessionId = sessionId || getCurrentSessionId();
  return targetSessionId ? isSessionAuthenticated(targetSessionId) : false;
}; 