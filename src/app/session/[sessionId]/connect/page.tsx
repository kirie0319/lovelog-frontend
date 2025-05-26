'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ArrowLeft, UserPlus, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { searchUserByInviteCode, connectPartnerByInviteCode } from '@/services/partners';
import { PartnerSearchResponse } from '@/types/api';

interface PuzzlePiece {
  id: number;
  placed: boolean;
  x: number;
  y: number;
  correctX: number;
  correctY: number;
  color: 'blue' | 'red';
  part: 'left-half' | 'right-half';
}

export default function ConnectPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { user, updateUser } = useAuth();
  
  const [step, setStep] = useState<'input' | 'waiting' | 'puzzle' | 'completed'>('input');
  const [inviteCode, setInviteCode] = useState('');
  const [searchResult, setSearchResult] = useState<PartnerSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // パズル関連の状態
  const [myPuzzlePieces, setMyPuzzlePieces] = useState<PuzzlePiece[]>([
    { id: 1, placed: false, x: 0, y: 0, correctX: 1, correctY: 1, color: 'blue', part: 'left-half' }
  ]);
  const [partnerPuzzlePieces, setPartnerPuzzlePieces] = useState<PuzzlePiece[]>([
    { id: 2, placed: false, x: 0, y: 0, correctX: 2, correctY: 1, color: 'red', part: 'right-half' }
  ]);
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);

  // パートナーがいる場合はチャットページにリダイレクト
  useEffect(() => {
    if (user?.has_partner) {
      router.push(`/session/${sessionId}`);
    }
  }, [user, sessionId, router]);

  const handleSearch = async () => {
    if (!inviteCode.trim()) {
      alert('招待コードを入力してください');
      return;
    }

    setLoading(true);
    try {
      const result = await searchUserByInviteCode(inviteCode.trim());
      setSearchResult(result);
      
      if (result.can_connect) {
        setStep('waiting');
        // 3秒後にパズル画面に移行（実際の実装では相手の応答を待つ）
        setTimeout(() => {
          setStep('puzzle');
        }, 3000);
      } else {
        alert('このユーザーは既に他のパートナーと接続されています');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'ユーザーが見つかりませんでした';
      alert(errorMessage);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!searchResult) return;

    try {
      const response = await connectPartnerByInviteCode(inviteCode);
      
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
      
      setStep('completed');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'パートナー接続に失敗しました';
      alert(errorMessage);
    }
  };

  // パズル関連の関数
  const handleDragStart = (e: React.DragEvent, piece: PuzzlePiece) => {
    setDraggedPiece(piece);
  };

  const handleDrop = (e: React.DragEvent, targetX: number, targetY: number) => {
    e.preventDefault();
    if (!draggedPiece) return;

    const updatePieces = (pieces: PuzzlePiece[], setPieces: React.Dispatch<React.SetStateAction<PuzzlePiece[]>>) => {
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
        handleConnect();
      }, 3000);
    }

    setDraggedPiece(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // ユニークIDを生成（バックエンドのUUID形式を使用）
  const generateUniqueId = () => {
    if (user?.invite_code) {
      return user.invite_code;
    }
    return 'UUID未取得';
  };

  const handleCopyMyCode = async () => {
    if (!user?.invite_code) return;
    
    try {
      await navigator.clipboard.writeText(user.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // フォールバック：古いブラウザ用
      const textArea = document.createElement('textarea');
      textArea.value = user.invite_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ID入力画面
  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <button
            onClick={() => router.push(`/session/${sessionId}`)}
            className="mb-6 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">パートナーと接続</h2>
            <p className="text-gray-600">パートナーの招待コードを入力してください</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">パートナーの招待コード</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="招待コードを入力..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="bg-pink-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">あなたのID:</p>
                <button
                  onClick={handleCopyMyCode}
                  className="flex items-center px-2 py-1 text-xs bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copied ? 'コピー済み!' : 'コピー'}
                </button>
              </div>
              <div className="font-mono text-sm text-gray-800 break-all mb-1">
                {generateUniqueId().length > 16 
                  ? `${generateUniqueId().substring(0, 16)}...` 
                  : generateUniqueId()}
              </div>
              <p className="text-xs text-gray-600">
                このIDをパートナーに共有してください
              </p>
            </div>
            
            <button
              onClick={handleSearch}
              disabled={loading || !inviteCode.trim()}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {loading ? '検索中...' : '接続する'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 接続待機画面
  if (step === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">接続中...</h2>
            <p className="text-gray-600">
              {searchResult?.display_name}さんからの応答を待っています
            </p>
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

  // ハートパズル画面
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

  // 接続完了画面
  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">接続完了！</h2>
            <p className="text-gray-600">
              {searchResult?.display_name}さんとの絆が深まりました<br/>チャットを始めましょう
            </p>
          </div>
          <button
            onClick={() => router.push(`/session/${sessionId}`)}
            className="w-full bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            チャットを始める
          </button>
        </div>
      </div>
    );
  }

  return null;
} 