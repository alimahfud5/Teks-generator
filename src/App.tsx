import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold,
  Check,
  Code,
  Copy,
  Eraser,
  Hash,
  Italic,
  Quote,
  Search,
  Sparkles,
  Strikethrough,
} from 'lucide-react';
import { GuideSection } from './components/GuideSection';
import { PaletteLibrary } from './components/PaletteLibrary';
import { OfflineIndicator, PWAInstallControl } from './components/PWAInstallControl';
import { StickerStudio } from './components/StickerStudio';
import { HistoryItem, TemplatesAndHistory } from './components/TemplatesAndHistory';
import { WhatsAppPreview } from './components/WhatsAppPreview';
import {
  ColorPalette,
  FONT_STYLE_PRESETS,
  MAX_CUSTOM_PALETTES,
  MessageTemplate,
  PRESET_COLOR_PALETTES,
} from './data/presets';
import {
  COLOR_FRAME_OPTIONS,
  ColorFrameId,
  TEXT_STYLE_OPTIONS,
  TextStyleId,
  transformText,
} from './utils/whatsappTextEngine';

type ActiveTab = 'generator' | 'sticker' | 'palettes' | 'templates' | 'guide';
type StyleCategoryFilter = 'semua' | 'warna-biru' | 'tipografi' | 'dekoratif';

