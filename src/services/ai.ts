import api from '@/lib/api';

// AI提案のレスポンス型定義
export interface AISuggestionResponse {
  success: boolean;
  analysis?: {
    topics?: string[];
    locations?: string[];
    interests?: string[];
    plans?: string[];
    tone?: string;
  };
  intent?: {
    type?: string;
    budget?: string;
    timeframe?: string;
    location_constraints?: string;
    special_requests?: string;
  };
  thinking?: {
    search_keywords?: string[];
    focus_areas?: string[];
    tone?: string;
    constraints?: string[];
  };
  search_results?: Record<string, any>;
  suggestions?: {
    plans?: Array<{
      title: string;
      description: string;
      schedule?: string;
      budget?: string;
      highlights?: string[];
      notes?: string[];
    }>;
  };
  message: string;
  error?: string;
}

// データを正規化する関数
const normalizeAIResponse = (data: any): AISuggestionResponse => {
  // 基本的な構造を確保
  const normalized: AISuggestionResponse = {
    success: data.success || false,
    message: data.message || 'AI処理が完了しました',
    error: data.error
  };

  // analysisの正規化
  if (data.analysis) {
    normalized.analysis = {
      topics: Array.isArray(data.analysis.topics) ? data.analysis.topics : [],
      locations: Array.isArray(data.analysis.locations) ? data.analysis.locations : [],
      interests: Array.isArray(data.analysis.interests) ? data.analysis.interests : [],
      plans: Array.isArray(data.analysis.plans) ? data.analysis.plans : [],
      tone: data.analysis.tone || ''
    };
  }

  // intentの正規化
  if (data.intent) {
    normalized.intent = {
      type: data.intent.type || '',
      budget: data.intent.budget || '',
      timeframe: data.intent.timeframe || '',
      location_constraints: data.intent.location_constraints || '',
      special_requests: data.intent.special_requests || ''
    };
  }

  // thinkingの正規化
  if (data.thinking) {
    normalized.thinking = {
      search_keywords: Array.isArray(data.thinking.search_keywords) ? data.thinking.search_keywords : [],
      focus_areas: Array.isArray(data.thinking.focus_areas) ? data.thinking.focus_areas : [],
      tone: data.thinking.tone || '',
      constraints: Array.isArray(data.thinking.constraints) ? data.thinking.constraints : []
    };
  }

  // search_resultsの正規化
  if (data.search_results) {
    normalized.search_results = data.search_results;
  }

  // suggestionsの正規化（最も重要）
  if (data.suggestions && data.suggestions.plans) {
    const plans = Array.isArray(data.suggestions.plans) ? data.suggestions.plans : [];
    normalized.suggestions = {
      plans: plans.map((plan: any) => ({
        title: plan.title || 'タイトルなし',
        description: plan.description || '説明がありません',
        schedule: plan.schedule || plan.duration || '',
        budget: plan.budget || '',
        highlights: Array.isArray(plan.highlights) ? plan.highlights : 
                   Array.isArray(plan.おすすめポイント) ? plan.おすすめポイント :
                   typeof plan.highlights === 'string' ? [plan.highlights] : [],
        notes: Array.isArray(plan.notes) ? plan.notes :
               Array.isArray(plan.注意事項) ? plan.注意事項 :
               Array.isArray(plan.準備すべきこと) ? plan.準備すべきこと :
               typeof plan.notes === 'string' ? [plan.notes] : []
      }))
    };
  }

  return normalized;
};

// AIプラン提案を取得
export const getAISuggestions = async (): Promise<AISuggestionResponse> => {
  try {
    console.log('Requesting AI suggestions...');
    const response = await api.post<any>('/ai/suggest-plans');
    console.log('AI suggestions received:', response.data);
    
    // データを正規化
    const normalizedData = normalizeAIResponse(response.data);
    console.log('Normalized AI data:', normalizedData);
    
    return normalizedData;
  } catch (error: any) {
    console.error('AI suggestions error:', error);
    
    // エラーレスポンスを統一形式で返す
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'AI処理中にエラーが発生しました',
      message: 'AI処理中にエラーが発生しました。しばらく時間をおいて再度お試しください。'
    };
  }
};

// AIテスト機能
export const testAI = async (): Promise<AISuggestionResponse> => {
  try {
    console.log('Testing AI functionality...');
    const response = await api.post<any>('/ai/test');
    console.log('AI test response:', response.data);
    
    // データを正規化
    const normalizedData = normalizeAIResponse(response.data);
    console.log('Normalized AI test data:', normalizedData);
    
    return normalizedData;
  } catch (error: any) {
    console.error('AI test error:', error);
    
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'AIテスト中にエラーが発生しました',
      message: 'AIテスト中にエラーが発生しました。'
    };
  }
}; 