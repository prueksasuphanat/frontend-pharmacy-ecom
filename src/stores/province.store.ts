import { defineStore } from "pinia";
import type {
  AddressOption,
  District,
  Geography,
  Province,
  SubDistrict,
} from "@/types/address";

async function loadGeographies(): Promise<Geography[]> {
  const mod = await import("@/data/provices/geographies.json");
  return mod.default as Geography[];
}

async function loadProvinces(): Promise<Province[]> {
  const mod = await import("@/data/provices/provices.json");
  return mod.default as Province[];
}

async function loadDistricts(): Promise<District[]> {
  const mod = await import("@/data/provices/districts.json");
  return mod.default as District[];
}

async function loadSubDistricts(): Promise<SubDistrict[]> {
  const mod = await import("@/data/provices/subdisticts.json");
  return mod.default as SubDistrict[];
}

export const useProvinceStore = defineStore("province", {
  state: () => ({
    geographies: [] as Geography[],
    provinces: [] as Province[],
    districts: [] as District[],
    subDistricts: [] as SubDistrict[],
    isLoaded: false,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    provinceOptions: (state): AddressOption[] =>
      state.provinces.map((p) => ({ value: p.id, label: p.nameTh })),

    getDistrictsByProvince:
      (state) =>
      (provinceId: number): District[] =>
        state.districts.filter((d) => d.provinceId === provinceId),

    getDistrictOptions:
      (state) =>
      (provinceId: number): AddressOption[] =>
        state.districts
          .filter((d) => d.provinceId === provinceId)
          .map((d) => ({ value: d.id, label: d.nameTh })),

    getSubDistrictsByDistrict:
      (state) =>
      (districtId: number): SubDistrict[] =>
        state.subDistricts.filter((s) => s.districtId === districtId),

    getSubDistrictOptions:
      (state) =>
      (districtId: number): AddressOption[] =>
        state.subDistricts
          .filter((s) => s.districtId === districtId)
          .map((s) => ({ value: s.id, label: s.nameTh })),

    getZipCode:
      (state) =>
      (subDistrictId: number): number | null =>
        state.subDistricts.find((s) => s.id === subDistrictId)?.zipCode ?? null,

    getProvinceName:
      (state) =>
      (provinceId: number): string =>
        state.provinces.find((p) => p.id === provinceId)?.nameTh ?? "",

    getDistrictName:
      (state) =>
      (districtId: number): string =>
        state.districts.find((d) => d.id === districtId)?.nameTh ?? "",

    getSubDistrictName:
      (state) =>
      (subDistrictId: number): string =>
        state.subDistricts.find((s) => s.id === subDistrictId)?.nameTh ?? "",
  },

  actions: {
    async load(): Promise<void> {
      if (this.isLoaded || this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const [geo, prov, dist, sub] = await Promise.all([
          loadGeographies(),
          loadProvinces(),
          loadDistricts(),
          loadSubDistricts(),
        ]);

        this.geographies = geo;
        this.provinces = prov;
        this.districts = dist;
        this.subDistricts = sub;
        this.isLoaded = true;
      } catch (err: any) {
        this.error = "โหลดข้อมูลที่อยู่ไม่สำเร็จ";
        console.error("[useProvinceStore] load error:", err);
      } finally {
        this.isLoading = false;
      }
    },

    reset(): void {
      this.geographies = [];
      this.provinces = [];
      this.districts = [];
      this.subDistricts = [];
      this.isLoaded = false;
      this.isLoading = false;
      this.error = null;
    },
  },
});
