export type TextStyleId =
  | 'blue-square'
  | 'blue-hashtag'
  | 'bold-sans'
  | 'bold-serif'
  | 'italic-serif'
  | 'bold-italic'
  | 'script'
  | 'fraktur'
  | 'monospace'
  | 'double-struck'
  | 'bubble-dark'
  | 'bubble-light'
  | 'small-caps'
  | 'underline'
  | 'strikethrough-unicode'
  | 'upside-down'
  | 'plain';

export type ColorFrameId =
  | 'none'
  | 'ocean'
  | 'emerald'
  | 'crimson'
  | 'amber'
  | 'violet'
  | 'monochrome';

export interface TextStyleOption {
  id: TextStyleId;
  name: string;
  category: 'warna-biru' | 'tipografi' | 'dekoratif';
  description: string;
  sample: string;
}

export interface ColorFrameOption {
  id: ColorFrameId;
  name: string;
  swatchHex: string;
  topEmoji: string;
  bulletEmoji: string;
  bottomEmoji: string;
}

export const TEXT_STYLE_OPTIONS: TextStyleOption[] = [
  {
    id: 'blue-hashtag',
    name: 'Biru Hashtag (#Teks_Biru)',
    category: 'warna-biru',
    description: 'Format tagar agar seluruh kalimat tampil biru & bisa diklik di WhatsApp.',
    sample: '#Pesan_Biru_WA',
  },
  {
    id: 'blue-square',
    name: 'Biru Emoji Huruf (A–Z)',
    category: 'warna-biru',
    description: 'Mengubah huruf menjadi simbol huruf biru A–Z untuk judul singkat.',
    sample: '🇭 🇦 🇱 🇴',
  },
  {
    id: 'bold-sans',
    name: 'Tebal Modern (Sans)',
    category: 'tipografi',
    description: 'Huruf tebal tegas bergaya modern, terbaca jelas di Android & iPhone.',
    sample: '𝗧𝗲𝗸𝘀 𝗧𝗲𝗯𝗮𝗹',
  },
  {
    id: 'bold-serif',
    name: 'Tebal Klasik (Serif)',
    category: 'tipografi',
    description: 'Gaya editorial tebal yang cocok untuk judul pengumuman resmi.',
    sample: '𝐓𝐞𝐤𝐬 𝐊𝐥𝐚𝐬𝐢𝐤',
  },
  {
    id: 'italic-serif',
    name: 'Miring Elegan',
    category: 'tipografi',
    description: 'Huruf miring halus untuk penekanan kata atau kutipan.',
    sample: '𝑇𝑒𝑘𝑠 𝑀𝑖𝑟𝑖𝑛𝑔',
  },
  {
    id: 'bold-italic',
    name: 'Tebal Miring',
    category: 'tipografi',
    description: 'Kombinasi tebal dan miring untuk sorotan promo atau headline.',
    sample: '𝙏𝙚𝙠𝙨 𝙎𝙤𝙧𝙤𝙩𝙖𝙣',
  },
  {
    id: 'script',
    name: 'Tulisan Tangan (Kaligrafi)',
    category: 'tipografi',
    description: 'Tulisan tangan bersambung untuk ucapan spesial dan undangan.',
    sample: '𝓣𝓮𝓴𝓼 𝓢𝓪𝓶𝓫𝓾𝓷𝓰',
  },
  {
    id: 'fraktur',
    name: 'Gotik Tegas',
    category: 'tipografi',
    description: 'Gaya klasik bergaris tajam untuk judul poster atau nama komunitas.',
    sample: '𝕿𝖊𝖐𝖘 𝕲𝖔𝖙𝖎𝖐',
  },
  {
    id: 'monospace',
    name: 'Mesin Tik (Monospace)',
    category: 'tipografi',
    description: 'Lebar huruf seragam, ideal untuk kode voucher, harga, dan jadwal.',
    sample: '𝚃𝚎𝚔𝚜 𝙺𝚘𝚍𝚎',
  },
  {
    id: 'double-struck',
    name: 'Garis Ganda',
    category: 'tipografi',
    description: 'Huruf berongga bergaris ganda untuk headline yang bersih.',
    sample: '𝕋𝕖𝕜𝕤 𝔾𝕒𝕟𝕕𝕒',
  },
  {
    id: 'bubble-dark',
    name: 'Lingkaran Gelap',
    category: 'dekoratif',
    description: 'Huruf kapital putih di dalam lingkaran gelap solid.',
    sample: '🅣🅔🅧🅢',
  },
  {
    id: 'bubble-light',
    name: 'Lingkaran Garis',
    category: 'dekoratif',
    description: 'Huruf di dalam gelembung lingkaran tipis.',
    sample: 'Ⓣⓔⓚⓢ',
  },
  {
    id: 'small-caps',
    name: 'Kapital Kecil',
    category: 'tipografi',
    description: 'Huruf kecil diubah menjadi kapital mini yang rapi.',
    sample: 'ᴛᴇᴋꜱ ᴋᴇᴄɪʟ',
  },
  {
    id: 'underline',
    name: 'Garis Bawah',
    category: 'dekoratif',
    description: 'Menambahkan garis bawah pada setiap huruf.',
    sample: 'T̲e̲k̲s̲ G̲a̲r̲i̲s̲',
  },
  {
    id: 'strikethrough-unicode',
    name: 'Coret Unicode',
    category: 'dekoratif',
    description: 'Efek coret permanen meski dipadukan dengan gaya lain.',
    sample: 'T̶e̶k̶s̶ C̶o̶r̶e̶t̶',
  },
  {
    id: 'upside-down',
    name: 'Teks Terbalik',
    category: 'dekoratif',
    description: 'Membalik urutan dan arah huruf 180 derajat.',
    sample: 'ʞᴉlɐqɹǝ⊥',
  },
  {
    id: 'plain',
    name: 'Teks Asli (Dengan Format WA)',
    category: 'tipografi',
    description: 'Pertahankan teks asli untuk memakai format *tebal*, _miring_, atau aksen warna.',
    sample: 'Teks Normal',
  },
];

