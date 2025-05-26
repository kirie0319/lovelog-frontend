'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Send, Smile, Image as ImageIcon, MoreVertical, Settings as SettingsIcon, Sparkles, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, getConversation } from '@/services/messages';
import Settings from '@/components/Settings';
import EmojiPicker from '@/components/EmojiPicker';
import AIPlanMaker from '@/components/AIPlanMaker';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'partner';
  timestamp: Date;
  time: string;
  type: 'text' | 'image';
}

export default function SessionChatPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // パートナーがいない場合は接続ページにリダイレクト
  useEffect(() => {
    if (!loading && user && !user.has_partner) {
      router.push(`/session/${sessionId}/connect`);
    }
  }, [user, loading, sessionId, router]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const [newMessage, setNewMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAIPlanMaker, setShowAIPlanMaker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージを読み込む
  const loadMessages = useCallback(async () => {
    if (!user?.has_partner) return;
    
    try {
      const conversation = await getConversation();
      const formattedMessages: Message[] = conversation.messages.map(msg => ({
        id: msg.message_id.toString(),
        text: msg.content,
        sender: msg.sender_id === user.user_id ? 'me' : 'partner',
        timestamp: new Date(msg.created_at),
        time: new Date(msg.created_at).toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: msg.message_type as 'text' | 'image'
      }));
      setMessages(formattedMessages.reverse()); // 最新が下に来るように
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.has_partner) {
      loadMessages();
      
      // 定期的にメッセージを更新（簡易的なリアルタイム機能）
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user?.has_partner, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToAPI = async () => {
    if (!newMessage.trim() || !user?.has_partner || sendingMessage) return;

    setSendingMessage(true);
    try {
      await sendMessage({
        content: newMessage.trim(),
        message_type: 'text'
      });
      
      setNewMessage('');
      // メッセージを再読み込み
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('メッセージの送信に失敗しました');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageToAPI();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handlePlanSelect = (plan: string) => {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const message: Message = {
      id: Date.now().toString(),
      text: plan,
      sender: 'me',
      timestamp: now,
      time,
      type: 'text'
    };
    setMessages(prev => [...prev, message]);
  };

  if (messagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <p className="text-gray-600">ユーザー情報を取得できませんでした</p>
        </div>
      </div>
    );
  }

  const partnerName = user.partner?.display_name || 'パートナー';

  // ユニークIDを生成（バックエンドのUUID形式を使用）
  const generateUniqueId = () => {
    if (user?.invite_code) {
      return user.invite_code;
    }
    return 'UUID未取得';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen flex flex-col relative">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-semibold">{partnerName}</h1>
              <p className="text-sm opacity-90">オンライン</p>
              <p className="text-xs opacity-75">ID: {generateUniqueId().substring(0, 8)}...</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAIPlanMaker(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg py-2 w-48 z-50">
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>設定</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/session/${sessionId}/connect`);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>パートナー管理</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      if (confirm('ログアウトしますか？')) {
                        router.push('/login');
                      }
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>ログアウト</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                'flex',
                message.sender === 'me' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={clsx(
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl',
                  message.sender === 'me'
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                )}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={clsx(
                    'text-xs mt-1',
                    message.sender === 'me' ? 'text-white/70' : 'text-gray-500'
                  )}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                className="w-full p-3 pr-20 border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:outline-none resize-none"
                rows={1}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-gray-400 hover:text-pink-500 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button className="p-1 text-gray-400 hover:text-pink-500 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              onClick={sendMessageToAPI}
              disabled={!newMessage.trim()}
              className="p-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 絵文字ピッカー */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50">
            <EmojiPicker
              isOpen={showEmojiPicker}
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}

        {/* 設定モーダル */}
        {showSettings && (
          <Settings
            isOpen={showSettings}
            myName={user?.display_name || 'Me'}
            partnerName={user?.partner?.display_name || 'パートナー'}
            onClose={() => setShowSettings(false)}
            onUpdateNames={() => {
              // TODO: ユーザー情報の更新処理
              setShowSettings(false);
            }}
          />
        )}

        {/* AI プランメーカー */}
        {showAIPlanMaker && (
          <AIPlanMaker
            isOpen={showAIPlanMaker}
            onClose={() => setShowAIPlanMaker(false)}
            onPlanSelect={handlePlanSelect}
          />
        )}
      </div>
    </div>
  );
} 