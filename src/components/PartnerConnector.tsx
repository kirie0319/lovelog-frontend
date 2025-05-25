'use client';

import React, { useState } from 'react';
import { searchUserByInviteCode, connectPartnerByInviteCode } from '@/services/partners';
import { useAuth } from '@/contexts/AuthContext';
import { PartnerSearchResponse } from '@/types/api';
import { Search, Heart, User } from 'lucide-react';

export const PartnerConnector: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [searchResult, setSearchResult] = useState<PartnerSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { user, updateUser } = useAuth();

  const handleSearch = async () => {
    if (!inviteCode.trim()) {
      alert('招待コードを入力してください');
      return;
    }

    setLoading(true);
    try {
      const result = await searchUserByInviteCode(inviteCode.trim());
      setSearchResult(result);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'ユーザーが見つかりませんでした');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!searchResult || !searchResult.can_connect) {
      return;
    }

    setConnecting(true);
    try {
      const response = await connectPartnerByInviteCode(inviteCode);
      alert(response.message);
      
      // ユーザー情報を更新
      if (user) {
        const updatedUser = {
          ...user,
          partner_id: response.partner.user_id,
          partner: response.partner,
          has_partner: true
        };
        updateUser(updatedUser);
      }
      
      setSearchResult(null);
      setInviteCode('');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'パートナー接続に失敗しました');
    } finally {
      setConnecting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (user?.has_partner) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            パートナーと接続済み
          </h3>
          <p className="text-gray-600">
            {user.partner?.display_name} さんと接続されています
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        パートナーと接続する
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
            パートナーの招待コード
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="招待コードを入力..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !inviteCode.trim()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {searchResult && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              {searchResult.profile_image_url ? (
                <img
                  src={searchResult.profile_image_url}
                  alt={searchResult.display_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-800">{searchResult.display_name}</h4>
                <p className="text-sm text-gray-600">@{searchResult.username}</p>
              </div>
            </div>

            {searchResult.can_connect ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">
                  ✓ このユーザーと接続できます
                </p>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {connecting ? '接続中...' : 'パートナーとして接続'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                ✗ このユーザーは既に他のパートナーと接続されています
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>パートナーの招待コードを入力して検索し、接続申請を送信できます。</p>
          <p>接続が成功すると、すぐにチャットを開始できます。</p>
        </div>
      </div>
    </div>
  );
}; 