export const COLOR_FRAME_OPTIONS: ColorFrameOption[] = [
  {
    id: 'none',
    name: 'Tanpa Bingkai',
    swatchHex: '#94A3B8',
    topEmoji: '',
    bulletEmoji: '',
    bottomEmoji: '',
  },
  {
    id: 'ocean',
    name: 'Biru Samudra',
    swatchHex: '#0284C7',
    topEmoji: '──────────',
    bulletEmoji: '🔵',
    bottomEmoji: '──────────',
  },
  {
    id: 'emerald',
    name: 'Hijau Zamrud',
    swatchHex: '#059669',
    topEmoji: '──────────',
    bulletEmoji: '🟢',
    bottomEmoji: '──────────',
  },
  {
    id: 'crimson',
    name: 'Merah Menyala',
    swatchHex: '#DC2626',
    topEmoji: '──────────',
    bulletEmoji: '🔴',
    bottomEmoji: '──────────',
  },
  {
    id: 'amber',
    name: 'Kuning Emas',
    swatchHex: '#D97706',
    topEmoji: '──────────',
    bulletEmoji: '🟡',
    bottomEmoji: '──────────',
  },
  {
    id: 'violet',
    name: 'Ungu Royal',
    swatchHex: '#7C3AED',
    topEmoji: '──────────',
    bulletEmoji: '🟣',
    bottomEmoji: '──────────',
  },
  {
    id: 'monochrome',
    name: 'Hitam Tegas',
    swatchHex: '#1E293B',
    topEmoji: '──────────',
    bulletEmoji: '•',
    bottomEmoji: '──────────',
  },
];

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';

function mapByCodePointRanges(
  char: string,
  upperStart: number,
  lowerStart: number,
  digitStart?: number,
  exceptions: Record<string, string> = {}
): string {
  if (exceptions[char]) return exceptions[char];
  const uIdx = UPPER.indexOf(char);
  if (uIdx !== -1) return String.fromCodePoint(upperStart + uIdx);
  const lIdx = LOWER.indexOf(char);
  if (lIdx !== -1) return String.fromCodePoint(lowerStart + lIdx);
  if (digitStart !== undefined) {
    const dIdx = DIGITS.indexOf(char);
    if (dIdx !== -1) return String.fromCodePoint(digitStart + dIdx);
  }
  return char;
}

