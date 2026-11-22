import React, { useState } from 'react';
import { Check, Copy, Palette, Plus, Trash2 } from 'lucide-react';
import {
  ColorPalette,
  MAX_CUSTOM_PALETTES,
  PRESET_COLOR_PALETTES,
} from '../data/presets';
import { COLOR_FRAME_OPTIONS, ColorFrameId } from '../utils/whatsappTextEngine';

interface PaletteLibraryProps {
  customPalettes: ColorPalette[];
  activePaletteId: string | null;
  onAddCustomPalette: (palette: Omit<ColorPalette, 'id' | 'category'>) => void;
  onDeleteCustomPalette: (id: string) => void;
  onApplyToSticker: (palette: ColorPalette) => void;
  onApplyToGenerator: (palette: ColorPalette) => void;
}

export const PaletteLibrary: React.FC<PaletteLibraryProps> = ({
  customPalettes,
  activePaletteId,
  onAddCustomPalette,
  onDeleteCustomPalette,
  onApplyToSticker,
  onApplyToGenerator,
}) => {
  const [filter, setFilter] = useState<'semua' | 'bawaan' | 'kustom'>('semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom palette builder state
  const [name, setName] = useState('');
  const [primaryHex, setPrimaryHex] = useState('#0D7A5F');
  const [secondaryHex, setSecondaryHex] = useState('#0284C7');
  const [strokeHex, setStrokeHex] = useState('#FFFFFF');
  const [bgHex, setBgHex] = useState('#F0FDF4');
  const [isTransparentBg, setIsTransparentBg] = useState(false);
  const [frameId, setFrameId] = useState<ColorFrameId>('emerald');
  const [formError, setFormError] = useState<string | null>(null);

  const isLimitReached = customPalettes.length >= MAX_CUSTOM_PALETTES;

  const allPalettes = [...customPalettes, ...PRESET_COLOR_PALETTES];
  const visiblePalettes = allPalettes.filter((p) => {
    if (filter === 'bawaan') return p.category === 'Bawaan';
    if (filter === 'kustom') return p.category === 'Kustom';
    return true;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      setFormError(
        `Batas maksimal ${MAX_CUSTOM_PALETTES} palet kustom tercapai. Hapus salah satu palet kustom terlebih dahulu.`
      );
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('Masukkan nama palet warna terlebih dahulu.');
      return;
    }
    setFormError(null);
    onAddCustomPalette({
      name: trimmed,
      styleTag: 'Kustom',
      primaryHex,
      secondaryHex,
      strokeHex,
      bgHex: isTransparentBg ? null : bgHex,
      frameId,
    });
    setName('');
  };

  const handleCopyHex = async (palette: ColorPalette) => {
    const summary = `${palette.name}: Utama ${palette.primaryHex}, Gradien ${palette.secondaryHex}, Garis ${palette.strokeHex}, Latar ${
      palette.bgHex ?? 'Transparan'
    }`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedId(palette.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Custom Palette Creator (up to 5) */}
      <section
        aria-label="Buat Palet Warna Kustom"
        className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Buat Palet Kustom
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Simpan kombinasi warna Anda sendiri untuk dipakai ulang kapan saja.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums shrink-0">
            {customPalettes.length}/{MAX_CUSTOM_PALETTES}
          </span>
        </div>

        {/* Live Mini Preview */}
        <div
          className={`rounded-xl border border-slate-200 p-5 flex items-center justify-center min-h-[104px] ${
            isTransparentBg ? 'bg-slate-100' : ''
          }`}
          style={!isTransparentBg ? { backgroundColor: bgHex } : undefined}
        >
          <span
            className="text-2xl font-extrabold tracking-tight select-none"
            style={{
              backgroundImage: `linear-gradient(135deg, ${primaryHex}, ${secondaryHex})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: `1px ${strokeHex}`,
            }}
          >
            Pratinjau Warna
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="custom-palette-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Nama Palet
            </label>
            <input
              id="custom-palette-name"
              type="text"
              maxLength={28}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="Misalnya: Brand Toko Hijau"
              disabled={isLimitReached}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7A5F]/25 focus:border-[#0D7A5F] disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="cp-primary"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Warna Utama
              </label>
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  id="cp-primary"
                  type="color"
                  value={primaryHex}
                  onChange={(e) => setPrimaryHex(e.target.value.toUpperCase())}
                  className="w-6 h-6 rounded border-0 p-0 bg-transparent cursor-pointer shrink-0"
                />
                <span className="text-xs font-mono text-slate-700 tabular-nums uppercase">
                  {primaryHex}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="cp-secondary"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Warna Gradien
              </label>
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  id="cp-secondary"
                  type="color"
                  value={secondaryHex}
                  onChange={(e) => setSecondaryHex(e.target.value.toUpperCase())}
                  className="w-6 h-6 rounded border-0 p-0 bg-transparent cursor-pointer shrink-0"
                />
                <span className="text-xs font-mono text-slate-700 tabular-nums uppercase">
                  {secondaryHex}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="cp-stroke"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Garis Tepi
              </label>
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  id="cp-stroke"
                  type="color"
                  value={strokeHex}
                  onChange={(e) => setStrokeHex(e.target.value.toUpperCase())}
                  className="w-6 h-6 rounded border-0 p-0 bg-transparent cursor-pointer shrink-0"
                />
                <span className="text-xs font-mono text-slate-700 tabular-nums uppercase">
                  {strokeHex}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="cp-bg"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Latar Kartu
              </label>
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  id="cp-bg"
                  type="color"
                  disabled={isTransparentBg}
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                  className="w-6 h-6 rounded border-0 p-0 bg-transparent cursor-pointer shrink-0 disabled:opacity-40"
                />
                <span className="text-xs font-mono text-slate-700 tabular-nums uppercase truncate">
                  {isTransparentBg ? 'Transparan' : bgHex}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isTransparentBg}
                onChange={(e) => setIsTransparentBg(e.target.checked)}
                className="w-4 h-4 rounded accent-[#0D7A5F]"
              />
              Latar Transparan (Stiker)
            </label>
          </div>

          <div>
            <label
              htmlFor="cp-frame"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Bingkai Emoji WA (Untuk Teks Chat)
            </label>
            <select
              id="cp-frame"
              value={frameId}
              onChange={(e) => setFrameId(e.target.value as ColorFrameId)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7A5F]/20"
            >
              {COLOR_FRAME_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {formError && (
            <p role="alert" className="text-xs text-red-600 font-medium">
              {formError}
            </p>
          )}

          {isLimitReached && !formError && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Kuota maksimal {MAX_CUSTOM_PALETTES} palet kustom sudah penuh. Hapus salah satu palet
              kustom di sebelah kanan untuk menyimpan palet baru.
            </p>
          )}

          <button
            type="submit"
            disabled={isLimitReached}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] disabled:opacity-45 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Simpan Palet Kustom ({customPalettes.length}/{MAX_CUSTOM_PALETTES})
          </button>
        </form>
      </section>

      {/* Right: Palette Library Grid */}
      <section
        aria-label="Daftar Pustaka Palet Warna"
        className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Pustaka Palet Warna
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {PRESET_COLOR_PALETTES.length} palet siap pakai ·{' '}
              <span className="tabular-nums">{customPalettes.length}</span> palet kustom tersimpan
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter palet warna"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto"
          >
            {(
              [
                { id: 'semua', label: 'Semua' },
                { id: 'bawaan', label: 'Palet Bawaan' },
                { id: 'kustom', label: `Kustom (${customPalettes.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {visiblePalettes.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto">
            <Palette className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900">
              Belum ada palet kustom
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Gunakan formulir di sebelah kiri untuk meracik dan menyimpan hingga{' '}
              {MAX_CUSTOM_PALETTES} palet warna pilihan Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
            {visiblePalettes.map((pal) => {
              const isActive = activePaletteId === pal.id;
              return (
                <article
                  key={pal.id}
                  className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-4 ${
                    isActive
                      ? 'border-[#0D7A5F] bg-[#0D7A5F]/[0.03]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-slate-500">
                          {pal.category} · {pal.styleTag}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                          {pal.name}
                        </h3>
                      </div>
                      {pal.category === 'Kustom' && (
                        <button
                          type="button"
                          onClick={() => onDeleteCustomPalette(pal.id)}
                          aria-label={`Hapus palet ${pal.name}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    {/* Swatch Bar */}
                    <div className="mt-3 grid grid-cols-4 h-9 rounded-lg overflow-hidden border border-slate-200">
                      <div
                        style={{ backgroundColor: pal.primaryHex }}
                        title={`Utama: ${pal.primaryHex}`}
                      />
                      <div
                        style={{ backgroundColor: pal.secondaryHex }}
                        title={`Gradien: ${pal.secondaryHex}`}
                      />
                      <div
                        style={{ backgroundColor: pal.strokeHex }}
                        title={`Garis Tepi: ${pal.strokeHex}`}
                      />
                      <div
                        className={pal.bgHex === null ? 'bg-slate-100' : ''}
                        style={pal.bgHex ? { backgroundColor: pal.bgHex } : undefined}
                        title={`Latar: ${pal.bgHex ?? 'Transparan'}`}
                      />
                    </div>

                    {/* Hex Summary */}
                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
                      <span>{pal.primaryHex}</span>
                      <span>{pal.secondaryHex}</span>
                      <span>{pal.bgHex ?? 'TRANSPARAN'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleCopyHex(pal)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copiedId === pal.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#0D7A5F]" aria-hidden="true" />
                          Disalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" aria-hidden="true" />
                          Hex
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onApplyToGenerator(pal)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Ke Teks
                      </button>
                      <button
                        type="button"
                        onClick={() => onApplyToSticker(pal)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Ke Stiker
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
