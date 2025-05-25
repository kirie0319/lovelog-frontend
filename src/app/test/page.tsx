'use client';

import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { SignupForm } from '@/components/SignupForm';
import { InviteCodeManager } from '@/components/InviteCodeManager';
import { PartnerConnector } from '@/components/PartnerConnector';
import { useAuth } from '@/contexts/AuthContext';
import { removePartner, getPartnerStatus } from '@/services/partners';
import { sendMessage, getConversation } from '@/services/messages';

export default function TestPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [partnerStatus, setPartnerStatus] = useState<any>(null);
  const { user, logout, updateUser } = useAuth();

  const handleRemovePartner = async () => {
    if (!confirm('パートナー関係を解除しますか？')) {
      return;
    }

    try {
      await removePartner();
      alert('パートナー関係が解除されました');
      
      // ユーザー情報を更新
      if (user) {
        const updatedUser = {
          ...user,
          partner_id: undefined,
          partner: undefined,
          has_partner: false
        };
        updateUser(updatedUser);
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'エラーが発生しました');
    }
  };

  const handleSendMessage = async () => {
    if (!user?.partner_id) {
      alert('パートナーが設定されていません');
      return;
    }

    try {
      await sendMessage({
        receiver_id: user.partner_id,
        content: messageContent,
        message_type: 'text'
      });
      alert('メッセージが送信されました');
      setMessageContent('');
      loadConversation();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'エラーが発生しました');
    }
  };

  const loadConversation = async () => {
    try {
      const response = await getConversation();
      setConversations(response.messages);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'エラーが発生しました');
    }
  };

  const loadPartnerStatus = async () => {
    try {
      const status = await getPartnerStatus();
      setPartnerStatus(status);
    } catch (error: any) {
      console.error('Failed to load partner status:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            {isLoginMode ? 'ログイン' : '新規登録'}
          </h1>
          
          {isLoginMode ? (
            <LoginForm 
              onSuccess={() => {}}
              onSwitchToSignup={() => setIsLoginMode(false)}
            />
          ) : (
            <SignupForm 
              onSuccess={() => {}}
              onSwitchToLogin={() => setIsLoginMode(true)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              LoveLog テストページ
            </h1>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
          
          {/* ユーザー情報 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">ユーザー情報</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>ユーザー名:</strong> {user.username}</p>
                <p><strong>表示名:</strong> {user.display_name}</p>
                <p><strong>メール:</strong> {user.email}</p>
              </div>
              <div>
                <p><strong>パートナー:</strong> {user.has_partner ? user.partner?.display_name : 'なし'}</p>
                <p><strong>招待コード:</strong> <span className="font-mono text-sm">{user.invite_code?.substring(0, 8)}...</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左列: 招待コード管理とパートナー接続 */}
          <div className="space-y-6">
            <InviteCodeManager />
            <PartnerConnector />
            
            {/* パートナー管理 */}
            {user.has_partner && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  パートナー管理
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={loadPartnerStatus}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    パートナー状態を確認
                  </button>
                  
                  {partnerStatus && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(partnerStatus, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <button
                    onClick={handleRemovePartner}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    パートナー関係を解除
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 右列: メッセージ機能 */}
          {user.has_partner && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                メッセージ機能
              </h3>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="メッセージを入力"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    送信
                  </button>
                </div>

                <button
                  onClick={loadConversation}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  会話履歴を更新
                </button>

                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                  <h4 className="font-semibold mb-2">会話履歴</h4>
                  {conversations.length === 0 ? (
                    <p className="text-gray-500">メッセージはありません</p>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((msg) => (
                        <div 
                          key={msg.message_id} 
                          className={`p-2 rounded ${
                            msg.sender_id === user.user_id 
                              ? 'bg-pink-100 ml-4' 
                              : 'bg-white mr-4'
                          }`}
                        >
                          <div className="text-xs text-gray-600 mb-1">
                            {msg.sender.display_name} - {new Date(msg.created_at).toLocaleString()}
                          </div>
                          <div className="text-sm">{msg.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>LoveLog - カップル専用チャットアプリ テスト環境</p>
          <p>新機能: 招待コードでのパートナー接続</p>
        </div>
      </div>
    </div>
  );
} 