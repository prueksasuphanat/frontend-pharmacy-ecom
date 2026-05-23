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