const SMALL_CAPS_MAP: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
};

const UPSIDE_DOWN_MAP: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ',
  j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ',
  s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: '𐐒', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H', I: 'I',
  J: 'ſ', K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ',
  S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': '\'', '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[',
};

const KEYCAP_DIGITS: Record<string, string> = {
  '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
  '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
};

const DOUBLE_STRUCK_EXCEPTIONS: Record<string, string> = {
  C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ',
};

const SCRIPT_EXCEPTIONS: Record<string, string> = {
  B: '𝓑', E: '𝓔', F: '𝓕', H: '𝓗', I: '𝓘', L: '𝓛', M: '𝓜', R: '𝓡',
  e: '𝓮', g: '𝓰', o: '𝓸',
};

const FRAKTUR_EXCEPTIONS: Record<string, string> = {
  C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ',
};

function convertLineToBlueSquares(line: string): string {
  const tokens: string[] = [];
  for (const ch of line) {
    const upper = ch.toUpperCase();
    const idx = UPPER.indexOf(upper);
    if (idx !== -1) {
      tokens.push(String.fromCodePoint(0x1f1e6 + idx));
    } else if (KEYCAP_DIGITS[ch]) {
      tokens.push(KEYCAP_DIGITS[ch]);
    } else if (ch === ' ') {
      tokens.push('  ');
    } else {
      tokens.push(ch);
    }
  }

  // Separate adjacent tokens with a standard space so Regional Indicators
  // never merge into country flags and never produce hidden-glyph boxes.
  let out = '';
  for (let i = 0; i < tokens.length; i++) {
    const curr = tokens[i];
    const next = tokens[i + 1];
    out += curr;
    if (next && curr !== '  ' && next !== '  ') {
      out += ' ';
    }
  }
  return out;
}

function convertLineToBlueHashtag(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('#')) {
    return trimmed.replace(/\s+/g, '_');
  }
  const sanitized = trimmed
    .replace(/[^\p{L}\p{N}\s_]/gu, '')
    .trim()
    .replace(/\s+/g, '_');
  return sanitized ? `#${sanitized}` : trimmed;
}

