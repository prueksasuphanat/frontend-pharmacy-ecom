<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePublicProductStore } from "@/stores/public/product.store";
import { usePublicCategoryStore } from "@/stores/public/category.store";
import { ProductDetailModal, ProductImage } from "@/components/product";
import { useAuthStore } from "@/stores/auth.store";
import {
  Search,
  ChevronRight,
  Package,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  Pill,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Zap,
  UserCheck,
  BadgeCheck,
  X,
  ChevronDown,
  Star,
} from "lucide-vue-next";
import { Navbar, Footer } from "@/components/layout";
import { BaseSelect } from "@/components/ui";
import { formatNum } from "@/utils/format";

const auth = useAuthStore();
const router = useRouter();
const productStore = usePublicProductStore();
const categoryStore = usePublicCategoryStore();

// ── announcement ──
const showAnnouncement = ref(true);

// ── hero parallax + cursor ──
const heroParallax = ref({ dx: 0, dy: 0 });
const heroMousePos = ref({ x: -999, y: -999 });
const trailPositions = ref<{ x: number; y: number; id: number }[]>([]);
let _trailId = 0;

function onHeroMouseMove(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  heroParallax.value = {
    dx: (mx - rect.width / 2) / (rect.width / 2),
    dy: (my - rect.height / 2) / (rect.height / 2),
  };
  heroMousePos.value = { x: mx, y: my };
  trailPositions.value = [
    { x: mx, y: my, id: ++_trailId },
    ...trailPositions.value.slice(0, 11),
  ];
}

function onHeroMouseLeave() {
  heroParallax.value = { dx: 0, dy: 0 };
  heroMousePos.value = { x: -999, y: -999 };
  trailPositions.value = [];
}



// ── hero search ──
const search = ref("");
const categoryId = ref<number | "">("");
const page = ref(1);
const PAGE_SIZE = 12;
const selectedProductId = ref<number | null>(null);
const productsSectionRef = ref<HTMLElement | null>(null);
const recentCarouselRef = ref<HTMLElement | null>(null);
const promoCarouselRef = ref<HTMLElement | null>(null);

// ── faq ──
const openFaq = ref<number | null>(null);
const faqs = [
  {
    q: "ต้องสมัครสมาชิกก่อนสั่งซื้อไหม?",
    a: "ใช่ การสมัครสมาชิกช่วยให้คุณดูราคาสินค้า ติดตามสถานะคำสั่งซื้อ และรับสิทธิพิเศษต่างๆ สมัครฟรีและใช้เวลาเพียงไม่กี่นาที",
  },
  {
    q: "สินค้าผ่านการรับรองจากองค์การอาหารและยา (อย.) ไหม?",
    a: "สินค้าทุกรายการในระบบผ่านการรับรองมาตรฐานจาก อย. และมาจากผู้ผลิตและผู้นำเข้าที่ได้รับอนุญาตอย่างถูกต้อง",
  },
  {
    q: "จัดส่งถึงที่ใช้เวลานานเท่าไหร่?",
    a: "สั่งซื้อก่อน 14:00 น. ส่งออกวันเดียวกัน ระยะเวลาจัดส่งทั่วประเทศ 1-3 วันทำการ พื้นที่ห่างไกลอาจใช้เวลาเพิ่มเติม",
  },
  {
    q: "สามารถคืนหรือเปลี่ยนสินค้าได้ไหม?",
    a: "สามารถคืนสินค้าได้ภายใน 7 วัน หากสินค้าได้รับความเสียหายระหว่างการจัดส่ง หรือไม่ตรงกับที่สั่ง กรุณาติดต่อทีมงานของเราพร้อมแนบหลักฐาน",
  },
];


let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    fetchProducts();
  }, 300);
}

const pagination = computed(() => productStore.pagination);
const totalPages = computed(() => pagination.value?.totalPages ?? 1);
const totalItems = computed(() => pagination.value?.total ?? 0);

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  const delta = 2;
  const pages: (number | string)[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("...");
    pages.push(total);
  }
  return pages;
});

