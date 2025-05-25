'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, User, Lock } from 'lucide-react';
import { loginUser } from '@/services/auth';
import { UserLogin } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserLogin>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { tokenResponse, sessionId } = await loginUser(formData);
      
      // セッション識別子を含むURLにリダイレクト
      router.push(`/session/${sessionId}`);
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.response?.data?.detail || 'ログインに失敗しました');
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
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">おかえりなさい</h2>
          <p className="text-gray-600">アカウントにログインしてください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              ユーザー名またはメールアドレス
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="ユーザー名またはメールアドレス"
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
            disabled={loading || !formData.username.trim() || !formData.password.trim()}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ログイン中...
              </div>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            アカウントをお持ちでない方は{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-pink-500 hover:text-pink-600 font-medium"
            >
              新規登録
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 