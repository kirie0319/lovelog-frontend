'use client';

import React, { useState, useEffect } from 'react';
import { getMyInviteCode, regenerateInviteCode } from '@/services/partners';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, RefreshCw, Share2 } from 'lucide-react';

export const InviteCodeManager: React.FC = () => {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.invite_code) {
      setInviteCode(user.invite_code);
    } else {
      loadInviteCode();
    }
  }, [user]);

  const loadInviteCode = async () => {
    try {
      const response = await getMyInviteCode();
      setInviteCode(response.invite_code);
    } catch (error) {
      console.error('Failed to load invite code:', error);
    }
  };

  const handleRegenerate = async () => {
    if (user?.has_partner) {
      alert('パートナーがいる間は招待コードを再生成できません');
      return;
    }

    setLoading(true);
    try {
      const response = await regenerateInviteCode();
      setInviteCode(response.invite_code);
      alert('招待コードが再生成されました');
    } catch (error: any) {
      alert(error.response?.data?.detail || '招待コードの再生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LoveLog 招待コード',
          text: `LoveLogで繋がりましょう！私の招待コード: ${inviteCode}`,
          url: window.location.origin
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      handleCopy();
    }
  };

  if (!inviteCode) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        あなたの招待コード
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="font-mono text-lg text-center text-gray-800 mb-2 break-all">
          {inviteCode}
        </div>
        <p className="text-sm text-gray-600 text-center">
          このコードをパートナーに共有して接続しましょう
        </p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Copy className="w-4 h-4 mr-2" />
          {copied ? 'コピー済み!' : 'コピー'}
        </button>

        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Share2 className="w-4 h-4 mr-2" />
          共有
        </button>

        <button
          onClick={handleRegenerate}
          disabled={loading || user?.has_partner}
          className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={user?.has_partner ? 'パートナーがいる間は再生成できません' : '招待コードを再生成'}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}; 