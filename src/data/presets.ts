import { ColorFrameId, TextStyleId } from '../utils/whatsappTextEngine';

export interface MessageTemplate {
  id: string;
  title: string;
  category: string;
  text: string;
  styleId: TextStyleId;
  frameId: ColorFrameId;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'promo-flash',
    title: 'Promo Flash Sale Toko',
    category: 'Bisnis & Jualan',
    text: 'FLASH SALE HARI INI\nDiskon hingga 50% khusus pemesanan sebelum jam 21.00 WIB.\nStok terbatas, langsung balas pesan ini untuk klaim.',
    styleId: 'bold-sans',
    frameId: 'crimson',
  },
  {
    id: 'pengumuman-biru',
    title: 'Pengumuman Biru Menonjol',
    category: 'Pengumuman Grup',
    text: 'PENGUMUMAN PENTING HARI INI',
    styleId: 'blue-hashtag',
    frameId: 'none',
  },
  {
    id: 'hashtag-biru',
    title: 'Pengumuman Tagar Biru',
    category: 'Informasi Komunitas',
    text: 'Jadwal Kerja Bakti Minggu Pagi\nKumpul di Balai Warga Pukul 07.00\nBawa Perlengkapan Kebersihan',
    styleId: 'blue-hashtag',
    frameId: 'emerald',
  },
  {
    id: 'ucapan-spesial',
    title: 'Ucapan Selamat & Apresiasi',
    category: 'Personal & Acara',
    text: 'Selamat Ulang Tahun!\nSemoga sehat selalu, dilancarkan rezekinya, dan penuh kebahagiaan.',
    styleId: 'script',
    frameId: 'amber',
  },
  {
    id: 'daftar-menu',
    title: 'Daftar Menu / Harga Rapi',
    category: 'Bisnis & Jualan',
    text: 'MENU HARI INI\nKopi Susu Gula Aren - Rp18.000\nMatcha Latte Dingin - Rp22.000\nRoti Bakar Cokelat - Rp15.000',
    styleId: 'monospace',
    frameId: 'monochrome',
  },
  {
    id: 'reminder-rapat',
    title: 'Pengingat Rapat Tim',
    category: 'Kantor & Tim',
    text: 'PENGINGAT RAPAT MINGGUAN\nHari: Senin, 09.30 WIB\nTempat: Ruang Rapat Lantai 2',
    styleId: 'bold-serif',
    frameId: 'violet',
  },
];

export interface StickerGradientPreset {
  id: string;
  name: string;
  stops: [string, string];
}

export const TEXT_COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: 'Biru WhatsApp', hex: '#0284C7' },
  { name: 'Hijau Zamrud', hex: '#0D7A5F' },
  { name: 'Merah Crimson', hex: '#DC2626' },
  { name: 'Kuning Emas', hex: '#D97706' },
  { name: 'Ungu Royal', hex: '#7C3AED' },
  { name: 'Merah Muda', hex: '#DB2777' },
  { name: 'Putih Bersih', hex: '#FFFFFF' },
  { name: 'Hitam Pekat', hex: '#0F172A' },
];

export const TEXT_GRADIENT_PRESETS: StickerGradientPreset[] = [
  { id: 'ocean', name: 'Samudra Biru', stops: ['#0284C7', '#14B8A6'] },
  { id: 'sunset', name: 'Senja Hangat', stops: ['#EA580C', '#E11D48'] },
  { id: 'gold', name: 'Emas Mewah', stops: ['#B45309', '#F59E0B'] },
  { id: 'berry', name: 'Berry Ungu', stops: ['#7C3AED', '#DB2777'] },
  { id: 'emerald', name: 'Hutan Zamrud', stops: ['#047857', '#10B981'] },
  { id: 'rainbow', name: 'Spektrum Cerah', stops: ['#2563EB', '#EC4899'] },
];

export const CANVAS_BG_PRESETS: {
  id: 'transparent' | 'white' | 'dark' | 'wa-green' | 'cream' | 'custom';
  name: string;
  hex: string | null;
}[] = [
  { id: 'transparent', name: 'Transparan (Stiker WA)', hex: null },
  { id: 'white', name: 'Putih Bersih', hex: '#FFFFFF' },
  { id: 'dark', name: 'Gelap Elegan', hex: '#0B141A' },
  { id: 'wa-green', name: 'Bubble Hijau WA', hex: '#D9FDD3' },
  { id: 'cream', name: 'Krem Hangat', hex: '#FEF3C7' },
];

export interface ColorPalette {
  id: string;
  name: string;
  category: 'Bawaan' | 'Kustom';
  styleTag: string;
  primaryHex: string;
  secondaryHex: string;
  strokeHex: string;
  bgHex: string | null; // null means transparent background
  frameId: ColorFrameId;
}

