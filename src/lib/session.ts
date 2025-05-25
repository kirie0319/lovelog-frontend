import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

export interface SessionInfo {
  sessionId: string;
  userId: string;
  username: string;
  createdAt: Date;
}

// セッション識別子を生成
export const generateSessionId = (): string => {
  return uuidv4();
};

// セッション情報をローカルストレージに保存
export const saveSessionInfo = (sessionInfo: SessionInfo): void => {
  const sessions = getStoredSessions();
  sessions[sessionInfo.sessionId] = sessionInfo;
  localStorage.setItem('lovelog_sessions', JSON.stringify(sessions));
};

// 保存されているセッション情報を取得
export const getStoredSessions = (): Record<string, SessionInfo> => {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem('lovelog_sessions');
  return stored ? JSON.parse(stored) : {};
};

// 特定のセッション情報を取得
export const getSessionInfo = (sessionId: string): SessionInfo | null => {
  const sessions = getStoredSessions();
  return sessions[sessionId] || null;
};

// セッションを削除
export const removeSession = (sessionId: string): void => {
  const sessions = getStoredSessions();
  delete sessions[sessionId];
  localStorage.setItem('lovelog_sessions', JSON.stringify(sessions));
};

// 現在のセッションIDを取得（URLから）
export const getCurrentSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const pathParts = window.location.pathname.split('/');
  if (pathParts[1] === 'session' && pathParts[2]) {
    return pathParts[2];
  }
  return null;
};

// セッション用のトークン管理
export const setSessionToken = (sessionId: string, token: string): void => {
  Cookies.set(`access_token_${sessionId}`, token, { expires: 7 });
};

export const getSessionToken = (sessionId: string): string | undefined => {
  return Cookies.get(`access_token_${sessionId}`);
};

export const removeSessionToken = (sessionId: string): void => {
  Cookies.remove(`access_token_${sessionId}`);
};

// セッションが認証済みかチェック
export const isSessionAuthenticated = (sessionId: string): boolean => {
  return !!getSessionToken(sessionId);
}; 