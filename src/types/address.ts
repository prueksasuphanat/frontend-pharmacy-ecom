export interface Geography {
  id: number;
  name: string;
}

export interface Province {
  id: number;
  nameTh: string;
  nameEn: string;
  geographyId: number;
}

export interface District {
  id: number;
  nameTh: string;
  nameEn: string;
  provinceId: number;
}

export interface SubDistrict {
  id: number;
  zipCode: number;
  nameTh: string;
  nameEn: string;
  districtId: number;
  lat: number | null;
  long: number | null;
}

export interface AddressOption {
  value: number;
  label: string;
}

export interface Address {
  id: number;
  user_id: number;
  label: string | null;
  recipient: string;
  phone: string;
  address: string;
  district: string | null;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressBody {
  label?: string;
  recipient: string;
  phone: string;
  address: string;
  district?: string;
  province: string;
  postal_code: string;
  is_default?: boolean;
}
