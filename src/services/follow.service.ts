import apiClient from "@/lib/axios";

export const FollowService = {

    toggleFollow: async (shopId: string) => {
        const res = await apiClient.post(`/follows/${shopId}`);
        return res.data;
    },

    checkFollowStatus: async (shopId: string): Promise<boolean> => {
        const res = await apiClient.get<boolean>(`/follows/check/${shopId}`);
        return res.data;
    },

    async getFollowerCount(shopId: string, headers?: Record<string, string>) {
    const res = await apiClient.get(`/follows/count/${shopId}`, {
      headers: headers
    });
    return res.data;
  }
}