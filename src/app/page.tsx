'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">LoveLog</h1>
          <p className="text-gray-600">二人だけの特別な空間</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/register')}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            はじめる
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full border-2 border-pink-300 text-pink-500 py-4 rounded-2xl font-semibold text-lg hover:bg-pink-50 transition-all duration-300"
          >
            ログイン
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <div className="space-y-2">
            <p className="font-medium text-gray-700">✨ 新機能</p>
            <p>• 複数アカウントの同時使用が可能</p>
            <p>• UUID形式の招待コードでパートナー検索</p>
            <p>• 愛のハートパズルで絆を深める接続体験</p>
            <p>• リアルタイムメッセージング</p>
            <p>• 各セッションは独立して管理されます</p>
          </div>
        </div>
      </div>
    </div>
  );
}
