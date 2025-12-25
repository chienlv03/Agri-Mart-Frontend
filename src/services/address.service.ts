import apiClient from "@/lib/axios";
import { AddressRequest } from "@/types/address.type";

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
    }
};