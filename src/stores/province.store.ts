import { defineStore } from "pinia";
import type {
  AddressOption,
  District,
  Geography,
  Province,
  SubDistrict,
} from "@/types/address";

// Lazy-load JSON เพื่อ code-split ออกจาก main bundle
// (subdisticts.json มีขนาดใหญ่มาก ไม่ควร bundle รวมตั้งแต่ต้น)
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
  // ─── State ────────────────────────────────────────────────────────────────
  state: () => ({
    geographies: [] as Geography[],
    provinces: [] as Province[],
    districts: [] as District[],
    subDistricts: [] as SubDistrict[],
    isLoaded: false,
    isLoading: false,
    error: null as string | null,
  }),

  // ─── Getters ──────────────────────────────────────────────────────────────
  getters: {
    /** ตัวเลือกจังหวัดทั้งหมด สำหรับ <select> */
    provinceOptions: (state): AddressOption[] =>
      state.provinces.map((p) => ({ value: p.id, label: p.nameTh })),

    /** กรองอำเภอตาม provinceId */
    getDistrictsByProvince:
      (state) =>
      (provinceId: number): District[] =>
        state.districts.filter((d) => d.provinceId === provinceId),

    /** ตัวเลือกอำเภอตาม provinceId สำหรับ <select> */
    getDistrictOptions:
      (state) =>
      (provinceId: number): AddressOption[] =>
        state.districts
          .filter((d) => d.provinceId === provinceId)
          .map((d) => ({ value: d.id, label: d.nameTh })),

    /** กรองตำบลตาม districtId */
    getSubDistrictsByDistrict:
      (state) =>
      (districtId: number): SubDistrict[] =>
        state.subDistricts.filter((s) => s.districtId === districtId),

    /** ตัวเลือกตำบลตาม districtId สำหรับ <select> */
    getSubDistrictOptions:
      (state) =>
      (districtId: number): AddressOption[] =>
        state.subDistricts
          .filter((s) => s.districtId === districtId)
          .map((s) => ({ value: s.id, label: s.nameTh })),

    /** ดึง zip code จาก subDistrictId */
    getZipCode:
      (state) =>
      (subDistrictId: number): number | null =>
        state.subDistricts.find((s) => s.id === subDistrictId)?.zipCode ?? null,

    /** ดึงชื่อจังหวัดจาก id */
    getProvinceName:
      (state) =>
      (provinceId: number): string =>
        state.provinces.find((p) => p.id === provinceId)?.nameTh ?? "",

    /** ดึงชื่ออำเภอจาก id */
    getDistrictName:
      (state) =>
      (districtId: number): string =>
        state.districts.find((d) => d.id === districtId)?.nameTh ?? "",

    /** ดึงชื่อตำบลจาก id */
    getSubDistrictName:
      (state) =>
      (subDistrictId: number): string =>
        state.subDistricts.find((s) => s.id === subDistrictId)?.nameTh ?? "",
  },

  // ─── Actions ──────────────────────────────────────────────────────────────
  actions: {
    /**
     * โหลดข้อมูลทั้งหมดครั้งเดียว (idempotent — เรียกซ้ำได้ปลอดภัย)
     * ใช้ lazy import เพื่อ code-split JSON ออกจาก main bundle
     */
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

    /** รีเซ็ต state กลับเป็นค่าเริ่มต้น */
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
