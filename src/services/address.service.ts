import apiClient from "@/lib/axios";
import { AddressRequest, AddressResponse } from "@/types/address.type";

export const AddressService = {
    getMyAddresses: async () => {
        return await apiClient.get("/addresses/me");
    },

    createAddress: async (data: AddressRequest) => {
        return await apiClient.post("/addresses", data);
    },

    updateAddress: async (id: string, data: AddressRequest) => {
        return await apiClient.put(`/addresses/${id}`, data);
    },

    deleteAddress: async (id: string) => {
        return await apiClient.delete(`/addresses/${id}`);
    },

    setDefaultAddress: async (id: string, currentData: AddressResponse) => {
        const updatePayload: AddressRequest = {
            recipientName: currentData.recipientName,
            phone: currentData.phone,
            detailAddress: currentData.detailAddress,
            provinceId: currentData.provinceId,
            provinceName: currentData.provinceName,
            districtId: currentData.districtId,
            districtName: currentData.districtName,
            wardId: currentData.wardId,
            wardName: currentData.wardName,
            latitude: currentData.latitude,
            longitude: currentData.longitude,
            isDefault: true, // QUAN TRỌNG
        };
        return apiClient.put<AddressResponse>(`/addresses/${id}`, updatePayload);
    }
};