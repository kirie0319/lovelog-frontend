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
  debug?: {
    errorType: string;
    httpStatus?: number;
    responseData?: string;
    timestamp: string;
  };
}

// 配列に変換するヘルパー関数
const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') {
        return item;
      } else if (typeof item === 'object' && item !== null) {
        // オブジェクトの場合は適切な文字列に変換
        return JSON.stringify(item);
      } else {
        return String(item);
      }
    });
  }
  if (typeof value === 'string') {
    return [value];
  }
  if (typeof value === 'object' && value !== null) {
    // オブジェクトの場合は文字列化
    return [JSON.stringify(value)];
  }
  if (value !== null && value !== undefined) {
    return [String(value)];
  }
  return [];
};

// 安全な文字列変換関数
const safeStringify = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[オブジェクト]';
    }
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

// プランを構造化データから読みやすい形式に変換する関数
const formatPlanData = (rawData: unknown): { title: string; description: string; schedule?: string; budget?: string; highlights?: string[]; notes?: string[] } => {
  // 文字列の場合はJSONとして解析を試みる
  if (typeof rawData === 'string') {
    try {
      const parsed = JSON.parse(rawData);
      return formatPlanData(parsed);
    } catch {
      return {
        title: 'AI提案プラン',
        description: rawData
      };
    }
  }

  // 配列の場合は、時間とアクティビティの組み合わせとして処理
  if (Array.isArray(rawData)) {
    const activities: string[] = [];
    let totalTime = '';
    let estimatedBudget = '';
    const highlights: string[] = [];

    rawData.forEach((item: any) => {
      if (typeof item === 'object' && item !== null) {
        // 時間とアクティビティのペア
        if (item.time && item.activity) {
          activities.push(`${item.time}: ${item.activity}`);
          if (item.remarks) {
            highlights.push(item.remarks);
          }
        }
        // 場所情報
        if (item.place && item.address) {
          activities.push(`📍 ${item.place} (${item.address})`);
          if (item.url) {
            highlights.push(`詳細: ${item.url}`);
          }
        }
      } else if (typeof item === 'string') {
        activities.push(item);
      }
    });

    return {
      title: 'AI提案デートプラン',
      description: 'AIがあなたたちの会話を分析して提案したデートプランです。',
      schedule: activities.join('\n'),
      highlights: highlights.length > 0 ? highlights : undefined
    };
  }

  // オブジェクトの場合
  if (typeof rawData === 'object' && rawData !== null) {
    const obj = rawData as any;
    return {
      title: obj.title || obj.name || 'AI提案プラン',
      description: obj.description || obj.content || obj.summary || 'AI提案の詳細',
      schedule: obj.schedule || obj.time || obj.duration,
      budget: obj.budget || obj.cost || obj.price,
      highlights: Array.isArray(obj.highlights) ? obj.highlights : 
                 Array.isArray(obj.features) ? obj.features :
                 obj.highlights ? [String(obj.highlights)] : undefined,
      notes: Array.isArray(obj.notes) ? obj.notes :
             Array.isArray(obj.warnings) ? obj.warnings :
             obj.notes ? [String(obj.notes)] : undefined
    };
  }

  // その他の場合
  return {
    title: 'AI提案',
    description: String(rawData)
  };
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
  if (data.suggestions) {
    let plans: any[] = [];
    
    // suggestions.plansが配列の場合
    if (Array.isArray(data.suggestions.plans)) {
      plans = data.suggestions.plans;
    }
    // suggestions自体が配列の場合
    else if (Array.isArray(data.suggestions)) {
      plans = data.suggestions;
    }
    // suggestions.plansが単一オブジェクトの場合
    else if (data.suggestions.plans) {
      plans = [data.suggestions.plans];
    }
    // suggestions全体が単一のプランの場合
    else {
      plans = [data.suggestions];
    }

    normalized.suggestions = {
      plans: plans.map(plan => formatPlanData(plan))
    };
  }
  // データ全体がプランの配列として返された場合
  else if (Array.isArray(data)) {
    normalized.suggestions = {
      plans: data.map(plan => formatPlanData(plan))
    };
  }
  // データ全体が単一のプランとして返された場合
  else if (data && typeof data === 'object' && !data.success && !data.error) {
    normalized.suggestions = {
      plans: [formatPlanData(data)]
    };
  }

  return normalized;
};

