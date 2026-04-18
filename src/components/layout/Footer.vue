<script setup lang="ts">
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Heart,
  ShieldCheck,
} from "lucide-vue-next";
import { RouterLink } from "vue-router";

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer
    class="bg-gradient-to-b from-secondary-900 to-secondary-950 text-secondary-300"
  >
    <!-- Main Footer -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Company Info with License -->
        <div>
          <div class="flex items-center gap-2.5 mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20"
            >
              <span class="text-white font-bold text-xl">P</span>
            </div>
            <span class="text-white font-bold text-xl">PharmaCare</span>
          </div>
          <p class="text-sm leading-relaxed mb-5 text-secondary-400">
            ร้านขายยาออนไลน์ที่คุณไว้วางใจ
            มีใบอนุญาตจากสำนักงานคณะกรรมการอาหารและยา
            พร้อมให้บริการด้วยทีมเภสัชกรมืออาชีพ
          </p>

          <!-- License Badges -->
          <div class="space-y-2.5 mb-5">
            <div
              class="flex items-center gap-2.5 px-3 py-2.5 bg-secondary-800/50 rounded-xl border border-secondary-700/50"
            >
              <div
                class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shrink-0"
              >
                <span class="text-white font-bold text-xs">อย.</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-secondary-500">
                  ใบอนุญาตร้านขายยา เลขที่
                </p>
                <p class="text-xs font-semibold text-secondary-300">
                  1234567890
                </p>
              </div>
            </div>
            <div
              class="flex items-center gap-2.5 px-3 py-2.5 bg-secondary-800/50 rounded-xl border border-secondary-700/50"
            >
              <div
                class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shrink-0"
              >
                <ShieldCheck class="w-4 h-4 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-secondary-500">เภสัชกรผู้รับผิดชอบ</p>
                <p class="text-xs font-semibold text-secondary-300">
                  ภญ. สมหญิง ใจดี
                </p>
              </div>
            </div>
          </div>

          <!-- Social Media -->
          <div class="flex items-center gap-2.5">
            <a
              href="#"
              class="w-10 h-10 rounded-xl bg-secondary-800/50 hover:bg-primary-600 border border-secondary-700/50 hover:border-primary-500 flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Facebook class="w-4 h-4" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-xl bg-secondary-800/50 hover:bg-primary-600 border border-secondary-700/50 hover:border-primary-500 flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Twitter class="w-4 h-4" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-xl bg-secondary-800/50 hover:bg-primary-600 border border-secondary-700/50 hover:border-primary-500 flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Instagram class="w-4 h-4" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-xl bg-secondary-800/50 hover:bg-primary-600 border border-secondary-700/50 hover:border-primary-500 flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Youtube class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-white font-semibold mb-4 text-base">เมนูหลัก</h3>
          <ul class="space-y-2.5 text-sm">
            <li>
              <RouterLink
                to="/products"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                สินค้าทั้งหมด
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/products?type=otc"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                ยาสามัญประจำบ้าน
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/products?type=supplement"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                ผลิตภัณฑ์เสริมอาหาร
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/orders"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                ติดตามคำสั่งซื้อ
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/profile"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                บัญชีของฉัน
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div>
          <h3 class="text-white font-semibold mb-4 text-base">บริการลูกค้า</h3>
          <ul class="space-y-2.5 text-sm">
            <li>
              <a
                href="#"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                วิธีการสั่งซื้อ
              </a>
            </li>
            <li>
              <a
                href="#"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                การชำระเงิน
              </a>
            </li>
            <li>
              <a
                href="#"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                การจัดส่ง
              </a>
            </li>
            <li>
              <a
                href="#"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                นโยบายการคืนสินค้า
              </a>
            </li>
            <li>
              <a
                href="#"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                คำถามที่พบบ่อย
              </a>
            </li>
            <li>
              <a
                href="#"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                นโยบายความเป็นส่วนตัว
              </a>
            </li>
            <li>
              <a
                href="#"
                class="hover:text-primary-400 transition-colors flex items-center gap-2 group"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"
                ></span>
                ข้อกำหนดและเงื่อนไข
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h3 class="text-white font-semibold mb-4 text-base">ติดต่อเรา</h3>
          <ul class="space-y-3.5 text-sm">
            <li class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-lg bg-secondary-800/50 border border-secondary-700/50 flex items-center justify-center shrink-0"
              >
                <MapPin class="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p class="text-white font-medium mb-1">ที่อยู่</p>
                <p class="leading-relaxed text-secondary-400">
                  123 ถนนสุขุมวิท แขวงคลองเตย<br />
                  เขตคลองเตย กรุงเทพฯ 10110
                </p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-lg bg-secondary-800/50 border border-secondary-700/50 flex items-center justify-center shrink-0"
              >
                <Phone class="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p class="text-white font-medium mb-1">โทรศัพท์</p>
                <a
                  href="tel:0212345678"
                  class="hover:text-primary-400 transition-colors block"
                >
                  02-123-4567
                </a>
                <a
                  href="tel:0898765432"
                  class="hover:text-primary-400 transition-colors block"
                >
                  089-876-5432
                </a>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-lg bg-secondary-800/50 border border-secondary-700/50 flex items-center justify-center shrink-0"
              >
                <Mail class="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p class="text-white font-medium mb-1">อีเมล</p>
                <a
                  href="mailto:info@pharmacare.com"
                  class="hover:text-primary-400 transition-colors"
                >
                  info@pharmacare.com
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-secondary-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
        >
          <p class="text-secondary-500">
            © {{ currentYear }} PharmaCare. สงวนลิขสิทธิ์.
          </p>

          <div class="flex items-center gap-4 text-secondary-500">
            <a href="#" class="hover:text-primary-400 transition-colors">
              นโยบายความเป็นส่วนตัว
            </a>
            <span class="text-secondary-700">•</span>
            <a href="#" class="hover:text-primary-400 transition-colors">
              ข้อกำหนดการใช้งาน
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
