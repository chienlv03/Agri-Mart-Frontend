import { useState, useEffect } from "react";
import axios from "axios";

// Interface cho API open-api.vn
interface Province {
  code: number;
  name: string;
}
interface District {
  code: number;
  name: string;
  province_code: number;
}
interface Ward {
  code: number;
  name: string;
  district_code: number;
}

export const useLocation = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // 1. Load Tỉnh/Thành
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(res.data);
      } catch (error) {
        console.error("Lỗi load tỉnh thành:", error);
      }
    };
    fetchProvinces();
  }, []);

  // 2. Hàm load Quận/Huyện theo Tỉnh
  const fetchDistricts = async (provinceCode: number) => {
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      setDistricts(res.data.districts);
      setWards([]); // Reset xã
    } catch (error) {
      console.error("Lỗi load quận huyện:", error);
    }
  };

  // 3. Hàm load Phường/Xã theo Huyện
  const fetchWards = async (districtCode: number) => {
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      setWards(res.data.wards);
    } catch (error) {
      console.error("Lỗi load phường xã:", error);
    }
  };

  return { provinces, districts, wards, fetchDistricts, fetchWards };
};