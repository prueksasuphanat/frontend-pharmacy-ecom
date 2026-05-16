import { defineStore } from "pinia";
import { ref } from "vue";
import { addressesApi, type Address, type AddressBody } from "@/api/customer/addresses";
import { useToast } from "vue-toastification";

export const useAddressStore = defineStore("customerAddress", () => {
  const addresses = ref<Address[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const toast = useToast();

  const fetchAddresses = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await addressesApi.getAddresses();
      if (res.success) {
        addresses.value = res.data;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || "ไม่สามารถดึงข้อมูลที่อยู่ได้";
      toast.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const createAddress = async (data: AddressBody) => {
    loading.value = true;
    try {
      const res = await addressesApi.createAddress(data);
      if (res.success) {
        toast.success(res.message);
        await fetchAddresses();
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ไม่สามารถเพิ่มที่อยู่ได้");
    } finally {
      loading.value = false;
    }
    return false;
  };

  const updateAddress = async (id: number, data: AddressBody) => {
    loading.value = true;
    try {
      const res = await addressesApi.updateAddress(id, data);
      if (res.success) {
        toast.success(res.message);
        await fetchAddresses();
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ไม่สามารถแก้ไขที่อยู่ได้");
    } finally {
      loading.value = false;
    }
    return false;
  };

  const deleteAddress = async (id: number) => {
    try {
      const res = await addressesApi.deleteAddress(id);
      if (res.success) {
        toast.success(res.message);
        await fetchAddresses();
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ไม่สามารถลบที่อยู่ได้");
    }
    return false;
  };

  const setAsDefault = async (id: number) => {
    try {
      const res = await addressesApi.setAsDefault(id);
      if (res.success) {
        toast.success(res.message);
        await fetchAddresses();
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ไม่สามารถตั้งเป็นที่อยู่หลักได้");
    }
    return false;
  };

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
  };
});
