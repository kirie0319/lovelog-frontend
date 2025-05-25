'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Lock, UserPlus } from 'lucide-react';
import { registerUser } from '@/services/auth';
import { UserCreate } from '@/types/api';
import { SessionInfo, saveSessionInfo, setSessionToken } from '@/lib/session';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    email: '',
    password: '',
    display_name: '',
    profile_image_url: undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { tokenResponse, sessionId } = await registerUser(formData);
      
      // セッション情報を保存
      const sessionInfo: SessionInfo = {
        sessionId,
        userId: tokenResponse.user.user_id.toString(),
        username: tokenResponse.user.username,
        createdAt: new Date()
      };
      
      saveSessionInfo(sessionInfo);
      setSessionToken(sessionId, tokenResponse.access_token);
      
      // チャットページにリダイレクト
      router.push(`/session/${sessionId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '登録に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">アカウント作成</h2>
          <p className="text-gray-600">新しいアカウントを作成してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              ユーザー名
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="ユーザー名"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="メールアドレス"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              表示名
            </label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleInputChange}
              placeholder="表示名"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              パスワード
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="パスワード"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !formData.username.trim() || !formData.email.trim() || !formData.display_name.trim() || !formData.password.trim()}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                登録中...
              </div>
            ) : (
              'アカウント作成'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            既にアカウントをお持ちの方は{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-pink-500 hover:text-pink-600 font-medium"
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 