// AIプラン提案を取得
export const getAISuggestions = async (): Promise<AISuggestionResponse> => {
  try {
    console.log('🚀 Requesting AI suggestions...');
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
    
    const response = await api.post<RawAIResponse>('/ai/suggest-plans');
    
    console.log('✅ AI suggestions received:', response.data);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    // レスポンスデータの詳細分析
    console.log('Raw response type:', typeof response.data);
    console.log('Raw response keys:', response.data ? Object.keys(response.data) : 'No data');
    
    // データを正規化
    const normalizedData = normalizeAIResponse(response.data);
    console.log('🔄 Normalized AI data:', normalizedData);
    
    return normalizedData;
  } catch (error: unknown) {
    console.error('❌ AI suggestions error:', error);
    
    // 詳細なエラー情報をログ出力
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Axiosエラーの詳細分析
    const axiosError = error as { 
      response?: { 
        status?: number; 
        statusText?: string; 
        data?: unknown; 
        headers?: unknown 
      };
      request?: unknown;
      config?: unknown;
    };
    
    if (axiosError.response) {
      console.error('Response error details:');
      console.error('- Status:', axiosError.response.status);
      console.error('- Status Text:', axiosError.response.statusText);
      console.error('- Response Data:', axiosError.response.data);
      console.error('- Response Headers:', axiosError.response.headers);
    } else if (axiosError.request) {
      console.error('Request error - no response received:', axiosError.request);
    } else {
      console.error('Config error:', axiosError.config);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'AI処理中にエラーが発生しました';
    const errorDetail = axiosError?.response?.data as { detail?: string } | undefined;
    
    // エラーレスポンスを統一形式で返す
    const errorResponse: AISuggestionResponse = {
      success: false,
      error: errorDetail?.detail || errorMessage,
      message: 'AI処理中にエラーが発生しました。しばらく時間をおいて再度お試しください。',
      // デバッグ用の追加情報
      debug: {
        errorType: error instanceof Error ? error.name : 'Unknown',
        httpStatus: axiosError?.response?.status,
        responseData: axiosError?.response?.data ? JSON.stringify(axiosError?.response?.data) : '',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('📝 Error response being returned:', errorResponse);
    return errorResponse;
  }
};

// AIテスト機能
export const testAI = async (): Promise<AISuggestionResponse> => {
  try {
    console.log('🧪 Testing AI functionality...');
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
    
    const response = await api.post<RawAIResponse>('/ai/test');
    
    console.log('✅ AI test response received:', response.data);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    // レスポンスデータの詳細分析
    console.log('Raw test response type:', typeof response.data);
    console.log('Raw test response keys:', response.data ? Object.keys(response.data) : 'No data');
    
    // データを正規化
    const normalizedData = normalizeAIResponse(response.data);
    console.log('🔄 Normalized AI test data:', normalizedData);
    
    return normalizedData;
  } catch (error: unknown) {
    console.error('❌ AI test error:', error);
    
    // 詳細なエラー情報をログ出力
    if (error instanceof Error) {
      console.error('Test Error name:', error.name);
      console.error('Test Error message:', error.message);
      console.error('Test Error stack:', error.stack);
    }
    
    // Axiosエラーの詳細分析
    const axiosError = error as { 
      response?: { 
        status?: number; 
        statusText?: string; 
        data?: unknown; 
        headers?: unknown 
      };
      request?: unknown;
      config?: unknown;
    };
    
    if (axiosError.response) {
      console.error('Test Response error details:');
      console.error('- Status:', axiosError.response.status);
      console.error('- Status Text:', axiosError.response.statusText);
      console.error('- Response Data:', axiosError.response.data);
      console.error('- Response Headers:', axiosError.response.headers);
    } else if (axiosError.request) {
      console.error('Test Request error - no response received:', axiosError.request);
    } else {
      console.error('Test Config error:', axiosError.config);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'AIテスト中にエラーが発生しました';
    const errorDetail = axiosError?.response?.data as { detail?: string } | undefined;
    
    const errorResponse: AISuggestionResponse = {
      success: false,
      error: errorDetail?.detail || errorMessage,
      message: 'AIテスト中にエラーが発生しました。',
      // デバッグ用の追加情報
      debug: {
        errorType: error instanceof Error ? error.name : 'Unknown',
        httpStatus: axiosError?.response?.status,
        responseData: axiosError?.response?.data ? JSON.stringify(axiosError?.response?.data) : '',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('📝 Test error response being returned:', errorResponse);
    return errorResponse;
  }
}; 