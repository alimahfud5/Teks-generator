import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Loader2,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  CANVAS_BG_PRESETS,
  ColorPalette,
  CustomFontKey,
  FONT_STYLE_PRESETS,
  PRESET_COLOR_PALETTES,
  TEXT_COLOR_PRESETS,
  TEXT_GRADIENT_PRESETS,
} from '../data/presets';
import {
  CharacterGenerationMode,
  CharacterStyle,
  FirebaseAIAccessError,
  generateCharacterWithFirebaseAI,
  sanitizeCharacterSvg,
} from '../services/firebaseAiCharacter';

interface StickerStudioProps {
  initialText: string;
  appliedPalette: ColorPalette | null;
  customPalettes: ColorPalette[];
  onOpenPaletteLibrary: () => void;
}

type FillMode = 'solid' | 'gradient';
type CharacterPosition = 'top' | 'left' | 'right' | 'only';

const CHARACTER_STYLE_OPTIONS: { id: CharacterStyle; label: string }[] = [
  { id: 'sticker', label: 'Stiker Kartun' },
  { id: 'chibi', label: 'Chibi Imut' },
  { id: 'flat', label: 'Minimalis Flat' },
  { id: 'mascot', label: 'Maskot Toko' },
];

const QUICK_CHARACTER_PROMPTS: string[] = [
  'Kucing oranye memakai kacamata hitam sambil melambai',
  'Robot kecil ramah memegang tanda promo',
  'Maskot gelas kopi tersenyum ceria',
  'Kelinci imut membawa kotak kado',
];

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}

