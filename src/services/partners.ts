import api from '@/lib/api';
import { 
  InviteCodeResponse, 
  PartnerSearchResponse, 
  PartnerConnectResponse,
  PartnerStatusResponse 
} from '@/types/api';

// 招待コード関連
export const getMyInviteCode = async (): Promise<InviteCodeResponse> => {
  const response = await api.get<InviteCodeResponse>('/users/my-invite-code');
  return response.data;
};

export const regenerateInviteCode = async (): Promise<InviteCodeResponse> => {
  const response = await api.post<InviteCodeResponse>('/users/regenerate-invite-code');
  return response.data;
};

// パートナー検索
export const searchUserByInviteCode = async (inviteCode: string): Promise<PartnerSearchResponse> => {
  const response = await api.get<PartnerSearchResponse>(`/users/search-by-code/${inviteCode}`);
  return response.data;
};

export const searchUserById = async (userId: number): Promise<PartnerSearchResponse> => {
  const response = await api.get<PartnerSearchResponse>(`/users/search/${userId}`);
  return response.data;
};

// パートナー接続
export const connectPartnerByInviteCode = async (inviteCode: string): Promise<PartnerConnectResponse> => {
  const response = await api.post<PartnerConnectResponse>('/users/partner-connect-by-code', {
    invite_code: inviteCode
  });
  return response.data;
};

export const connectPartnerById = async (partnerId: number): Promise<PartnerConnectResponse> => {
  const response = await api.post<PartnerConnectResponse>('/users/partner-connect-by-id', {
    partner_id: partnerId
  });
  return response.data;
};

// パートナー状態取得
export const getPartnerStatus = async (): Promise<PartnerStatusResponse> => {
  const response = await api.get<PartnerStatusResponse>('/users/partner-status');
  return response.data;
};

// パートナー申請を送信（旧バージョン）
export const sendPartnerRequest = async (partnerUsername: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/users/partner-request', {
    partner_username: partnerUsername
  });
  return response.data;
};

// パートナー関係を解除
export const removePartner = async (): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>('/users/partner');
  return response.data;
}; 