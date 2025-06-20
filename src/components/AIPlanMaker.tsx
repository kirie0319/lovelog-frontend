'use client';

import React, { useState } from 'react';
import { X, Sparkles, Clock, DollarSign, Loader2, AlertCircle, RefreshCw, Lightbulb } from 'lucide-react';
import { getAISuggestions, testAI, AISuggestionResponse } from '@/services/ai';

interface AIPlanMakerProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect: (plan: string) => void;
}

interface AIPlan {
  title: string;
  description: string;
  schedule?: string;
  budget?: string;
  highlights?: string[];
  notes?: string[];
}

// 安全な文字列変換関数
const safeToString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

export default function AIPlanMaker({ isOpen, onClose, onPlanSelect }: AIPlanMakerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AISuggestionResponse | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<AIPlan | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const generateAIPlans = async () => {
    setLoading(true);
    setError(null);
    setAiResponse(null);
    setSelectedPlan(null);

    try {
      const response = await getAISuggestions();
      setAiResponse(response);
      
      if (response.success && response.suggestions?.plans && response.suggestions.plans.length > 0) {
        // 最初のプランを自動選択
        setSelectedPlan(response.suggestions.plans[0]);
      } else if (!response.success) {
        setError(response.error || response.message);
      } else {
        setError('AIからの提案を取得できませんでした。');
      }
    } catch (err) {
      setError('AI機能との通信に失敗しました。');
      console.error('AI generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAIFunction = async () => {
    setLoading(true);
    setError(null);
    setAiResponse(null);
    setSelectedPlan(null);

    try {
      const response = await testAI();
      setAiResponse(response);
      
      if (response.success && response.suggestions?.plans && response.suggestions.plans.length > 0) {
        setSelectedPlan(response.suggestions.plans[0]);
      } else if (!response.success) {
        setError(response.error || response.message);
      }
    } catch (err) {
      setError('AIテスト機能との通信に失敗しました。');
      console.error('AI test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = (plan: AIPlan) => {
    setSelectedPlan(plan);
  };

  const handleSendPlan = () => {
    if (selectedPlan) {
      let planMessage = `🤖 AI提案: ${safeToString(selectedPlan.title)}\n\n${safeToString(selectedPlan.description)}`;
      
      if (selectedPlan.schedule) {
        planMessage += `\n\n⏰ スケジュール: ${safeToString(selectedPlan.schedule)}`;
      }
      
      if (selectedPlan.budget) {
        planMessage += `\n💰 予算: ${safeToString(selectedPlan.budget)}`;
      }
      
      if (selectedPlan.highlights && Array.isArray(selectedPlan.highlights) && selectedPlan.highlights.length > 0) {
        planMessage += `\n\n✨ おすすめポイント:\n${selectedPlan.highlights.map(h => `• ${safeToString(h)}`).join('\n')}`;
      }
      
      if (selectedPlan.notes && Array.isArray(selectedPlan.notes) && selectedPlan.notes.length > 0) {
        planMessage += `\n\n📝 注意事項:\n${selectedPlan.notes.map(n => `• ${safeToString(n)}`).join('\n')}`;
      }
      
      planMessage += '\n\nどう思う？ 💕';
      
      onPlanSelect(planMessage);
      onClose();
    }
  };

  const resetState = () => {
    setError(null);
    setAiResponse(null);
    setSelectedPlan(null);
    setShowAnalysis(false);
    setShowDebug(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-lg font-semibold">AI Plan Maker</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={generateAIPlans}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>{loading ? 'AI分析中...' : 'AI提案を生成'}</span>
            </button>
            
            <button
              onClick={testAIFunction}
              disabled={loading}
              className="px-4 py-3 border border-purple-300 text-purple-600 rounded-full hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>テスト</span>
            </button>
            
            {aiResponse && (
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="px-4 py-3 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>分析結果</span>
              </button>
            )}
            
            {aiResponse && (
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="px-4 py-3 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <span className="text-xs">🐛</span>
                <span>デバッグ</span>
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">エラーが発生しました</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={resetState}
                  className="text-red-600 text-sm underline mt-2 hover:text-red-800"
                >
                  リセット
                </button>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {showAnalysis && aiResponse && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h3 className="text-blue-800 font-medium flex items-center space-x-2">
                <Lightbulb className="w-4 h-4" />
                <span>AI分析結果</span>
              </h3>
              
              {aiResponse.analysis && (
                <div className="text-sm text-blue-700">
                  <p><strong>話題:</strong> {aiResponse.analysis.topics?.join(', ') || '分析中'}</p>
                  <p><strong>興味:</strong> {aiResponse.analysis.interests?.join(', ') || '分析中'}</p>
                </div>
              )}
              
              {aiResponse.intent && (
                <div className="text-sm text-blue-700">
                  <p><strong>意図:</strong> {aiResponse.intent.type || '分析中'}</p>
                  {aiResponse.intent.budget && <p><strong>予算:</strong> {aiResponse.intent.budget}</p>}
                </div>
              )}
            </div>
          )}

          {/* Debug Information */}
          {showDebug && aiResponse && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="text-gray-800 font-medium flex items-center space-x-2">
                <span className="text-xs">🐛</span>
                <span>デバッグ情報</span>
              </h3>
              
              {/* エラー情報の表示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                  <h4 className="text-red-800 font-medium text-sm mb-2">エラー詳細</h4>
                  <div className="text-xs text-red-700 space-y-1">
                    <p><strong>エラーメッセージ:</strong> {error}</p>
                    {aiResponse.debug && (
                      <>
                        <p><strong>エラータイプ:</strong> {aiResponse.debug.errorType}</p>
                        {aiResponse.debug.httpStatus && (
                          <p><strong>HTTPステータス:</strong> {aiResponse.debug.httpStatus}</p>
                        )}
                        <p><strong>発生時刻:</strong> {aiResponse.debug.timestamp}</p>
                        {aiResponse.debug.responseData && (
                          <div className="mt-2">
                            <p><strong>レスポンスデータ:</strong></p>
                            <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-20">
                              {aiResponse.debug.responseData}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* 通常のレスポンス情報 */}
              <div className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto max-h-40">
                <h4 className="font-medium mb-2">完全なレスポンス:</h4>
                <pre>{JSON.stringify(aiResponse, null, 2)}</pre>
              </div>
              
              {selectedPlan && (
                <div className="text-xs text-gray-600">
                  <p><strong>選択されたプラン:</strong></p>
                  <div className="bg-white p-2 rounded border mt-1">
                    <pre>{JSON.stringify(selectedPlan, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              {/* API情報 */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <h4 className="text-blue-800 font-medium text-sm mb-2">API情報</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '未設定'}</p>
                  <p><strong>Success:</strong> {aiResponse.success ? 'Yes' : 'No'}</p>
                  <p><strong>Message:</strong> {aiResponse.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Plans Display */}
          {aiResponse?.suggestions?.plans && aiResponse.suggestions.plans.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-gray-800 font-medium">AI提案プラン</h3>
              
              {/* Plan Selection */}
              {aiResponse.suggestions.plans.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {aiResponse.suggestions.plans.map((plan, index) => (
                    <button
                      key={index}
                      onClick={() => selectPlan(plan)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedPlan === plan
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      プラン {index + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Plan Display */}
              {selectedPlan && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">✨</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{safeToString(selectedPlan.title)}</h3>
                      <span className="text-sm text-purple-600 font-medium">AI生成プラン</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-line">{safeToString(selectedPlan.description)}</p>
                  
                  {selectedPlan.schedule && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <Clock className="w-4 h-4 text-purple-500 mr-2" />
                        スケジュール
                      </h4>
                      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {safeToString(selectedPlan.schedule)}
                      </div>
                    </div>
                  )}
                  
                  {selectedPlan.budget && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                      <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                        予算
                      </h4>
                      <div className="text-sm text-gray-700">
                        {safeToString(selectedPlan.budget)}
                      </div>
                    </div>
                  )}

                  {selectedPlan.highlights && Array.isArray(selectedPlan.highlights) && selectedPlan.highlights.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <span className="text-yellow-500 mr-2">✨</span>
                        おすすめポイント
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        {selectedPlan.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-yellow-500 mt-1">•</span>
                            <div className="flex-1">
                              {safeToString(highlight).includes('http') ? (
                                <div>
                                  {safeToString(highlight).split('http').map((part, idx) => (
                                    idx === 0 ? part : (
                                      <span key={idx}>
                                        <a 
                                          href={`http${part.split(' ')[0]}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:text-blue-700 underline"
                                        >
                                          http{part.split(' ')[0]}
                                        </a>
                                        {part.substring(part.indexOf(' '))}
                                      </span>
                                    )
                                  ))}
                                </div>
                              ) : (
                                <span>{safeToString(highlight)}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPlan.notes && Array.isArray(selectedPlan.notes) && selectedPlan.notes.length > 0 && (
                    <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <span className="text-orange-500 mr-2">📝</span>
                        注意事項
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        {selectedPlan.notes.map((note, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span className="flex-1">{safeToString(note)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={generateAIPlans}
                      disabled={loading}
                      className="flex-1 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                    >
                      別の提案
                    </button>
                    <button
                      onClick={handleSendPlan}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      チャットに送信
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Getting Started Message */}
          {!loading && !error && !aiResponse && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered Date Planning</h3>
              <p className="text-gray-600 mb-4">
                AIがあなたたちの会話を分析して、<br />
                パーソナライズされたデートプランを提案します！
              </p>
              <div className="text-sm text-gray-500">
                「AI提案を生成」ボタンを押して始めましょう ✨
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI分析中...</h3>
              <p className="text-gray-600">
                会話履歴を分析して最適なプランを考えています
              </p>
            </div>
          )}

          {/* Success but no plans */}
          {!loading && aiResponse?.success && (!aiResponse.suggestions?.plans || aiResponse.suggestions.plans.length === 0) && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">プランを生成できませんでした</h3>
              <p className="text-gray-600 mb-4">
                {aiResponse.message || 'もう少し会話を重ねてから再度お試しください。'}
              </p>
              <button
                onClick={generateAIPlans}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                再試行
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 