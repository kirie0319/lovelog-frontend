'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, Send, Smile, Image as ImageIcon, MoreVertical, Settings as SettingsIcon, Sparkles, User, UserPlus, ArrowLeft, Check } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import Settings from '../components/Settings';
import EmojiPicker from '../components/EmojiPicker';
import AIPlanMaker from '../components/AIPlanMaker';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'partner';
  timestamp: Date;
  time: string;
  type: 'text' | 'image';
}

export default function LoveLogApp() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState({ name: '', partnerId: '', isConnected: false });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'こんにちは！',
      sender: 'partner',
      timestamp: new Date(Date.now() - 3600000),
      time: '14:20',
      type: 'text'
    },
    {
      id: '2',
      text: 'お疲れ様！今日はどうだった？',
      sender: 'me',
      timestamp: new Date(Date.now() - 3000000),
      time: '14:22',
      type: 'text'
    },
    {
      id: '3',
      text: '今日は会議が多くて疲れちゃった💦',
      sender: 'partner',
      timestamp: new Date(Date.now() - 1800000),
      time: '14:25',
      type: 'text'
    },
    {
      id: '4',
      text: 'お疲れ様！今日は早く帰ってゆっくりしよう😊',
      sender: 'me',
      timestamp: new Date(Date.now() - 900000),
      time: '14:27',
      type: 'text'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [partnerName, setPartnerName] = useState('パートナー');
  const [myName, setMyName] = useState('Me');
  const [showSettings, setShowSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAIPlanMaker, setShowAIPlanMaker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRegister = (name: string) => {
    setUser({ ...user, name });
    setCurrentScreen('connect');
  };

  const handleConnect = (partnerId: string) => {
    setUser({ ...user, partnerId, isConnected: true });
    setCurrentScreen('chat');
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const now = new Date();
      const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'me',
        timestamp: now,
        time,
        type: 'text'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleUpdateNames = (myName: string, partnerName: string) => {
    setMyName(myName);
    setPartnerName(partnerName);
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

  const WelcomeScreen = () => (
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
            onClick={() => setCurrentScreen('register')}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            はじめる
          </button>
          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full border-2 border-pink-300 text-pink-500 py-4 rounded-2xl font-semibold text-lg hover:bg-pink-50 transition-all duration-300"
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  );

  const RegisterScreen = () => {
    const [name, setName] = useState('');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <button
            onClick={() => setCurrentScreen('welcome')}
            className="mb-6 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">アカウント作成</h2>
            <p className="text-gray-600">あなたのお名前を教えてください</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">お名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田太郎"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
              />
            </div>
            
            <button
              onClick={() => name.trim() && handleRegister(name)}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <button
            onClick={() => setCurrentScreen('welcome')}
            className="mb-6 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ログイン</h2>
            <p className="text-gray-600">アカウントにログインしてください</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
              />
            </div>
            
            <button
              onClick={() => setCurrentScreen('chat')}
              disabled={!email.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              ログイン
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ConnectScreen = () => {
    const [partnerId, setPartnerId] = useState('');
    const [step, setStep] = useState('connect');
    const [myPuzzlePieces, setMyPuzzlePieces] = useState([
      { id: 1, placed: false, x: 0, y: 0, correctX: 1, correctY: 1, color: 'blue', part: 'left-half' }
    ]);
    const [partnerPuzzlePieces, setPartnerPuzzlePieces] = useState([
      { id: 2, placed: false, x: 0, y: 0, correctX: 2, correctY: 1, color: 'red', part: 'right-half' }
    ]);
    const [draggedPiece, setDraggedPiece] = useState<any>(null);
    const [puzzleCompleted, setPuzzleCompleted] = useState(false);

    const handleDragStart = (e: any, piece: any) => {
      setDraggedPiece(piece);
    };

    const handleDrop = (e: any, targetX: number, targetY: number) => {
      e.preventDefault();
      if (draggedPiece) {
        const updatePieces = (pieces: any[], setPieces: any) => {
          const newPieces = pieces.map(piece => {
            if (piece.id === draggedPiece.id) {
              const isCorrect = piece.correctX === targetX && piece.correctY === targetY;
              return { ...piece, x: targetX, y: targetY, placed: isCorrect };
            }
            return piece;
          });
          setPieces(newPieces);
          return newPieces;
        };

        let updatedMyPieces = myPuzzlePieces;
        let updatedPartnerPieces = partnerPuzzlePieces;

        if (draggedPiece.color === 'blue') {
          updatedMyPieces = updatePieces(myPuzzlePieces, setMyPuzzlePieces);
        } else {
          updatedPartnerPieces = updatePieces(partnerPuzzlePieces, setPartnerPuzzlePieces);
        }
        
        const allPlaced = [...updatedMyPieces, ...updatedPartnerPieces].every(piece => piece.placed);
        if (allPlaced && !puzzleCompleted) {
          setPuzzleCompleted(true);
          setTimeout(() => {
            setStep('completed');
          }, 3000);
        }
      }
      setDraggedPiece(null);
    };

    const handleDragOver = (e: any) => {
      e.preventDefault();
    };

    const handleConnectSubmit = () => {
      if (partnerId.trim()) {
        setStep('waiting');
        setTimeout(() => {
          setStep('puzzle');
        }, 3000);
      }
    };

    if (step === 'connect') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <button
              onClick={() => setCurrentScreen('register')}
              className="mb-6 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">パートナーと接続</h2>
              <p className="text-gray-600">パートナーのIDを入力してください</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">パートナーID</label>
                <input
                  type="text"
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  placeholder="LOVE12345"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
                />
              </div>
              
              <div className="bg-pink-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong>あなたのID:</strong> LOVE67890<br/>
                  このIDをパートナーに共有してください
                </p>
              </div>
              
              <button
                onClick={handleConnectSubmit}
                disabled={!partnerId.trim()}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                接続する
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (step === 'waiting') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
            <div className="mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">接続中...</h2>
              <p className="text-gray-600">パートナーからの応答を待っています</p>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      );
    }

    if (step === 'puzzle') {
      const allPieces = [...myPuzzlePieces, ...partnerPuzzlePieces];
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">愛のハートパズル</h2>
              <p className="text-gray-600">青と赤のハートピースを組み合わせて<br/>一つの愛を完成させましょう</p>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-2 gap-0 w-48 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl p-4">
                {[1, 2].map((_, index) => {
                  const x = index + 1;
                  const y = 1;
                  const placedPiece = allPieces.find(p => p.x === x && p.y === y && p.placed);
                  
                  return (
                    <div
                      key={index}
                      className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden"
                      onDrop={(e) => handleDrop(e, x, y)}
                      onDragOver={handleDragOver}
                    >
                      {placedPiece && (
                        <div className={`w-full h-full flex items-center justify-center text-white font-bold text-4xl ${
                          puzzleCompleted ? 'animate-pulse' : ''
                        } ${
                          placedPiece.color === 'blue' 
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 rounded-l-lg' 
                            : 'bg-gradient-to-br from-red-400 to-red-600 rounded-r-lg'
                        }`}>
                          {placedPiece.part === 'left-half' ? '💙' : '❤️'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 text-center">あなたのピース（青）</p>
                <div className="flex justify-center space-x-3">
                  {myPuzzlePieces.filter(piece => !piece.placed).map((piece) => (
                    <div
                      key={piece.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, piece)}
                      className="w-16 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-l-2xl flex items-center justify-center text-white font-bold text-2xl cursor-move hover:scale-110 transition-transform shadow-lg"
                    >
                      💙
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2 text-center">パートナーのピース（赤）</p>
                <div className="flex justify-center space-x-3">
                  {partnerPuzzlePieces.filter(piece => !piece.placed).map((piece) => (
                    <div
                      key={piece.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, piece)}
                      className="w-16 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-r-2xl flex items-center justify-center text-white font-bold text-2xl cursor-move hover:scale-110 transition-transform shadow-lg"
                    >
                      ❤️
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {puzzleCompleted && (
              <div className="text-center">
                <div className="animate-bounce mb-4">
                  <div className="flex justify-center items-center space-x-1">
                    <Heart className="w-8 h-8 text-blue-500" />
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <p className="text-pink-600 font-semibold">素晴らしい！二人の愛が一つになりました ✨</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (step === 'completed') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
            <div className="mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">接続完了！</h2>
              <p className="text-gray-600">パートナーとの絆が深まりました<br/>チャットを始めましょう</p>
            </div>
            <button
              onClick={() => handleConnect(partnerId)}
              className="w-full bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              チャットを始める
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const ChatScreen = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <div className="bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{partnerName}</h1>
              <p className="text-sm opacity-80">オンライン</p>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-10">
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-pink-50 flex items-center space-x-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>設定</span>
                </button>
                <button
                  onClick={() => {
                    setShowAIPlanMaker(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-pink-50 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI プランメーカー</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'me'
                  ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white'
                  : 'bg-white shadow-md text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-white opacity-70' : 'text-gray-500'}`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-gray-200 relative">
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-pink-500 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowAIPlanMaker(true)}
            className="p-2 text-purple-500 hover:text-purple-600 transition-colors relative"
            title="AI Plan Maker"
          >
            <Sparkles className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1 p-3 border-2 border-gray-200 rounded-full focus:border-pink-400 focus:outline-none transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={handleEmojiSelect}
        />
      </div>

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        partnerName={partnerName}
        myName={myName}
        onUpdateNames={handleUpdateNames}
      />

      <AIPlanMaker
        isOpen={showAIPlanMaker}
        onClose={() => setShowAIPlanMaker(false)}
        onPlanSelect={handlePlanSelect}
      />

      {showMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );

  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'register':
      return <RegisterScreen />;
    case 'login':
      return <LoginScreen />;
    case 'connect':
      return <ConnectScreen />;
    case 'chat':
      return <ChatScreen />;
    default:
      return <WelcomeScreen />;
  }
}
