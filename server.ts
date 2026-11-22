import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const ALLOWED_TAGS = new Set([
  'svg',
  'g',
  'path',
  'circle',
  'ellipse',
  'rect',
  'polygon',
  'polyline',
  'line',
  'defs',
  'lineargradient',
  'radialgradient',
  'stop',
]);

function sanitizeCharacterSvg(rawSvg: string): string | null {
  const match = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) return null;

  let svg = match[0];

  svg = svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<image[\s\S]*?>/gi, '')
    .replace(/<use[\s\S]*?>/gi, '');

  svg = svg
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');

  svg = svg.replace(/<\/?([a-zA-Z0-9:-]+)([^>]*)>/g, (full, tagName: string) => {
    if (!ALLOWED_TAGS.has(tagName.toLowerCase())) {
      return '';
    }
    return full;
  });

  svg = svg.replace(/<svg([^>]*)>/i, (_full, attrs: string) => {
    let cleanedAttrs = attrs
      .replace(/\swidth\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
      .replace(/\sheight\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
    if (!/xmlns\s*=/i.test(cleanedAttrs)) {
      cleanedAttrs += ' xmlns="http://www.w3.org/2000/svg"';
    }
    if (!/viewBox\s*=/i.test(cleanedAttrs)) {
      cleanedAttrs += ' viewBox="0 0 512 512"';
    }
    return `<svg${cleanedAttrs} width="512" height="512">`;
  });

  return svg;
}

const CHARACTER_STYLE_GUIDANCE: Record<string, string> = {
  sticker:
    'Cute bold sticker mascot style with thick dark outlines (#0F172A, stroke-width 10-14), expressive big eyes, soft highlights, and a clean sticker die-cut feel.',
  chibi:
    'Adorable chibi character with oversized head, cute rosy cheeks, sparkling eyes, clean cel-shaded vector shapes, and clear dark strokes.',
  flat:
    'Modern clean flat editorial vector character with balanced geometric shapes, crisp contrast, and clean silhouette.',
  mascot:
    'Friendly commercial brand mascot style, dynamic cheerful pose, crisp bold curves, and high legibility at small sticker sizes.',
};

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/generate-character', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error:
            'Kunci API Gemini belum tersedia di server. Periksa panel Settings > Secrets.',
        });
      }

      const body = req.body ?? {};
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
      const styleKey =
        typeof body.style === 'string' && CHARACTER_STYLE_GUIDANCE[body.style]
          ? body.style
          : 'sticker';
      const primaryColor =
        typeof body.primaryColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.primaryColor)
          ? body.primaryColor
          : '#0D7A5F';
      const secondaryColor =
        typeof body.secondaryColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.secondaryColor)
          ? body.secondaryColor
          : '#0284C7';

      if (prompt.length < 2 || prompt.length > 300) {
        return res.status(400).json({
          error: 'Deskripsi karakter harus diisi antara 2 hingga 300 karakter.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const styleInstruction = CHARACTER_STYLE_GUIDANCE[styleKey];
      const candidateModels = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
      let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
      let lastErr: unknown = null;

      for (const modelName of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: `Buatkan ilustrasi karakter SVG vektor untuk stiker & kartu WhatsApp berdasarkan deskripsi: "${prompt}".
Gunakan warna aksen harmonis dengan ${primaryColor} dan ${secondaryColor} selain warna natural karakter.
Gaya visual: ${styleInstruction}`,
            config: {
              ...(modelName === 'gemini-4-hydrogen'
                ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
                : {}),
              systemInstruction: `You are an expert 2D vector character illustrator creating crisp sticker illustrations.
Return ONLY valid JSON matching the schema with:
- "title": short Indonesian character title (2-5 words).
- "svg": a complete, rich, expressive SVG character illustration with viewBox="0 0 512 512".
Rules for the SVG:
1. Background MUST be completely transparent (do NOT draw a full-canvas background rectangle).
2. Center the character inside x: 56..456, y: 40..472 so nothing is clipped.
3. Use 15-35 well-crafted SVG elements (<g>, <path>, <circle>, <ellipse>, <rect>, <polygon>) with clean round linecaps/linejoins, expressive face/eyes, shading highlights, and clear silhouette.
4. Only use standard SVG shapes and fill/stroke attributes. Never include <script>, <foreignObject>, <style>, <image>, <use>, or event attributes.`,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  svg: { type: Type.STRING },
                },
                required: ['title', 'svg'],
              },
            },
          });
          break;
        } catch (err: unknown) {
          lastErr = err;
          const status = (err as { status?: number })?.status;
          const msg = err instanceof Error ? err.message : String(err);
          const isTransient =
            status === 503 ||
            status === 429 ||
            msg.includes('UNAVAILABLE') ||
            msg.includes('high demand') ||
            msg.includes('RESOURCE_EXHAUSTED');
          if (!isTransient) {
            throw err;
          }
        }
      }

      if (!response) {
        throw lastErr ?? new Error('Layanan AI sedang sibuk. Silakan coba lagi sebentar.');
      }

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({
          error: 'Model AI tidak mengembalikan data karakter. Silakan coba deskripsi lain.',
        });
      }

      let parsed: { title?: string; svg?: string };
      try {
        parsed = JSON.parse(rawText);
      } catch {
        return res.status(502).json({
          error: 'Format respons karakter tidak valid. Silakan coba lagi.',
        });
      }

      const sanitizedSvg = typeof parsed.svg === 'string' ? sanitizeCharacterSvg(parsed.svg) : null;
      if (!sanitizedSvg) {
        return res.status(502).json({
          error: 'SVG karakter yang dihasilkan tidak valid. Silakan coba deskripsi lain.',
        });
      }

      return res.json({
        title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : prompt,
        svg: sanitizedSvg,
      });
    } catch (err: unknown) {
      const rawMsg =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat karakter.';
      const status =
        typeof (err as { status?: number })?.status === 'number'
          ? (err as { status: number }).status
          : 500;
      const friendlyMsg =
        status === 503 || status === 429 || rawMsg.includes('high demand')
          ? 'Server AI sedang mengalami trafik tinggi. Silakan coba klik Buat Karakter AI lagi dalam beberapa detik.'
          : `Gagal membuat karakter AI: ${rawMsg}`;
      return res.status(status >= 400 && status < 600 ? status : 500).json({
        error: friendlyMsg,
      });
    }
  });

  const httpServer = http.createServer(app);

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: { server: httpServer },
        ws: { server: httpServer },
        hmr: false,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`WarnaWA server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