function fetchProducts() {
  productStore.fetchProducts({
    page: page.value,
    limit: PAGE_SIZE,
    search: search.value || undefined,
    category_id:
      categoryId.value !== "" ? (categoryId.value as number) : undefined,
  });
}

function goToPage(p: number) {
  page.value = p;
  productsSectionRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
  fetchProducts();
}

function nextPage() {
  if (page.value < totalPages.value) goToPage(page.value + 1);
}

function prevPage() {
  if (page.value > 1) goToPage(page.value - 1);
}



watch(categoryId, () => {
  page.value = 1;
  fetchProducts();
});

function goToProduct(id: number) {
  if (!auth.isLoggedIn) {
    router.push(`/login?redirect=/products/${id}`);
  } else {
    selectedProductId.value = id;
  }
}

function scrollToProducts() {
  productsSectionRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index;
}

onMounted(() => {
  fetchProducts();
  categoryStore.fetchCategories();
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- ─── 2. Navbar ─── -->
    <Navbar />

    <!-- ─── 3. Hero Section ─── -->
    <section
      class="hero-section relative overflow-hidden"
      @mousemove="onHeroMouseMove"
      @mouseleave="onHeroMouseLeave"
    >
      <div class="animated-bg absolute inset-0" />
      <!-- Mouse spotlight glow -->
      <div
        class="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-300"
        :style="{
          background: `radial-gradient(circle 280px at ${heroMousePos.x}px ${heroMousePos.y}px, rgba(255,255,255,0.18) 0%, rgba(45,212,191,0.1) 40%, transparent 70%)`,
          opacity: heroMousePos.x < 0 ? 0 : 1,
        }"
      />
      <!-- Cursor trail dots -->
      <div
        v-for="(pos, i) in trailPositions"
        :key="pos.id"
        class="pointer-events-none absolute rounded-full z-[60]"
        :style="{
          width: `${Math.max(3, 8 - i * 0.5)}px`,
          height: `${Math.max(3, 8 - i * 0.5)}px`,
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: 'translate(-50%, -50%)',
          opacity: (1 - i / 12) * 0.65,
          background: 'rgba(45, 212, 191, 0.85)',
          filter: `blur(${i * 0.3}px)`,
        }"
      />
      <!-- Cursor glow orb -->
      <div
        v-if="heroMousePos.x > 0"
        class="pointer-events-none absolute rounded-full z-[61]"
        :style="{
          width: '26px',
          height: '26px',
          left: `${heroMousePos.x}px`,
          top: `${heroMousePos.y}px`,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(45,212,191,0.25) 55%, transparent 100%)',
          boxShadow: '0 0 14px 4px rgba(45, 212, 191, 0.25)',
          transition: 'left 0.06s ease-out, top 0.06s ease-out',
        }"
      />
      <!-- Parallax blobs — move opposite to mouse -->
      <div
        class="blob blob-1 absolute"
        :style="{
          transform: `translate(${heroParallax.dx * 80}px, ${heroParallax.dy * 55}px)`,
          transition: 'transform 0.3s ease-out',
        }"
      />
      <div
        class="blob blob-2 absolute"
        :style="{
          transform: `translate(${-heroParallax.dx * 100}px, ${-heroParallax.dy * 70}px)`,
          transition: 'transform 0.3s ease-out',
        }"
      />
      <!-- Floating decorative icons -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <Pill
          class="float-icon"
          style="
            top: 14%;
            left: 7%;
            animation-delay: 0s;
            animation-duration: 6.5s;
          "
        />
        <ShieldCheck
          class="float-icon"
          style="
            top: 22%;
            right: 9%;
            animation-delay: 1.2s;
            animation-duration: 8s;
          "
        />
        <Sparkles
          class="float-icon"
          style="
            top: 65%;
            right: 7%;
            animation-delay: 0.4s;
            animation-duration: 7s;
          "
        />
        <Zap
          class="float-icon"
          style="
            top: 72%;
            left: 10%;
            animation-delay: 2s;
            animation-duration: 5.5s;
          "
        />
        <span
          class="float-icon float-cross"
          style="
            top: 42%;
            left: 4%;
            animation-delay: 3s;
            animation-duration: 9s;
          "
          >+</span
        >
        <span
          class="float-icon float-cross"
          style="
            top: 38%;
            right: 5%;
            animation-delay: 1.8s;
            animation-duration: 7.5s;
          "
          >✕</span
        >
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="flex justify-center"
          style="
            padding-top: clamp(48px, 8vw, 80px);
            padding-bottom: clamp(40px, 6vw, 72px);
          "
        >
          <!-- Content — centered with staggered fade-in -->
          <div class="w-full max-w-2xl text-center">
            <!-- Heading -->
            <h1
              class="font-extrabold text-white mb-4 leading-tight"
              style="
                font-size: clamp(2rem, 5vw, 3.5rem);
                line-height: 1.1;
                letter-spacing: -0.02em;
              "
            >
              <span class="stagger-item block" style="animation-delay: 0.1s"
                >ยาและผลิตภัณฑ์</span
              >
              <span class="stagger-item block" style="animation-delay: 0.2s">
                เพื่อสุขภาพ
                <span class="icon-pill-badge">
                  <Pill class="w-5 h-5 sm:w-7 sm:h-7" />
                </span>
              </span>
              <span
                class="stagger-item block text-teal-100"
                style="animation-delay: 0.3s"
                >คุณภาพมาตรฐาน อย.
              </span>
            </h1>

            <!-- Subtext -->
            <div class="stagger-item" style="animation-delay: 0.42s">
              <p
                class="text-white/80 mb-7 mx-auto"
                style="
                  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
                  max-width: 480px;
                  line-height: 1.7;
                "
              >
                สินค้าคุณภาพจากผู้ผลิตชั้นนำ พร้อมส่งทั่วประเทศ
              </p>
            </div>

            <!-- Search -->
            <div class="stagger-item" style="animation-delay: 0.52s">
              <div
                class="hero-search relative mx-auto mb-6"
                style="max-width: 520px"
              >
                <Search
                  class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 z-10 pointer-events-none"
                />
                <input
                  v-model="search"
                  type="text"
                  placeholder="ค้นหาชื่อยา, รหัสสินค้า..."
                  class="hero-search-input w-full"
                  @input="onSearchInput"
                  @keyup.enter="scrollToProducts"
                />
                <button
                  @click="scrollToProducts"
                  class="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                >
                  ค้นหา
                </button>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="stagger-item" style="animation-delay: 0.62s">
              <div class="flex flex-wrap gap-3 justify-center mb-7">
                <button
                  @click="scrollToProducts"
                  class="flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                >
                  <Package class="w-4 h-4" />
                  ดูสินค้าทั้งหมด
                </button>
                <button
                  v-if="!auth.isLoggedIn"
                  @click="router.push('/login')"
                  class="group flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold pl-5 pr-2 py-2 rounded-full transition-all text-sm"
                >
                  <span class="overflow-hidden h-6 inline-flex items-center">
                    <span
                      class="flex flex-col group-hover:-translate-y-1/2 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                    >
                      <span class="h-6 flex items-center">เข้าสู่ระบบ</span>
                      <span class="h-6 flex items-center">เข้าสู่ระบบ</span>
                    </span>
                  </span>
                  <span
                    class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:-rotate-45 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                  >
                    <ArrowRight class="w-3.5 h-3.5 text-white" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 4. Features Strip ─── -->
    <section class="bg-white border-b border-secondary-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16">
          <div class="feature-item">
            <div class="feature-icon bg-emerald-50 text-emerald-600">
              <BadgeCheck class="w-6 h-6" />
            </div>
            <div>
              <p class="font-semibold text-secondary-800 text-sm">ยาแท้ 100%</p>
              <p class="text-xs text-secondary-400 mt-0.5">
                ผ่านการรับรองจาก อย.
              </p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon bg-cyan-50 text-cyan-600">
              <UserCheck class="w-6 h-6" />
            </div>
            <div>
              <p class="font-semibold text-secondary-800 text-sm">
                เภสัชกรดูแล
              </p>
              <p class="text-xs text-secondary-400 mt-0.5">ทีมผู้เชี่ยวชาญ</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon bg-sky-50 text-sky-600">
              <Zap class="w-6 h-6" />
            </div>
            <div>
              <p class="font-semibold text-secondary-800 text-sm">ส่งรวดเร็ว</p>
              <p class="text-xs text-secondary-400 mt-0.5">
                ภายใน 1-3 วันทำการ
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 5. สินค้าที่เคยสั่ง ─── -->
    <section class="bg-white py-10 border-b border-secondary-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-5">
          <div>
            <p class="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-1">คำสั่งซื้อล่าสุด</p>
            <h2 class="text-xl font-bold text-secondary-900">สินค้าที่เคยสั่ง</h2>
          </div>
          <button @click="scrollToProducts" class="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
            ดูทั้งหมด <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- ถ้า login — snap carousel -->
        <div v-if="auth.isLoggedIn && productStore.products.length" class="relative">
          <button
            @click="recentCarouselRef?.scrollBy({ left: -224, behavior: 'smooth' })"
            class="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-secondary-50 transition-colors border border-secondary-100"
          >
            <ChevronLeft class="w-4 h-4 text-secondary-600" />
          </button>

          <div ref="recentCarouselRef" class="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style="scroll-snap-type: x mandatory;">
            <div
              v-for="product in productStore.products.slice(0, 6)"
              :key="product.id"
              @click="goToProduct(product.id)"
              class="flex-shrink-0 w-52 cursor-pointer group"
              style="scroll-snap-align: start;"
            >
              <div class="relative rounded-2xl overflow-hidden mb-2.5 h-44 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <ProductImage
                  :attachments="product.attachments"
                  :name="product.name"
                  img-class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  class="w-full h-full"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <p class="absolute bottom-3 left-3 right-3 text-white text-xs font-bold line-clamp-2 leading-snug drop-shadow-sm">
                  {{ product.name }}
                </p>
              </div>
              <button class="w-full text-xs bg-primary-600 text-white font-semibold py-2.5 rounded-xl hover:bg-primary-700 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5">
                สั่งซื้ออีกครั้ง
              </button>
            </div>
          </div>

          <button
            @click="recentCarouselRef?.scrollBy({ left: 224, behavior: 'smooth' })"
            class="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-secondary-50 transition-colors border border-secondary-100"
          >
            <ChevronRight class="w-4 h-4 text-secondary-600" />
          </button>
        </div>

        <!-- ถ้าไม่ login -->
        <div v-else-if="!auth.isLoggedIn" class="flex items-center gap-4 bg-secondary-50 rounded-2xl p-6 border border-secondary-100">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <UserCheck class="w-5 h-5 text-primary-600" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-secondary-800 text-sm">เข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ</p>
            <p class="text-xs text-secondary-500 mt-0.5">ดูสินค้าที่เคยสั่งและสั่งซื้ออีกครั้งได้ทันที</p>
          </div>
          <button @click="router.push('/login')" class="shrink-0 text-sm bg-primary-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-primary-700 transition-colors">
            เข้าสู่ระบบ
          </button>
        </div>

        <!-- loading -->
        <div v-else class="flex gap-4 overflow-x-auto pb-1">
          <div v-for="n in 6" :key="n" class="flex-shrink-0 w-52 animate-pulse">
            <div class="w-full h-44 bg-secondary-100 rounded-2xl mb-2.5" />
            <div class="h-8 bg-secondary-100 rounded-xl" />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 5b. สินค้าโปรโมชั่น ─── -->
    <section v-if="false" class="border-b border-secondary-100 overflow-hidden">
      <!-- dark header strip -->
      <div class="bg-primary-800 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔥</span>
          <div>
            <p class="text-primary-300 text-xs font-semibold uppercase tracking-widest">ข้อเสนอพิเศษ</p>
            <h2 class="text-white text-xl font-bold leading-tight">สินค้าโปรโมชั่น</h2>
          </div>
        </div>
        <span class="bg-red-500 text-white text-sm font-black px-4 py-1.5 rounded-full shadow">ลดสูงสุด 25%</span>
      </div>

      <!-- carousel -->
      <div class="bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto relative">
          <button
            @click="promoCarouselRef?.scrollBy({ left: -296, behavior: 'smooth' })"
            class="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <div v-if="productStore.products.length" ref="promoCarouselRef" class="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style="scroll-snap-type: x mandatory;">
            <div
              v-for="(product, i) in productStore.products.slice(0, 8)"
              :key="product.id"
              @click="goToProduct(product.id)"
              class="flex-shrink-0 w-72 bg-white rounded-2xl border border-secondary-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group overflow-hidden"
              style="scroll-snap-align: start;"
            >
              <div class="relative h-52 overflow-hidden">
                <ProductImage
                  :attachments="product.attachments"
                  :name="product.name"
                  img-class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  class="w-full h-full"
                />
                <div class="absolute top-3 -right-8 w-32 bg-red-500 text-white text-xs font-black text-center py-1.5 rotate-45 shadow-md tracking-wide">
                  -{{ [10, 15, 20, 25][i % 4] }}%
                </div>
              </div>
              <div class="p-4">
                <p class="text-sm font-bold text-secondary-900 line-clamp-2 mb-1 leading-snug">{{ product.name }}</p>
                <p class="text-xs text-secondary-400 mb-3">{{ product.generic_name || '—' }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-primary-600">ดูราคาสินค้า</span>
                  <ChevronRight class="w-3.5 h-3.5 text-primary-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          <!-- skeleton -->
          <div v-else class="flex gap-4 overflow-x-auto">
            <div v-for="n in 4" :key="n" class="flex-shrink-0 w-72 bg-white rounded-2xl border border-secondary-100 animate-pulse overflow-hidden">
              <div class="w-full h-52 bg-secondary-100" />
              <div class="p-4 space-y-2">
                <div class="h-4 bg-secondary-100 rounded w-full" />
                <div class="h-3 bg-secondary-50 rounded w-2/3" />
              </div>
            </div>
          </div>

          <button
            @click="promoCarouselRef?.scrollBy({ left: 296, behavior: 'smooth' })"
            class="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>

    <!-- ─── 6. Products Section ─── -->
    <section
      ref="productsSectionRef"
      id="products-section"
      class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <!-- Filter bar -->
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
      >
        <div class="flex items-center gap-3 flex-1 flex-wrap w-full sm:w-auto">
          <div class="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal class="h-4 w-4 text-secondary-400" />
            <span class="text-sm text-secondary-500">หมวดหมู่:</span>
          </div>
          <BaseSelect
            v-model="categoryId"
            :options="[
              { value: '', label: 'ทุกหมวดหมู่' },
              ...categoryStore.categories.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]"
            class="w-full sm:w-56 shrink-0"
          />
        </div>
      </div>

      <p class="text-sm text-secondary-500 mb-4">
        พบ <strong class="text-secondary-900">{{ formatNum(totalItems) }}</strong> รายการ
      </p>

      <!-- Loading Skeleton -->
      <div v-if="productStore.isLoading" class="min-h-[600px]">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="n in PAGE_SIZE"
            :key="n"
            class="rounded-2xl overflow-hidden border border-secondary-100 bg-white animate-pulse"
          >
            <div
              class="w-full h-40 bg-gradient-to-br from-secondary-100 to-secondary-50 relative"
            >
              <div
                class="absolute top-2 left-2 h-5 w-16 bg-secondary-200 rounded-full"
              />
            </div>
            <div class="p-3 space-y-2">
              <div class="h-3 bg-secondary-100 rounded w-2/5" />
              <div class="h-4 bg-secondary-150 rounded w-full" />
              <div class="h-4 bg-secondary-100 rounded w-3/4" />
              <div class="flex gap-1 pt-0.5">
                <div class="h-5 w-10 bg-secondary-100 rounded" />
                <div class="h-5 w-12 bg-secondary-100 rounded" />
              </div>
              <div class="h-8 bg-secondary-100 rounded-lg w-full mt-1" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="productStore.error" class="text-center py-20">
        <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">{{ productStore.error }}</p>
        <button @click="fetchProducts" class="btn-secondary mt-4 text-sm">
          ลองใหม่
        </button>
      </div>

      <!-- Product Grid -->
      <div v-else-if="productStore.products.length > 0" class="min-h-[600px]">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="product in productStore.products"
            :key="product.id"
            @click="goToProduct(product.id)"
            class="group cursor-pointer bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:border-primary-200 hover:shadow-lg hover:shadow-primary-600/8 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div class="relative overflow-hidden">
              <ProductImage
                :attachments="product.attachments"
                :name="product.name"
                img-class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                class="w-full h-44"
              />
              <div
                v-if="product.categories?.[0]"
                class="absolute top-2.5 left-2.5 bg-white/95 text-primary-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm"
              >
                {{ product.categories[0].category.name }}
              </div>
              <div
                v-if="product.quantity === 0"
                class="absolute inset-0 bg-black/45 flex items-center justify-center"
              >
                <span class="bg-white text-secondary-700 text-xs font-bold px-3 py-1.5 rounded-full shadow">
                  สินค้าหมด
                </span>
              </div>
            </div>

            <div class="p-3.5">
              <p class="text-[11px] text-secondary-400 mb-1 truncate">
                {{ product.generic_name || "—" }}
              </p>
              <h3 class="font-semibold text-sm text-secondary-900 line-clamp-2 leading-snug mb-2.5">
                {{ product.name }}
              </h3>
              <div v-if="product.units?.length" class="flex flex-wrap gap-1 mb-2.5">
                <span
                  v-for="u in product.units"
                  :key="u.id"
                  class="text-[11px] bg-secondary-50 text-secondary-500 border border-secondary-100 px-2 py-0.5 rounded-full"
                >
                  {{ (u as any).unit_label ?? u.unit?.name }}
                </span>
              </div>
              <div
                v-if="!auth.isLoggedIn"
                class="bg-secondary-50 border border-dashed border-secondary-200 rounded-xl px-3 py-2 text-center"
              >
                <p class="text-xs text-secondary-500">🔒 เข้าสู่ระบบเพื่อดูราคา</p>
              </div>
              <div v-else-if="product.quantity === 0" class="text-sm font-medium text-secondary-400">
                สินค้าหมด
              </div>
              <div v-else class="flex items-center justify-between pt-0.5">
                <p class="text-xs font-semibold text-primary-600">ดูรายละเอียดและราคา</p>
                <ChevronRight class="w-4 h-4 text-primary-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">ไม่พบสินค้าที่ค้นหา</p>
        <button
          @click="
            search = '';
            categoryId = '';
            page = 1;
            fetchProducts();
          "
          class="btn-secondary mt-4 text-sm"
        >
          ล้างตัวกรอง
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1 && !productStore.isLoading" class="mt-8">
        <div
          class="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p class="text-sm text-secondary-500">
            แสดงหน้า <strong class="text-secondary-900">{{ formatNum(page) }}</strong> จาก
            <strong class="text-secondary-900">{{ formatNum(totalPages) }}</strong> หน้า
            ({{ formatNum(totalItems) }} รายการ)
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="goToPage(1)"
              :disabled="page === 1"
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                page === 1
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-600 hover:bg-secondary-100',
              ]"
            >
              <ChevronsLeft class="w-4 h-4" />
            </button>
            <button
              @click="prevPage"
              :disabled="page === 1"
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                page === 1
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-600 hover:bg-secondary-100',
              ]"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <template v-for="(p, index) in pageNumbers" :key="index">
              <button
                v-if="typeof p === 'number'"
                @click="goToPage(p)"
                :class="[
                  'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                  p === page
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-white text-secondary-600 border border-secondary-200 hover:bg-secondary-50 hover:border-primary-300',
                ]"
              >
                {{ p }}
              </button>
              <span
                v-else
                class="w-9 h-9 flex items-center justify-center text-secondary-400"
                >{{ p }}</span
              >
            </template>
            <button
              @click="nextPage"
              :disabled="page === totalPages"
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                page === totalPages
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-600 hover:bg-secondary-100',
              ]"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
            <button
              @click="goToPage(totalPages)"
              :disabled="page === totalPages"
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                page === totalPages
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-600 hover:bg-secondary-100',
              ]"
            >
              <ChevronsRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 8. FAQ ─── -->
    <section class="bg-white py-14">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10">
          <p
            class="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2"
          >
            FAQ
          </p>
          <h2 class="section-heading">คำถามที่พบบ่อย</h2>
        </div>

        <div class="space-y-3">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="faq-item"
            :class="openFaq === i ? 'faq-item--open' : ''"
          >
            <button
              @click="toggleFaq(i)"
              class="w-full flex items-center justify-between gap-4 text-left p-4 sm:p-5"
            >
              <span
                class="font-semibold text-secondary-800 text-sm sm:text-base"
                >{{ faq.q }}</span
              >
              <ChevronDown
                class="w-4 h-4 text-secondary-400 shrink-0 transition-transform duration-200"
                :class="openFaq === i ? 'rotate-180 text-primary-600' : ''"
              />
            </button>
            <div
              class="faq-answer overflow-hidden transition-all duration-300"
              :style="
                openFaq === i
                  ? 'max-height: 200px; opacity: 1'
                  : 'max-height: 0; opacity: 0'
              "
            >
              <p
                class="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-secondary-500 leading-relaxed"
              >
                {{ faq.a }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 9. Register CTA (guest only) ─── -->
    <section v-if="!auth.isLoggedIn" class="newsletter-section relative overflow-hidden py-16">
      <div class="newsletter-bg absolute inset-0" />
      <div class="blob blob-1 absolute opacity-20" />
      <div class="relative z-10 max-w-xl mx-auto px-4 text-center">
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm mb-4"
        >
          <UserCheck class="w-6 h-6 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">
          สมัครสมาชิกวันนี้ ฟรี!
        </h2>
        <p class="text-white/75 text-sm mb-7 leading-relaxed">
          ดูราคาสินค้า ติดตามสถานะคำสั่งซื้อ
          และรับสิทธิพิเศษอีกมากมาย
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <button
            @click="router.push('/register')"
            class="bg-white text-primary-700 font-semibold px-7 py-3 rounded-full text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            สมัครสมาชิก
          </button>
          <button
            @click="router.push('/login')"
            class="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-7 py-3 rounded-full text-sm transition-all"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </section>

    <!-- ─── ProductDetailModal ─── -->
    <ProductDetailModal
      :product-id="selectedProductId"
      @close="selectedProductId = null"
    />

    <!-- ─── 10. Footer ─── -->
    <Footer />
  </div>
</template>

<style scoped>
/* ─── Announcement ─── */
.slide-announcement-enter-active,
.slide-announcement-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-announcement-enter-from,
.slide-announcement-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-announcement-enter-to,
.slide-announcement-leave-from {
  max-height: 48px;
  opacity: 1;
}

/* ─── Hero ─── */
.hero-section {
  min-height: 500px;
  display: flex;
  align-items: center;
}

.hero-section,
.hero-section * {
  cursor: none !important;
}

.animated-bg {
  background: linear-gradient(
    135deg,
    #0d9488 0%,
    #0891b2 35%,
    #059669 70%,
    #0d9488 100%
  );
  background-size: 300% 300%;
  animation: gradientShift 12s ease infinite;
}

.animated-bg::before {
  content: "";
  position: absolute;
  inset: -50%;
  background: radial-gradient(
    ellipse 60% 40% at center,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(45, 212, 191, 0.1) 40%,
    transparent 70%
  );
  animation: lightSweep 7s ease-in-out infinite alternate;
  pointer-events: none;
}

.animated-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 0deg at 70% 30%,
    transparent 0deg,
    rgba(56, 189, 248, 0.12) 60deg,
    transparent 120deg,
    rgba(45, 212, 191, 0.08) 200deg,
    transparent 300deg
  );
  animation: chromaSpin 15s linear infinite;
  pointer-events: none;
}

