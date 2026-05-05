import { httpClient } from '../../../shared/api/httpClient';

export const blockApi = {
  list: async (): Promise<Array<{ id: string; username?: string; fullName?: string; avatarUrl?: string; blockedAt?: string }>> => {
    const res = (await httpClient.get('/blocks', { requiresAuth: true })) as any;
    return res?.data ?? [];
  },

  block: async (targetUserId: string) => {
    const res = (await httpClient.post('/blocks', { targetUserId }, { requiresAuth: true })) as any;
    return res?.data;
  },

  unblock: async (targetUserId: string) => {
    const res = (await httpClient.delete(`/blocks/${targetUserId}`, { requiresAuth: true })) as any;
    return res?.data;
  },
};
