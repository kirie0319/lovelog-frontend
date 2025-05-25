import axios from 'axios';
import { getCurrentSessionId, getSessionToken, removeSessionToken } from './session';

// APIのベースURL（環境変数で設定可能）
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（セッションベースのトークンを自動添付）
api.interceptors.request.use(
  (config) => {
    // ヘッダーに既にAuthorizationが設定されている場合はそれを優先
    if (!config.headers.Authorization) {
      const sessionId = getCurrentSessionId();
      if (sessionId) {
        const token = getSessionToken(sessionId);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（認証エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、現在のセッションのトークンを削除
      const sessionId = getCurrentSessionId();
      if (sessionId) {
        removeSessionToken(sessionId);
        // セッションベースのログインページにリダイレクト
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 