@keyframes lightSweep {
  0% {
    transform: translate(-25%, -20%) rotate(-10deg);
  }
  100% {
    transform: translate(20%, 15%) rotate(10deg);
  }
}

@keyframes chromaSpin {
  to {
    transform: rotate(360deg);
  }
}

.blob {
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: #2dd4bf;
  opacity: 0.2;
  top: -150px;
  right: -100px;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: #38bdf8;
  opacity: 0.15;
  bottom: -100px;
  left: -80px;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* ─── Staggered Fade-in ─── */
.stagger-item {
  animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ─── Floating Decorative Icons ─── */
.float-icon {
  position: absolute;
  width: 20px;
  height: 20px;
  color: white;
  opacity: 0.12;
  animation: floatY var(--dur, 7s) ease-in-out infinite;
}

.float-cross {
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  width: auto;
  height: auto;
}

@keyframes floatY {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-18px) rotate(10deg);
  }
}

.icon-pill-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 3px 7px;
  backdrop-filter: blur(4px);
  vertical-align: middle;
  margin-left: 6px;
}

/* ─── Hero Search ─── */
.hero-search-input {
  padding: 13px 80px 13px 44px;
  background: white;
  border: 2px solid transparent;
  border-radius: 50px;
  font-size: 0.95rem;
  color: #0f172a;
  box-shadow:
    0 6px 28px rgba(0, 0, 0, 0.15),
    0 1px 4px rgba(0, 0, 0, 0.08);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  outline: none;
}