export const StickerStudio: React.FC<StickerStudioProps> = ({
  initialText,
  appliedPalette,
  customPalettes,
  onOpenPaletteLibrary,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [text, setText] = useState(
    initialText.trim() || 'PROMO SPESIAL\nDiskon 50% Hari Ini'
  );
  const [fillMode, setFillMode] = useState<FillMode>('gradient');
  const [solidColor, setSolidColor] = useState('#0284C7');
  const [customGradStops, setCustomGradStops] = useState<[string, string]>(['#0284C7', '#14B8A6']);
  const [gradientId, setGradientId] = useState<string>('ocean');
  const [bgId, setBgId] = useState<
    'transparent' | 'white' | 'dark' | 'wa-green' | 'cream' | 'custom'
  >('white');
  const [customBgHex, setCustomBgHex] = useState<string>('#FDF2F8');

  const [fontChoice, setFontChoice] = useState<CustomFontKey>('bold');
  const [fontSize, setFontSize] = useState(86);
  const [align, setAlign] = useState<'center' | 'left' | 'right'>('center');
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [strokeColor, setStrokeColor] = useState('#FFFFFF');
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(
    appliedPalette?.id ?? null
  );

  // AI Character Generator states (Firebase AI Logic)
  const [charPrompt, setCharPrompt] = useState(
    'Kucing oranye memakai kacamata hitam sambil melambai'
  );
  const [charStyle, setCharStyle] = useState<CharacterStyle>('sticker');
  const [charMode, setCharMode] = useState<CharacterGenerationMode>('vector');
  const [charPosition, setCharPosition] = useState<CharacterPosition>('top');
  const [charSize, setCharSize] = useState<number>(360);
  const [isGeneratingChar, setIsGeneratingChar] = useState(false);
  const [charError, setCharError] = useState<string | null>(null);
  const [charErrorUrl, setCharErrorUrl] = useState<string | null>(null);
  const [charTitle, setCharTitle] = useState<string>('');
  const [charPreviewUrl, setCharPreviewUrl] = useState<string | null>(null);
  const [charIsObjectUrl, setCharIsObjectUrl] = useState<boolean>(false);
  const [loadedCharImg, setLoadedCharImg] = useState<HTMLImageElement | null>(null);

  const applyPaletteObject = (pal: ColorPalette) => {
    setSelectedPaletteId(pal.id);
    setFillMode('gradient');
    setGradientId('custom-palette');
    setCustomGradStops([pal.primaryHex, pal.secondaryHex]);
    setSolidColor(pal.primaryHex);
    setStrokeColor(pal.strokeHex);
    setStrokeEnabled(true);
    if (pal.bgHex === null) {
      setBgId('transparent');
    } else {
      setBgId('custom');
      setCustomBgHex(pal.bgHex);
    }
  };

  useEffect(() => {
    if (appliedPalette) {
      applyPaletteObject(appliedPalette);
    }
  }, [appliedPalette]);

  useEffect(() => {
    return () => {
      if (charPreviewUrl && charIsObjectUrl) {
        URL.revokeObjectURL(charPreviewUrl);
      }
    };
  }, [charPreviewUrl, charIsObjectUrl]);

  const runCharacterGeneration = async (overrideMode?: CharacterGenerationMode) => {
    const activeMode = overrideMode ?? charMode;
    const trimmed = charPrompt.trim();
    if (trimmed.length < 2) {
      setCharError('Masukkan deskripsi karakter minimal 2 karakter.');
      return;
    }

    setIsGeneratingChar(true);
    setCharError(null);
    setCharErrorUrl(null);

    try {
      const primaryColor =
        fillMode === 'solid'
          ? solidColor
          : gradientId === 'custom-palette'
            ? customGradStops[0]
            : (TEXT_GRADIENT_PRESETS.find((g) => g.id === gradientId) ?? TEXT_GRADIENT_PRESETS[0])
                .stops[0];
      const secondaryColor =
        fillMode === 'solid'
          ? solidColor
          : gradientId === 'custom-palette'
            ? customGradStops[1]
            : (TEXT_GRADIENT_PRESETS.find((g) => g.id === gradientId) ?? TEXT_GRADIENT_PRESETS[0])
                .stops[1];

      const result = await generateCharacterWithFirebaseAI({
        prompt: trimmed,
        style: charStyle,
        mode: activeMode,
        primaryColor,
        secondaryColor,
      });

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setCharPreviewUrl((prev) => {
            if (prev && charIsObjectUrl) URL.revokeObjectURL(prev);
            return result.imageUrl;
          });
          setCharIsObjectUrl(result.isObjectUrl);
          setLoadedCharImg(img);
          setCharTitle(result.title);
          resolve();
        };
        img.onerror = () => {
          if (result.isObjectUrl) URL.revokeObjectURL(result.imageUrl);
          reject(new Error('Gagal memuat gambar karakter ke kanvas.'));
        };
        img.src = result.imageUrl;
      });
    } catch (err: unknown) {
      if (err instanceof FirebaseAIAccessError) {
        setCharError(err.message);
        setCharErrorUrl(err.consoleUrl);
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat membuat karakter AI.';
        setCharError(msg);
      }
    } finally {
      setIsGeneratingChar(false);
    }
  };

  const handleGenerateCharacter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    void runCharacterGeneration();
  };

  const handleRemoveCharacter = () => {
    if (charPreviewUrl && charIsObjectUrl) {
      URL.revokeObjectURL(charPreviewUrl);
    }
    setCharPreviewUrl(null);
    setCharIsObjectUrl(false);
    setLoadedCharImg(null);
    setCharTitle('');
    setCharError(null);
    setCharErrorUrl(null);
  };

  const handleUploadCharacter = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setCharError('Ukuran file gambar maksimal 10 MB.');
      setCharErrorUrl(null);
      return;
    }

    setCharError(null);
    setCharErrorUrl(null);

    try {
      let objectUrl: string;
      const isSvg =
        file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

      if (isSvg) {
        const rawSvg = await file.text();
        const sanitized = sanitizeCharacterSvg(rawSvg);
        if (!sanitized) {
          setCharError('File SVG tidak valid atau tidak didukung.');
          return;
        }
        objectUrl = URL.createObjectURL(
          new Blob([sanitized], { type: 'image/svg+xml;charset=utf-8' })
        );
      } else if (file.type.startsWith('image/')) {
        objectUrl = URL.createObjectURL(file);
      } else {
        setCharError('Pilih file gambar (PNG, JPG, WebP, atau SVG).');
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setCharPreviewUrl((prev) => {
            if (prev && charIsObjectUrl) URL.revokeObjectURL(prev);
            return objectUrl;
          });
          setCharIsObjectUrl(true);
          setLoadedCharImg(img);
          setCharTitle(file.name.replace(/\.[^.]+$/, '') || 'Gambar Karakter');
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Gagal membaca file gambar tersebut.'));
        };
        img.src = objectUrl;
      });
    } catch (err: unknown) {
      setCharError(
        err instanceof Error ? err.message : 'Gagal memuat gambar karakter.'
      );
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    const resolvedBgHex =
      bgId === 'custom'
        ? customBgHex
        : CANVAS_BG_PRESETS.find((b) => b.id === bgId)?.hex ?? null;

    if (resolvedBgHex) {
      ctx.fillStyle = resolvedBgHex;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, 72);
      ctx.fill();
    }

    const hasChar = !!loadedCharImg;

    // 1. Draw AI Character if present
    if (hasChar && loadedCharImg) {
      const drawSize = charPosition === 'only' ? Math.max(charSize, 620) : charSize;
      let cx = (size - drawSize) / 2;
      let cy = (size - drawSize) / 2;

      if (charPosition === 'top') {
        cx = (size - drawSize) / 2;
        cy = 72;
      } else if (charPosition === 'left') {
        cx = 56;
        cy = (size - drawSize) / 2;
      } else if (charPosition === 'right') {
        cx = size - drawSize - 56;
        cy = (size - drawSize) / 2;
      }

      const natW = loadedCharImg.naturalWidth || drawSize;
      const natH = loadedCharImg.naturalHeight || drawSize;
      const scale = Math.min(drawSize / natW, drawSize / natH);
      const renderW = natW * scale;
      const renderH = natH * scale;
      const offsetX = cx + (drawSize - renderW) / 2;
      const offsetY = cy + (drawSize - renderH) / 2;

      ctx.save();
      if (shadowEnabled) {
        ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
        ctx.shadowBlur = 22;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
      }
      ctx.drawImage(loadedCharImg, offsetX, offsetY, renderW, renderH);
      ctx.restore();
    }

    // If mode is character only, skip text drawing
    if (hasChar && charPosition === 'only') {
      return;
    }

    // 2. Compute text bounding box around character
    const padding = 84;
    let textAreaX = padding;
    let textAreaW = size - padding * 2;
    let textAreaTop = padding;
    let textAreaBottom = size - padding;

    if (hasChar) {
      if (charPosition === 'top') {
        textAreaTop = Math.min(size - 280, 72 + charSize + 24);
        textAreaBottom = size - 64;
      } else if (charPosition === 'left') {
        textAreaX = Math.min(size - 320, 56 + charSize + 28);
        textAreaW = size - padding - textAreaX;
      } else if (charPosition === 'right') {
        textAreaW = Math.max(260, size - 56 - charSize - 28 - padding);
      }
    }

    const effectiveFontSize =
      hasChar && (charPosition === 'left' || charPosition === 'right')
        ? Math.min(fontSize, 68)
        : hasChar && charPosition === 'top'
          ? Math.min(fontSize, 78)
          : fontSize;

    const fontFamilyMap: Record<CustomFontKey, string> = {
      bold: `800 ${effectiveFontSize}px "Plus Jakarta Sans", system-ui, sans-serif`,
      italic: `italic 700 ${effectiveFontSize}px "Plus Jakarta Sans", system-ui, sans-serif`,
      underline: `700 ${effectiveFontSize}px "DM Sans", system-ui, sans-serif`,
      monospace: `700 ${effectiveFontSize}px "JetBrains Mono", monospace`,
      handwriting: `italic 600 ${effectiveFontSize}px "Segoe Script", "Brush Script MT", "Apple Chancery", cursive`,
      serif: `700 ${effectiveFontSize}px Georgia, "Times New Roman", serif`,
    };

    ctx.font = fontFamilyMap[fontChoice];
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';

    const content = text.trim() ? text : 'Ketik Teks Warna Anda';
    const lines = wrapTextLines(ctx, content, textAreaW);

    const lineHeight = effectiveFontSize * 1.24;
    const totalHeight = lines.length * lineHeight;
    const areaMidY = (textAreaTop + textAreaBottom) / 2;
    const startY = areaMidY - totalHeight / 2 + lineHeight / 2;

    const xPos =
      align === 'center'
        ? textAreaX + textAreaW / 2
        : align === 'left'
          ? textAreaX
          : textAreaX + textAreaW;

    let fillStyle: string | CanvasGradient = solidColor;
    if (fillMode === 'gradient') {
      const stops =
        gradientId === 'custom-palette'
          ? customGradStops
          : (
              TEXT_GRADIENT_PRESETS.find((g) => g.id === gradientId) ??
              TEXT_GRADIENT_PRESETS[0]
            ).stops;
      const grad = ctx.createLinearGradient(
        textAreaX,
        startY - 30,
        textAreaX + textAreaW,
        startY + totalHeight
      );
      grad.addColorStop(0, stops[0]);
      grad.addColorStop(1, stops[1]);
      fillStyle = grad;
    }

    const drawUnderlineForLine = (lineText: string, y: number) => {
      if (fontChoice !== 'underline' || !lineText.trim()) return;
      const textWidth = ctx.measureText(lineText).width;
      const underlineY = y + effectiveFontSize * 0.48;
      let startX = xPos;
      if (align === 'center') startX = xPos - textWidth / 2;
      if (align === 'right') startX = xPos - textWidth;

      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = Math.max(4, Math.round(effectiveFontSize * 0.08));
      ctx.lineCap = 'round';
      ctx.strokeStyle = fillStyle;
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(startX + textWidth, underlineY);
      ctx.stroke();
      ctx.restore();
    };

    lines.forEach((line, idx) => {
      const y = startY + idx * lineHeight;

      if (shadowEnabled) {
        ctx.save();
        ctx.shadowColor = 'rgba(15, 23, 42, 0.28)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = fillStyle;
        if (strokeEnabled) {
          ctx.lineWidth = Math.max(8, Math.round(effectiveFontSize * 0.14));
          ctx.lineJoin = 'round';
          ctx.strokeStyle = strokeColor;
          ctx.strokeText(line, xPos, y);
        }
        ctx.fillText(line, xPos, y);
        ctx.restore();
      } else {
        if (strokeEnabled) {
          ctx.lineWidth = Math.max(8, Math.round(effectiveFontSize * 0.14));
          ctx.lineJoin = 'round';
          ctx.strokeStyle = strokeColor;
          ctx.strokeText(line, xPos, y);
        }
        ctx.fillStyle = fillStyle;
        ctx.fillText(line, xPos, y);
      }

      drawUnderlineForLine(line, y);
    });
  }, [
    text,
    fillMode,
    solidColor,
    customGradStops,
    gradientId,
    bgId,
    customBgHex,
    fontChoice,
    fontSize,
    align,
    strokeEnabled,
    strokeColor,
    shadowEnabled,
    loadedCharImg,
    charPosition,
    charSize,
  ]);

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `teks-warna-whatsapp-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
        setCopyStatus('error');
        setTimeout(() => setCopyStatus('idle'), 2800);
        return;
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2200);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2800);
    }
  };

  const handleReset = () => {
    setSelectedPaletteId(null);
    setFillMode('gradient');
    setGradientId('ocean');
    setBgId('white');
    setFontChoice('bold');
    setFontSize(86);
    setAlign('center');
    setStrokeEnabled(true);
    setStrokeColor('#FFFFFF');
    setShadowEnabled(true);
    handleRemoveCharacter();
  };

  const quickPalettes = [...customPalettes, ...PRESET_COLOR_PALETTES];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Controls */}
      <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Studio Stiker &amp; Kartu Teks Warna
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Padukan teks warna gradien, karakter AI kustom, dan font pilihan menjadi stiker atau
              kartu PNG siap kirim.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>

        {/* AI Character Generator Block */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Generator Karakter AI
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Jelaskan karakter yang Anda inginkan untuk ditempel di kartu atau stiker.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors whitespace-nowrap cursor-pointer">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                Unggah Gambar
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleUploadCharacter}
                  className="sr-only"
                />
              </label>
              {loadedCharImg && (
                <button
                  type="button"
                  onClick={handleRemoveCharacter}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Hapus Karakter
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleGenerateCharacter} className="space-y-3">
            <div>
              <label htmlFor="ai-char-prompt" className="sr-only">
                Deskripsi karakter AI
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="ai-char-prompt"
                  type="text"
                  maxLength={300}
                  value={charPrompt}
                  onChange={(e) => {
                    setCharPrompt(e.target.value);
                    if (charError) setCharError(null);
                  }}
                  placeholder="Contoh: Kucing oranye pakai kacamata hitam sambil melambai..."
                  className="flex-1 px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7A5F]/25 focus:border-[#0D7A5F]"
                />
                <button
                  type="submit"
                  disabled={isGeneratingChar}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isGeneratingChar ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      Buat Karakter AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Prompt Ideas */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 mr-1">Ide cepat:</span>
              {QUICK_CHARACTER_PROMPTS.map((qPrompt) => (
                <button
                  key={qPrompt}
                  type="button"
                  onClick={() => setCharPrompt(qPrompt)}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors cursor-pointer truncate max-w-[210px]"
                >
                  {qPrompt}
                </button>
              ))}
            </div>

            {/* Character Style & Firebase AI Logic Mode Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
                {CHARACTER_STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCharStyle(opt.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      charStyle === opt.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div
                role="group"
                aria-label="Mode generasi Firebase AI Logic"
                className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => setCharMode('vector')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    charMode === 'vector'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vektor SVG
                </button>
                <button
                  type="button"
                  onClick={() => setCharMode('image')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    charMode === 'image'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Gambar AI
                </button>
              </div>
            </div>
          </form>

          {charError && (
            <div
              role="alert"
              className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 space-y-2"
            >
              <p>{charError}</p>
              {charErrorUrl && (
                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCharMode('vector');
                      void runCharacterGeneration('vector');
                    }}
                    disabled={isGeneratingChar}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] disabled:opacity-60 rounded-md transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    Gunakan Mode Vektor SVG Sekarang
                  </button>
                  <a
                    href={charErrorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-semibold text-red-800 underline hover:text-red-950"
                  >
                    Buka Firebase AI Logic Console →
                  </a>
                </div>
              )}
            </div>
          )}

          {charPreviewUrl && loadedCharImg && (
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                  <img
                    src={charPreviewUrl}
                    alt={charTitle || 'Karakter AI'}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {charTitle || 'Karakter AI Siap'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Atur posisi &amp; ukuran karakter di bawah ini
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
                  {(
                    [
                      { id: 'top', label: 'Atas Teks' },
                      { id: 'left', label: 'Kiri Teks' },
                      { id: 'right', label: 'Kanan Teks' },
                      { id: 'only', label: 'Karakter Saja' },
                    ] as const
                  ).map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setCharPosition(pos.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        charPosition === pos.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 min-w-[170px]">
                  <label htmlFor="char-size-slider" className="text-xs font-medium text-slate-600 shrink-0">
                    Ukuran
                  </label>
                  <input
                    id="char-size-slider"
                    type="range"
                    min={200}
                    max={580}
                    step={10}
                    value={charSize}
                    onChange={(e) => setCharSize(Number(e.target.value))}
                    className="w-full accent-[#0D7A5F] cursor-pointer"
                  />
                  <span className="text-xs font-mono tabular-nums text-slate-500 w-10 text-right">
                    {charSize}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text Input */}
        <div>
          <label
            htmlFor="sticker-text-input"
            className="block text-xs font-semibold text-slate-700 mb-2"
          >
            Teks Stiker / Poster Mini
          </label>
          <textarea
            id="sticker-text-input"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ketik teks berwarna Anda di sini..."
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7A5F]/25 focus:border-[#0D7A5F] resize-y"
          />
        </div>

        {/* Quick Palette Library Strip */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Terapkan dari Pustaka Palet Warna
            </span>
            <button
              type="button"
              onClick={onOpenPaletteLibrary}
              className="text-xs font-medium text-[#0D7A5F] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Kelola &amp; Buat Palet ({customPalettes.length}/5)
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {quickPalettes.map((pal) => {
              const active = selectedPaletteId === pal.id;
              return (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => applyPaletteObject(pal)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
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

        {/* Font Style Customization (6 distinct styles) */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <span className="block text-xs font-semibold text-slate-700">
            Kustomisasi Gaya Font
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FONT_STYLE_PRESETS.map((f) => {
              const active = fontChoice === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFontChoice(f.key)}
                  className={`px-3 py-2 text-left rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? 'border-[#0D7A5F] bg-[#0D7A5F]/5 text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{f.label}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{f.sample}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fill Mode & Colors */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-700">Warna Teks</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setFillMode('gradient');
                  if (gradientId === 'custom-palette') setGradientId('ocean');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  fillMode === 'gradient'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gradien Warna
              </button>
              <button
                type="button"
                onClick={() => setFillMode('solid')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  fillMode === 'solid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Warna Solid
              </button>
            </div>
          </div>

          {fillMode === 'gradient' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TEXT_GRADIENT_PRESETS.map((preset) => {
                const active = gradientId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPaletteId(null);
                      setGradientId(preset.id);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-left rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'border-[#0D7A5F] bg-[#0D7A5F]/5 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-md shrink-0 border border-black/10"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${preset.stops[0]}, ${preset.stops[1]})`,
                      }}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              {TEXT_COLOR_PRESETS.map((c) => {
                const active = solidColor.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      setSelectedPaletteId(null);
                      setSolidColor(c.hex);
                    }}
                    title={c.name}
                    aria-label={c.name}
                    className={`w-9 h-9 rounded-lg border transition-transform cursor-pointer flex items-center justify-center ${
                      active
                        ? 'border-[#0D7A5F] ring-2 ring-[#0D7A5F]/30 scale-105'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {active && (
                      <Check
                        className={`w-4 h-4 ${
                          c.hex === '#FFFFFF' ? 'text-slate-900' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
              <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200/70">
                <input
                  type="color"
                  value={solidColor}
                  onChange={(e) => {
                    setSelectedPaletteId(null);
                    setSolidColor(e.target.value);
                  }}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                  aria-label="Pilih warna kustom"
                />
                <span className="font-mono uppercase">{solidColor}</span>
              </label>
            </div>
          )}
        </div>

        {/* Background Options */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <span className="block text-xs font-semibold text-slate-700">Latar Belakang</span>
          <div className="flex flex-wrap gap-2">
            {CANVAS_BG_PRESETS.map((bg) => {
              const active = bgId === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setBgId(bg.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-[#0D7A5F] bg-[#0D7A5F]/5 text-slate-900'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border shrink-0 ${
                      bg.hex === null
                        ? 'bg-slate-100 border-dashed border-slate-400'
                        : 'border-slate-300'
                    }`}
                    style={bg.hex ? { backgroundColor: bg.hex } : undefined}
                    aria-hidden="true"
                  />
                  {bg.name}
                </button>
              );
            })}
            <label
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                bgId === 'custom'
                  ? 'border-[#0D7A5F] bg-[#0D7A5F]/5 text-slate-900'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <input
                type="color"
                value={customBgHex}
                onChange={(e) => {
                  setCustomBgHex(e.target.value);
                  setBgId('custom');
                }}
                className="w-4 h-4 rounded border-0 p-0 cursor-pointer"
                aria-label="Warna latar kustom"
              />
              <span>Latar Kustom</span>
            </label>
          </div>
        </div>

        {/* Size & Alignment & Effects */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="sticker-size-range"
                className="text-xs font-semibold text-slate-700"
              >
                Ukuran Teks
              </label>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {fontSize}px
              </span>
            </div>
            <input
              id="sticker-size-range"
              type="range"
              min={44}
              max={132}
              step={2}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[#0D7A5F] cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['left', 'center', 'right'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setAlign(dir)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    align === dir
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dir === 'left' ? 'Rata Kiri' : dir === 'center' ? 'Rata Tengah' : 'Rata Kanan'}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={strokeEnabled}
                  onChange={(e) => setStrokeEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0D7A5F]"
                />
                Garis Tepi
                {strokeEnabled && (
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-5 h-5 rounded border border-slate-200 p-0 cursor-pointer"
                    aria-label="Warna garis tepi"
                  />
                )}
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shadowEnabled}
                  onChange={(e) => setShadowEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0D7A5F]"
                />
                Bayangan
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Right Canvas Preview & Export */}
      <section className="lg:col-span-5 lg:sticky lg:top-22 bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Hasil Gambar / Stiker</h3>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              Resolusi ekspor 1024 × 1024 px (PNG)
            </p>
          </div>
        </div>

        <div className="p-5 flex flex-col items-center justify-center bg-slate-50 gap-2">
          <div className="w-full max-w-[360px] aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              aria-label="Pratinjau gambar teks warna dan karakter WhatsApp"
            />
          </div>
          {bgId === 'transparent' && (
            <p className="text-[11px] text-slate-500">
              Mode PNG transparan aktif (latar belakang tidak ikut diekspor).
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={handleCopyImage}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copyStatus === 'copied' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0D7A5F]" aria-hidden="true" />
                Gambar Disalin
              </>
            ) : copyStatus === 'error' ? (
              'Gunakan Unduh PNG'
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                Salin Gambar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Unduh PNG
          </button>
        </div>
      </section>
    </div>
  );
};