export const MAX_CUSTOM_PALETTES = 5;

export const PRESET_COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'preset-pastel',
    name: 'Pastel Lembut',
    category: 'Bawaan',
    styleTag: 'Pastel',
    primaryHex: '#EC4899',
    secondaryHex: '#8B5CF6',
    strokeHex: '#FFFFFF',
    bgHex: '#FDF2F8',
    frameId: 'violet',
  },
  {
    id: 'preset-neon',
    name: 'Neon Malam',
    category: 'Bawaan',
    styleTag: 'Neon',
    primaryHex: '#06B6D4',
    secondaryHex: '#22C55E',
    strokeHex: '#0F172A',
    bgHex: '#0B141A',
    frameId: 'ocean',
  },
  {
    id: 'preset-monokrom',
    name: 'Monokrom Tegas',
    category: 'Bawaan',
    styleTag: 'Monokrom',
    primaryHex: '#0F172A',
    secondaryHex: '#475569',
    strokeHex: '#FFFFFF',
    bgHex: '#F8FAFC',
    frameId: 'monochrome',
  },
  {
    id: 'preset-samudra',
    name: 'Biru Samudra WA',
    category: 'Bawaan',
    styleTag: 'Segar',
    primaryHex: '#0284C7',
    secondaryHex: '#0D7A5F',
    strokeHex: '#FFFFFF',
    bgHex: '#E0F2FE',
    frameId: 'ocean',
  },
  {
    id: 'preset-senja',
    name: 'Senja Hangat',
    category: 'Bawaan',
    styleTag: 'Hangat',
    primaryHex: '#EA580C',
    secondaryHex: '#E11D48',
    strokeHex: '#FFFFFF',
    bgHex: '#FFF7ED',
    frameId: 'crimson',
  },
  {
    id: 'preset-emas',
    name: 'Emas Mewah',
    category: 'Bawaan',
    styleTag: 'Elegan',
    primaryHex: '#D97706',
    secondaryHex: '#FBBF24',
    strokeHex: '#1E293B',
    bgHex: '#0F172A',
    frameId: 'amber',
  },
  {
    id: 'preset-zamrud',
    name: 'Hijau Zamrud',
    category: 'Bawaan',
    styleTag: 'Botani',
    primaryHex: '#047857',
    secondaryHex: '#10B981',
    strokeHex: '#FFFFFF',
    bgHex: '#D9FDD3',
    frameId: 'emerald',
  },
  {
    id: 'preset-retro',
    name: 'Retro Pop',
    category: 'Bawaan',
    styleTag: 'Ceria',
    primaryHex: '#7C3AED',
    secondaryHex: '#F59E0B',
    strokeHex: '#FFFFFF',
    bgHex: null,
    frameId: 'violet',
  },
];

export type CustomFontKey =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'monospace'
  | 'handwriting'
  | 'serif';

export interface FontStylePreset {
  key: CustomFontKey;
  label: string;
  sample: string;
  waTextStyleId: TextStyleId;
  description: string;
}

export const FONT_STYLE_PRESETS: FontStylePreset[] = [
  {
    key: 'bold',
    label: 'Tebal',
    sample: '𝗧𝗲𝗯𝗮𝗹',
    waTextStyleId: 'bold-sans',
    description: 'Huruf tebal modern berdaya tarik tinggi',
  },
  {
    key: 'italic',
    label: 'Miring',
    sample: '𝑇𝑒𝑘𝑠 𝑀𝑖𝑟𝑖𝑛𝑔',
    waTextStyleId: 'italic-serif',
    description: 'Gaya miring halus untuk penekanan kata',
  },
  {
    key: 'underline',
    label: 'Garis Bawah',
    sample: 'G̲a̲r̲i̲s̲ B̲a̲w̲a̲h̲',
    waTextStyleId: 'underline',
    description: 'Penegasan garis bawah pada setiap huruf',
  },
  {
    key: 'monospace',
    label: 'Monospace',
    sample: '𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎',
    waTextStyleId: 'monospace',
    description: 'Lebar karakter seragam bergaya mesin tik',
  },
  {
    key: 'handwriting',
    label: 'Tulisan Tangan',
    sample: '𝓣𝓾𝓵𝓲𝓼𝓪𝓷',
    waTextStyleId: 'script',
    description: 'Kaligrafi sambung personal & elegan',
  },
  {
    key: 'serif',
    label: 'Klasik Serif',
    sample: '𝐊𝐥𝐚𝐬𝐢𝐤',
    waTextStyleId: 'bold-serif',
    description: 'Tipografi serif editorial yang berwibawa',
  },
];