.hero-search-input:focus {
  border-color: #0d9488;
  box-shadow:
    0 6px 28px rgba(0, 0, 0, 0.15),
    0 0 0 3px rgba(13, 148, 136, 0.15);
}

.hero-search-input::placeholder {
  color: #94a3b8;
}

/* ─── Hero Product Showcase ─── */
.showcase-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.showcase-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* ─── Features Strip ─── */
.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feature-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─── Category Showcase ─── */
.category-showcase-card {
  background: white;
  border-radius: 16px;
  border: 1.5px solid #f1f5f9;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-showcase-card:hover {
  border-color: #a7f3d0;
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.1);
  transform: translateY(-3px);
}

.cat-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  border: 1.5px solid;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─── Section Heading ─── */
.section-heading {
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* ─── Category Pills ─── */
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.category-pill {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 50px;
  border: 1.5px solid transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
  cursor: pointer;
}

.category-pill--active {
  background: #0d9488;
  color: white;
  border-color: #0d9488;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}

.category-pill--inactive {
  background: white;
  color: #475569;
  border-color: #e2e8f0;
}

.category-pill--inactive:hover {
  border-color: #0d9488;
  color: #0d9488;
  background: #f0fdfa;
}

/* ─── Product Cards ─── */
.product-card {
  background: white;
  border-radius: 16px;
  border: 1.5px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  border-color: #ccfbef;
  box-shadow:
    0 8px 28px rgba(13, 148, 136, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* ─── Promo Banners ─── */
.promo-banner {
  border-radius: 20px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s ease;
  will-change: transform;
}

.promo-banner::after {
  content: "";
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

/* ─── FAQ ─── */
.faq-item {
  border: 1.5px solid #f1f5f9;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.faq-item--open {
  border-color: #a7f3d0;
  box-shadow: 0 2px 12px rgba(13, 148, 136, 0.08);
}

/* ─── Newsletter ─── */
.newsletter-section {
  min-height: 280px;
  display: flex;
  align-items: center;
}

.newsletter-bg {
  background: linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #059669 100%);
  background-size: 200% 200%;
  animation: gradientShift 12s ease infinite;
}
</style>