const STORAGE_KEY = 'warnawa_history_v1';
const PALETTES_STORAGE_KEY = 'warnawa_custom_palettes_v1';
const DEFAULT_INPUT = 'PROMO SPESIAL HARI INI\nDiskon 50% untuk semua produk pilihan';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');

  const [inputText, setInputText] = useState<string>(DEFAULT_INPUT);
  const [selectedStyle, setSelectedStyle] = useState<TextStyleId>('bold-sans');
  const [selectedFrame, setSelectedFrame] = useState<ColorFrameId>('none');
  const [waWrap, setWaWrap] = useState<'none' | 'bold' | 'italic' | 'strike' | 'mono'>('none');

  const [styleFilter, setStyleFilter] = useState<StyleCategoryFilter>('semua');
  const [styleQuery, setStyleQuery] = useState<string>('');

  const [copiedMain, setCopiedMain] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // Ignore storage read error
    }
    return [];
  });

  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>(() => {
    try {
      const raw = localStorage.getItem(PALETTES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.slice(0, MAX_CUSTOM_PALETTES) : [];
      }
    } catch {
      // Ignore storage read error
    }
    return [];
  });

  const [activePaletteId, setActivePaletteId] = useState<string | null>(null);
  const [appliedStickerPalette, setAppliedStickerPalette] = useState<ColorPalette | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage write error
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(PALETTES_STORAGE_KEY, JSON.stringify(customPalettes));
    } catch {
      // Ignore storage write error
    }
  }, [customPalettes]);

  const activeStyleOption = useMemo(
    () => TEXT_STYLE_OPTIONS.find((s) => s.id === selectedStyle) ?? TEXT_STYLE_OPTIONS[0],
    [selectedStyle]
  );

  const outputText = useMemo(
    () =>
      transformText(inputText, selectedStyle, {
        frameId: selectedFrame,
        waWrap,
      }),
    [inputText, selectedStyle, selectedFrame, waWrap]
  );

  const filteredStyles = useMemo(() => {
    return TEXT_STYLE_OPTIONS.filter((opt) => {
      const matchCategory = styleFilter === 'semua' || opt.category === styleFilter;
      const q = styleQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        opt.name.toLowerCase().includes(q) ||
        opt.description.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [styleFilter, styleQuery]);

  const handleCopyOutput = async () => {
    if (!outputText.trim()) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopiedMain(true);
      setTimeout(() => setCopiedMain(false), 2000);
    } catch {
      // Fallback if clipboard denied
    }
  };

  const handleSaveHistory = () => {
    if (!outputText.trim()) return;
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      rawText: inputText,
      outputText,
      styleId: selectedStyle,
      styleName: activeStyleOption.name,
      frameId: selectedFrame,
      createdAt: Date.now(),
    };
    setHistory((prev) => [item, ...prev].slice(0, 30));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleAddCustomPalette = (paletteInput: Omit<ColorPalette, 'id' | 'category'>) => {
    if (customPalettes.length >= MAX_CUSTOM_PALETTES) return;
    const newPalette: ColorPalette = {
      ...paletteInput,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: 'Kustom',
    };
    setCustomPalettes((prev) => [newPalette, ...prev].slice(0, MAX_CUSTOM_PALETTES));
    setActivePaletteId(newPalette.id);
  };

  const handleDeleteCustomPalette = (id: string) => {
    setCustomPalettes((prev) => prev.filter((p) => p.id !== id));
    if (activePaletteId === id) {
      setActivePaletteId(null);
    }
  };

  const handleApplyPaletteToSticker = (pal: ColorPalette) => {
    setActivePaletteId(pal.id);
    setAppliedStickerPalette({ ...pal });
    setActiveTab('sticker');
  };

  const handleApplyPaletteToGenerator = (pal: ColorPalette) => {
    setActivePaletteId(pal.id);
    setSelectedFrame(pal.frameId);
    setActiveTab('generator');
  };

  const wrapSelectionWithMarkdown = (prefix: string, suffix: string, linePrefix = false) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = inputText.slice(start, end);

    let nextText = '';
    let nextCursorStart = start;
    let nextCursorEnd = end;

    if (linePrefix) {
      if (selected) {
        const prefixed = selected
          .split('\n')
          .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
          .join('\n');
        nextText = inputText.slice(0, start) + prefixed + inputText.slice(end);
        nextCursorStart = start;
        nextCursorEnd = start + prefixed.length;
      } else {
        const insert = `${prefix}Teks`;
        nextText = inputText.slice(0, start) + insert + inputText.slice(end);
        nextCursorStart = start + prefix.length;
        nextCursorEnd = start + insert.length;
      }
    } else if (selected) {
      nextText = `${inputText.slice(0, start)}${prefix}${selected}${suffix}${inputText.slice(end)}`;
      nextCursorStart = start + prefix.length;
      nextCursorEnd = end + prefix.length;
    } else {
      const placeholder = 'teks';
      nextText = `${inputText.slice(0, start)}${prefix}${placeholder}${suffix}${inputText.slice(end)}`;
      nextCursorStart = start + prefix.length;
      nextCursorEnd = start + prefix.length + placeholder.length;
    }

    setInputText(nextText);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCursorStart, nextCursorEnd);
    });
  };

  const handleApplyTemplate = (tpl: MessageTemplate) => {
    setInputText(tpl.text);
    setSelectedStyle(tpl.styleId);
    setSelectedFrame(tpl.frameId);
    setWaWrap('none');
    setActiveTab('generator');
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setInputText(item.rawText);
    setSelectedStyle(item.styleId);
    setSelectedFrame(item.frameId);
    setActiveTab('generator');
  };

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'generator', label: 'Generator Teks' },
    { id: 'sticker', label: 'Kartu & Stiker' },
    { id: 'palettes', label: 'Palet Warna' },
    { id: 'templates', label: 'Template' },
    { id: 'guide', label: 'Panduan' },
  ];

  const previewSampleSource = useMemo(() => {
    const firstLine = inputText
      .split('\n')
      .map((l) => l.trim())
      .find(Boolean);
    if (!firstLine) return 'Contoh Teks';
    return firstLine.slice(0, 22);
  }, [inputText]);

  const allPalettes = [...customPalettes, ...PRESET_COLOR_PALETTES];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900">
      {/* Top Bar Contract: 3 exact zones separated by gap-8 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            WarnaWA
          </button>

          {/* Zone 2: Concise single-line nav links (5 links) */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-[#0D7A5F] font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0D7A5F]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                if (activeTab !== 'generator') {
                  setActiveTab('generator');
                } else {
                  handleCopyOutput();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedMain && activeTab === 'generator' ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  {activeTab === 'generator' ? 'Salin Hasil' : 'Buka Generator'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation strip */}
        <nav
          aria-label="Navigasi seluler"
          className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#0D7A5F]/10 text-[#0D7A5F] font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Title Intro */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              Generator Teks Warna &amp; Gaya Pesan WhatsApp
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1.5 leading-relaxed">
              Buat huruf kotak biru, teks tagar biru, kustomisasi gaya font, palet warna kustom,
              atau ekspor stiker teks bergradien siap kirim.
            </p>
          </div>
          <PWAInstallControl />
        </div>

        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Workspace: Input, Formatting, Font Customization & Styles */}
            <div className="lg:col-span-7 space-y-6">
              {/* Editor Box */}
              <section
                aria-label="Editor Teks Pesan"
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <div
                    className="flex flex-wrap items-center gap-1"
                    role="toolbar"
                    aria-label="Format teks WhatsApp"
                  >
                    <button
                      type="button"
                      onClick={() => wrapSelectionWithMarkdown('*', '*')}
                      title="Tebal (*teks*)"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                    >
                      <Bold className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Tebal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelectionWithMarkdown('_', '_')}
                      title="Miring (_teks_)"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                    >
                      <Italic className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Miring</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelectionWithMarkdown('~', '~')}
                      title="Coret (~teks~)"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                    >
                      <Strikethrough className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Coret</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelectionWithMarkdown('`', '`')}
                      title="Monospace (`teks`)"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Mono</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelectionWithMarkdown('> ', '', true)}
                      title="Kutipan (> teks)"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                    >
                      <Quote className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Kutip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelectionWithMarkdown('#', '', true)}
                      title="Tagar Biru (#teks)"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#0284C7] hover:bg-white rounded-md transition-colors cursor-pointer"
                    >
                      <Hash className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Biru</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInputText(DEFAULT_INPUT)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      Contoh
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      disabled={!inputText}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-white disabled:opacity-40 rounded-md transition-colors cursor-pointer"
                    >
                      <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                      Bersihkan
                    </button>
                  </div>
                </div>

                {/* Textarea */}
                <div className="p-4">
                  <label htmlFor="wa-source-input" className="sr-only">
                    Tulis pesan WhatsApp Anda
                  </label>
                  <textarea
                    id="wa-source-input"
                    ref={textareaRef}
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ketik pesan Anda di sini... Misalnya: PROMO HARI INI atau Selamat Pagi!"
                    className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none resize-y leading-relaxed"
                  />
                </div>

                {/* Quick Style Options Bar */}
                <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  {/* Color Frames */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-600 mr-1">
                      Bingkai Warna:
                    </span>
                    {COLOR_FRAME_OPTIONS.map((frame) => {
                      const active = selectedFrame === frame.id;
                      return (
                        <button
                          key={frame.id}
                          type="button"
                          onClick={() => setSelectedFrame(frame.id)}
                          title={frame.name}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            active
                              ? 'border-[#0D7A5F] bg-white text-slate-900'
                              : 'border-transparent text-slate-600 hover:bg-white hover:border-slate-200'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-xs shrink-0"
                            style={{ backgroundColor: frame.swatchHex }}
                            aria-hidden="true"
                          />
                          <span className="hidden sm:inline">{frame.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* WA wrap option */}
                  {selectedStyle !== 'blue-square' && (
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="wa-wrap-select" className="text-xs font-medium text-slate-600">
                        Format WA:
                      </label>
                      <select
                        id="wa-wrap-select"
                        value={waWrap}
                        onChange={(e) =>
                          setWaWrap(e.target.value as 'none' | 'bold' | 'italic' | 'strike' | 'mono')
                        }
                        className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D7A5F]/20"
                      >
                        <option value="none">Tanpa Tambahan</option>
                        <option value="bold">*Tebal WA*</option>
                        <option value="italic">_Miring WA_</option>
                        <option value="strike">~Coret WA~</option>
                        <option value="mono">```Monospace```</option>
                      </select>
                    </div>
                  )}
                </div>
              </section>

              {/* Font Customization + Quick Palette Strip */}
              <section
                aria-label="Kustomisasi Font dan Palet Cepat"
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-5"
              >
                {/* 6 Font Styles */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Kustomisasi Gaya Font
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pilih langsung dari 6 gaya font populer untuk pesan yang dihasilkan.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {FONT_STYLE_PRESETS.map((preset) => {
                      const active = selectedStyle === preset.waTextStyleId;
                      return (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => setSelectedStyle(preset.waTextStyleId)}
                          className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-[#0D7A5F] bg-[#0D7A5F]/[0.04]'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {preset.label}
                            </span>
                            {active && (
                              <span className="text-[11px] font-semibold text-[#0D7A5F] shrink-0">
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-800 mt-1 truncate">
                            {preset.sample}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Palette Library Bar */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-semibold text-slate-700">
                      Pustaka Palet Warna ({allPalettes.length} palet · {customPalettes.length}/5 kustom)
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('palettes')}
                      className="text-xs font-medium text-[#0D7A5F] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Buka Pustaka Palet
                    </button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {allPalettes.map((pal) => {
                      const isActive = activePaletteId === pal.id;
                      return (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => handleApplyPaletteToGenerator(pal)}
                          title={`Terapkan bingkai warna ${pal.name}`}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isActive
                              ? 'border-[#0D7A5F] bg-[#0D7A5F]/5 text-slate-900'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-sm shrink-0 border border-black/10"
                            style={{
                              backgroundImage: `linear-gradient(135deg, ${pal.primaryHex}, ${pal.secondaryHex})`,
                            }}
                            aria-hidden="true"
                          />
                          <span>{pal.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Full Style Catalog */}
              <section
                aria-label="Semua Pilihan Gaya Teks dan Warna"
                className="bg-white border border-slate-200 rounded-xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div
                    role="tablist"
                    aria-label="Kategori gaya teks"
                    className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start"
                  >
                    {(
                      [
                        { id: 'semua', label: 'Semua' },
                        { id: 'warna-biru', label: 'Teks Biru' },
                        { id: 'tipografi', label: 'Tipografi' },
                        { id: 'dekoratif', label: 'Dekoratif' },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={styleFilter === cat.id}
                        onClick={() => setStyleFilter(cat.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          styleFilter === cat.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-56">
                    <Search
                      className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={styleQuery}
                      onChange={(e) => setStyleQuery(e.target.value)}
                      placeholder="Cari gaya teks..."
                      aria-label="Cari gaya teks"
                      className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7A5F]/20 focus:border-[#0D7A5F]"
                    />
                  </div>
                </div>

                {filteredStyles.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-slate-600">
                      Tidak ada gaya teks yang cocok dengan pencarian &ldquo;{styleQuery}&rdquo;.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStyleQuery('');
                        setStyleFilter('semua');
                      }}
                      className="mt-3 px-3.5 py-1.5 text-xs font-medium text-[#0D7A5F] bg-[#0D7A5F]/10 rounded-lg cursor-pointer"
                    >
                      Tampilkan Semua Gaya
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    {filteredStyles.map((style) => {
                      const isSelected = selectedStyle === style.id;
                      const liveSnippet = transformText(previewSampleSource, style.id, {
                        blueSpaced: true,
                      });
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSelectedStyle(style.id)}
                          className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'border-[#0D7A5F] bg-[#0D7A5F]/[0.04]'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {style.name}
                            </span>
                            {isSelected && (
                              <span className="text-[11px] font-semibold text-[#0D7A5F] shrink-0">
                                Aktif
                              </span>
                            )}
                          </div>

                          <div
                            className={`text-sm truncate ${
                              style.id === 'blue-hashtag'
                                ? 'text-[#027EB5] font-medium'
                                : 'text-slate-800'
                            }`}
                          >
                            {liveSnippet}
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {style.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Live WhatsApp Preview + Raw Output */}
            <div className="lg:col-span-5 lg:sticky lg:top-22 space-y-4">
              <WhatsAppPreview
                outputText={outputText}
                styleName={activeStyleOption.name}
                onCopy={handleCopyOutput}
                copied={copiedMain}
                onSaveHistory={handleSaveHistory}
                savedNotice={savedNotice}
              />

              {/* Raw Text Output */}
              <section
                aria-label="Hasil Teks Siap Tempel"
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xs font-semibold text-slate-700">
                    Teks Mentah Siap Tempel (Copy-Paste)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sticker')}
                    className="text-xs font-medium text-[#0D7A5F] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Butuh warna gradien? Buat Stiker
                  </button>
                </div>
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans text-slate-800 whitespace-pre-wrap break-words max-h-36 overflow-y-auto select-all leading-relaxed">
                  {outputText || 'Teks hasil konversi akan tampil di sini.'}
                </pre>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'sticker' && (
          <StickerStudio
            initialText={inputText}
            appliedPalette={appliedStickerPalette}
            customPalettes={customPalettes}
            onOpenPaletteLibrary={() => setActiveTab('palettes')}
          />
        )}

        {activeTab === 'palettes' && (
          <PaletteLibrary
            customPalettes={customPalettes}
            activePaletteId={activePaletteId}
            onAddCustomPalette={handleAddCustomPalette}
            onDeleteCustomPalette={handleDeleteCustomPalette}
            onApplyToSticker={handleApplyPaletteToSticker}
            onApplyToGenerator={handleApplyPaletteToGenerator}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesAndHistory
            history={history}
            onApplyTemplate={handleApplyTemplate}
            onLoadHistory={handleLoadHistory}
            onDeleteHistory={(id) => setHistory((prev) => prev.filter((item) => item.id !== id))}
            onClearHistory={() => setHistory([])}
            onSwitchToGenerator={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'guide' && <GuideSection />}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>WarnaWA — Alat Pembuat Teks Biru, Tipografi &amp; Stiker Warna WhatsApp</span>
          <span>Semua pemrosesan berjalan lokal di browser Anda.</span>
        </div>
      </footer>
      <OfflineIndicator />
    </div>
  );
}
