export interface AddressRequest {
    recipientName: string;
    phone: string;
    detailAddress: string;
    provinceId?: number;
    provinceName: string;
    districtId?: number;
    districtName: string;
    wardCode: string;
    wardName: string;
    latitude?: number;
    longitude?: number;
    isDefault: boolean;
}

export interface AddressResponse {
  id: string;
  recipientName: string;
  phone: string;
  detailAddress: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}