export function transformText(
  input: string,
  style: TextStyleId,
  options: {
    blueSpaced?: boolean;
    frameId?: ColorFrameId;
    frameTitle?: string;
    waWrap?: 'none' | 'bold' | 'italic' | 'strike' | 'mono';
  } = {}
): string {
  const {
    frameId = 'none',
    waWrap = 'none',
  } = options;

  let transformed = '';

  if (style === 'plain') {
    transformed = input;
  } else if (style === 'blue-square') {
    transformed = input
      .split('\n')
      .map((line) => convertLineToBlueSquares(line))
      .join('\n');
  } else if (style === 'blue-hashtag') {
    transformed = input
      .split('\n')
      .map((line) => convertLineToBlueHashtag(line))
      .join('\n');
  } else if (style === 'upside-down') {
    transformed = input
      .split('\n')
      .map((line) =>
        Array.from(line)
          .reverse()
          .map((ch) => UPSIDE_DOWN_MAP[ch] ?? ch)
          .join('')
      )
      .join('\n');
  } else {
    transformed = Array.from(input)
      .map((ch) => {
        switch (style) {
          case 'bold-sans':
            return mapByCodePointRanges(ch, 0x1d5d4, 0x1d5ee, 0x1d7ec);
          case 'bold-serif':
            return mapByCodePointRanges(ch, 0x1d400, 0x1d41a, 0x1d7ce);
          case 'italic-serif':
            return mapByCodePointRanges(ch, 0x1d434, 0x1d44e, undefined, { h: 'ℎ' });
          case 'bold-italic':
            return mapByCodePointRanges(ch, 0x1d63c, 0x1d656);
          case 'script':
            return mapByCodePointRanges(ch, 0x1d4d0, 0x1d4ea, undefined, SCRIPT_EXCEPTIONS);
          case 'fraktur':
            return mapByCodePointRanges(ch, 0x1d56c, 0x1d586, undefined, FRAKTUR_EXCEPTIONS);
          case 'monospace':
            return mapByCodePointRanges(ch, 0x1d670, 0x1d68a, 0x1d7f6);
          case 'double-struck':
            return mapByCodePointRanges(ch, 0x1d538, 0x1d552, 0x1d7d8, DOUBLE_STRUCK_EXCEPTIONS);
          case 'bubble-dark': {
            const up = ch.toUpperCase();
            const idx = UPPER.indexOf(up);
            if (idx !== -1) return String.fromCodePoint(0x1f150 + idx);
            return ch;
          }
          case 'bubble-light': {
            const uIdx = UPPER.indexOf(ch);
            if (uIdx !== -1) return String.fromCodePoint(0x24b6 + uIdx);
            const lIdx = LOWER.indexOf(ch);
            if (lIdx !== -1) return String.fromCodePoint(0x24d0 + lIdx);
            if (ch === '0') return '⓪';
            const dIdx = DIGITS.indexOf(ch);
            if (dIdx > 0) return String.fromCodePoint(0x2460 + dIdx - 1);
            return ch;
          }
          case 'small-caps':
            return SMALL_CAPS_MAP[ch.toLowerCase()] ?? ch;
          case 'underline':
            return ch === '\n' || ch === ' ' ? ch : `${ch}\u0332`;
          case 'strikethrough-unicode':
            return ch === '\n' || ch === ' ' ? ch : `${ch}\u0336`;
          default:
            return ch;
        }
      })
      .join('');
  }

  if (waWrap !== 'none' && transformed.trim().length > 0 && style !== 'blue-square') {
    const markers: Record<Exclude<typeof waWrap, 'none'>, [string, string]> = {
      bold: ['*', '*'],
      italic: ['_', '_'],
      strike: ['~', '~'],
      mono: ['```', '```'],
    };
    const [open, close] = markers[waWrap];
    transformed = transformed
      .split('\n')
      .map((line) => (line.trim() ? `${open}${line}${close}` : line))
      .join('\n');
  }

  const frame = COLOR_FRAME_OPTIONS.find((f) => f.id === frameId);
  if (frame && frame.id !== 'none' && transformed.trim().length > 0) {
    const bodyLines = transformed
      .split('\n')
      .map((line) => (line.trim() ? `${frame.bulletEmoji} ${line}` : line))
      .join('\n');
    transformed = `${frame.topEmoji}\n${bodyLines}\n${frame.bottomEmoji}`;
  }

  return transformed;
}

export interface WhatsAppSegment {
  text: string;
  type: 'text' | 'bold' | 'italic' | 'strike' | 'mono' | 'codeblock' | 'hashtag';
}

export function parseWhatsAppLine(line: string): {
  isQuote: boolean;
  isBullet: boolean;
  segments: WhatsAppSegment[];
} {
  let content = line;
  let isQuote = false;
  let isBullet = false;

  if (content.startsWith('> ')) {
    isQuote = true;
    content = content.slice(2);
  } else if (/^[-*] /.test(content)) {
    isBullet = true;
    content = content.slice(2);
  }

  const segments: WhatsAppSegment[] = [];
  const tokenRegex =
    /(```[\s\S]*?```|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|#[A-Za-z0-9_\u00C0-\u024F]+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: content.slice(lastIndex, match.index), type: 'text' });
    }
    const token = match[0];
    if (token.startsWith('```') && token.endsWith('```') && token.length > 6) {
      segments.push({ text: token.slice(3, -3), type: 'codeblock' });
    } else if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      segments.push({ text: token.slice(1, -1), type: 'mono' });
    } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      segments.push({ text: token.slice(1, -1), type: 'bold' });
    } else if (token.startsWith('_') && token.endsWith('_') && token.length > 2) {
      segments.push({ text: token.slice(1, -1), type: 'italic' });
    } else if (token.startsWith('~') && token.endsWith('~') && token.length > 2) {
      segments.push({ text: token.slice(1, -1), type: 'strike' });
    } else if (token.startsWith('#')) {
      segments.push({ text: token, type: 'hashtag' });
    } else {
      segments.push({ text: token, type: 'text' });
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({ text: content.slice(lastIndex), type: 'text' });
  }

  if (segments.length === 0) {
    segments.push({ text: '', type: 'text' });
  }

  return { isQuote, isBullet, segments };
}
