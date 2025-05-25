'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { getSessionInfo, isSessionAuthenticated } from '@/lib/session';

interface SessionLayoutProps {
  children: React.ReactNode;
}

export default function SessionLayout({ children }: SessionLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const sessionId = params.sessionId as string;

  useEffect(() => {
    if (!sessionId) {
      router.push('/login');
      return;
    }

    // セッションの有効性をチェック
    const sessionInfo = getSessionInfo(sessionId);
    const isAuthenticated = isSessionAuthenticated(sessionId);

    if (!sessionInfo || !isAuthenticated) {
      // 無効なセッションの場合、ログインページにリダイレクト
      router.push('/login');
      return;
    }

    setIsValidSession(true);
  }, [sessionId, router]);

  // セッション検証中はローディング表示
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">セッションを確認中...</p>
        </div>
      </div>
    );
  }

  // 有効なセッションの場合、AuthProviderでラップして子コンポーネントを表示
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
} 