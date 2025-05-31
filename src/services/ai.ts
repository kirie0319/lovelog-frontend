import api from '@/lib/api';

// バックエンドから返される生データの型定義
interface RawAIResponse {
  success?: boolean;
  message?: string;
  error?: string;
  analysis?: {
    topics?: unknown;
    locations?: unknown;
    interests?: unknown;
    plans?: unknown;
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
    search_keywords?: unknown;
    focus_areas?: unknown;
    tone?: string;
    constraints?: unknown;
  };
  search_results?: Record<string, unknown>;
  suggestions?: {
    plans?: unknown;
  };
}

// プランの生データ型定義
interface RawPlan {
  title?: string;
  description?: string;
  schedule?: string;
  duration?: string;
  budget?: string;
  highlights?: unknown;
  おすすめポイント?: unknown;
  notes?: unknown;
  注意事項?: unknown;
  準備すべきこと?: unknown;
}

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
  search_results?: Record<string, unknown>;
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

// 配列に変換するヘルパー関数
const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string') {
    return [value];
  }
  return [];
};

// データを正規化する関数
const normalizeAIResponse = (data: RawAIResponse): AISuggestionResponse => {
  // 基本的な構造を確保
  const normalized: AISuggestionResponse = {
    success: data.success || false,
    message: data.message || 'AI処理が完了しました',
    error: data.error
  };

  // analysisの正規化
  if (data.analysis) {
    normalized.analysis = {
      topics: toStringArray(data.analysis.topics),
      locations: toStringArray(data.analysis.locations),
      interests: toStringArray(data.analysis.interests),
      plans: toStringArray(data.analysis.plans),
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
      search_keywords: toStringArray(data.thinking.search_keywords),
      focus_areas: toStringArray(data.thinking.focus_areas),
      tone: data.thinking.tone || '',
      constraints: toStringArray(data.thinking.constraints)
    };
  }

  // search_resultsの正規化
  if (data.search_results) {
    normalized.search_results = data.search_results;
  }

  // suggestionsの正規化（最も重要）
  if (data.suggestions && data.suggestions.plans) {
    const rawPlans = Array.isArray(data.suggestions.plans) ? data.suggestions.plans : [];
    normalized.suggestions = {
      plans: rawPlans.map((plan: unknown) => {
        const rawPlan = plan as RawPlan;
        return {
          title: rawPlan.title || 'タイトルなし',
          description: rawPlan.description || '説明がありません',
          schedule: rawPlan.schedule || rawPlan.duration || '',
          budget: rawPlan.budget || '',
          highlights: toStringArray(rawPlan.highlights || rawPlan.おすすめポイント),
          notes: toStringArray(rawPlan.notes || rawPlan.注意事項 || rawPlan.準備すべきこと)
        };
      })
    };
  }

  return normalized;
};

// AIプラン提案を取得
export const getAISuggestions = async (): Promise<AISuggestionResponse> => {
  try {
    console.log('Requesting AI suggestions...');
    const response = await api.post<RawAIResponse>('/ai/suggest-plans');
    console.log('AI suggestions received:', response.data);
    
    // データを正規化
    const normalizedData = normalizeAIResponse(response.data);
    console.log('Normalized AI data:', normalizedData);
    
    return normalizedData;
  } catch (error: unknown) {
    console.error('AI suggestions error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'AI処理中にエラーが発生しました';
    const errorDetail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
    
    // エラーレスポンスを統一形式で返す
    return {
      success: false,
      error: errorDetail || errorMessage,
      message: 'AI処理中にエラーが発生しました。しばらく時間をおいて再度お試しください。'
    };
  }
};

// AIテスト機能
export const testAI = async (): Promise<AISuggestionResponse> => {
  try {
    console.log('Testing AI functionality...');
    const response = await api.post<RawAIResponse>('/ai/test');
    console.log('AI test response:', response.data);
    
    // データを正規化
    const normalizedData = normalizeAIResponse(response.data);
    console.log('Normalized AI test data:', normalizedData);
    
    return normalizedData;
  } catch (error: unknown) {
    console.error('AI test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'AIテスト中にエラーが発生しました';
    const errorDetail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
    
    return {
      success: false,
      error: errorDetail || errorMessage,
      message: 'AIテスト中にエラーが発生しました。'
    };
  }
}; 