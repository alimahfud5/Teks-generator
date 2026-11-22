import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  ResponseModality,
  Schema,
} from 'firebase/ai';
import firebaseConfig from '../../firebase-applet-config.json';

export type CharacterStyle = 'sticker' | 'chibi' | 'flat' | 'mascot';
export type CharacterGenerationMode = 'vector' | 'image';

export interface GeneratedCharacterResult {
  title: string;
  imageUrl: string;
  isObjectUrl: boolean;
}

const ALLOWED_SVG_TAGS = new Set([
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

export function sanitizeCharacterSvg(rawSvg: string): string | null {
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
    if (!ALLOWED_SVG_TAGS.has(tagName.toLowerCase())) {
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

const CHARACTER_STYLE_GUIDANCE: Record<CharacterStyle, string> = {
  sticker:
    'Cute bold sticker mascot style with thick dark outlines (#0F172A, stroke-width 10-14), expressive big eyes, soft highlights, and a clean sticker die-cut look.',
  chibi:
    'Adorable chibi character with oversized head, cute rosy cheeks, sparkling eyes, clean cel-shaded shapes, and crisp dark strokes.',
  flat:
    'Modern clean flat editorial character with balanced geometric shapes, crisp contrast, and clean silhouette.',
  mascot:
    'Friendly commercial brand mascot style, dynamic cheerful pose, crisp bold curves, and high legibility at small sticker sizes.',
};

function getFirebaseAIInstance() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getAI(app, { backend: new GoogleAIBackend() });
}

export class FirebaseAIAccessError extends Error {
  readonly consoleUrl: string;
  constructor(message: string, consoleUrl: string) {
    super(message);
    this.name = 'FirebaseAIAccessError';
    this.consoleUrl = consoleUrl;
  }
}

let firebaseAiBlocked = false;

function isAccessDeniedError(err: unknown): boolean {
  const rawMessage = err instanceof Error ? err.message : String(err);
  return (
    rawMessage.includes('ACCESS_DENIED') ||
    rawMessage.includes('SERVICE_DISABLED') ||
    rawMessage.includes('api-not-enabled') ||
    rawMessage.includes('Permission denied on the service') ||
    rawMessage.includes('[403')
  );
}

function createSvgObjectResult(title: string, rawSvg: string): GeneratedCharacterResult {
  const sanitizedSvg = sanitizeCharacterSvg(rawSvg);
  if (!sanitizedSvg) {
    throw new Error('SVG karakter tidak valid. Silakan coba deskripsi lain.');
  }
  const blob = new Blob([sanitizedSvg], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  return {
    title,
    imageUrl: objectUrl,
    isObjectUrl: true,
  };
}

async function generateVectorViaServer(params: {
  prompt: string;
  style: CharacterStyle;
  primaryColor: string;
  secondaryColor: string;
}): Promise<GeneratedCharacterResult> {
  const res = await fetch('/api/generate-character', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const payload = (await res.json().catch(() => ({}))) as {
    title?: string;
    svg?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(
      payload.error || 'Gagal membuat karakter vektor melalui server. Silakan coba lagi.'
    );
  }

  if (typeof payload.svg !== 'string' || !payload.svg.trim()) {
    throw new Error('Server tidak mengembalikan SVG karakter yang valid.');
  }

  const title =
    typeof payload.title === 'string' && payload.title.trim()
      ? payload.title.trim()
      : params.prompt;

  return createSvgObjectResult(title, payload.svg);
}

function handleFirebaseAIError(err: unknown): never {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const projectId = firebaseConfig.projectId;
  const aiLogicUrl = `https://console.firebase.google.com/project/${projectId}/ailogic/`;

  if (isAccessDeniedError(err)) {
    firebaseAiBlocked = true;
    throw new FirebaseAIAccessError(
      `Mode Gambar AI membutuhkan layanan Firebase AI Logic aktif pada proyek "${projectId}". Anda bisa langsung memakai mode Vektor SVG tanpa konfigurasi tambahan, atau aktifkan Firebase AI Logic di Console.`,
      aiLogicUrl
    );
  }

  throw err instanceof Error ? err : new Error(rawMessage);
}

export async function generateCharacterWithFirebaseAI(params: {
  prompt: string;
  style: CharacterStyle;
  mode: CharacterGenerationMode;
  primaryColor: string;
  secondaryColor: string;
}): Promise<GeneratedCharacterResult> {
  const trimmed = params.prompt.trim();
  if (trimmed.length < 2 || trimmed.length > 300) {
    throw new Error('Deskripsi karakter harus diisi antara 2 hingga 300 karakter.');
  }

  if (params.mode === 'vector' && firebaseAiBlocked) {
    return generateVectorViaServer({
      prompt: trimmed,
      style: params.style,
      primaryColor: params.primaryColor,
      secondaryColor: params.secondaryColor,
    });
  }

  const ai = getFirebaseAIInstance();
  const styleDesc = CHARACTER_STYLE_GUIDANCE[params.style];

  try {
    if (params.mode === 'image') {
      const model = getGenerativeModel(ai, {
        model: 'gemini-2.5-flash-image',
        generationConfig: {
          responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
        },
      });

      const imagePrompt = `Create a single centered character illustration for a WhatsApp sticker/card based on: "${trimmed}".
Visual style: ${styleDesc}
Harmonize accent colors with ${params.primaryColor} and ${params.secondaryColor}.
Keep the background clean, plain solid white with zero text or letters in the image.`;

      const result = await model.generateContent(imagePrompt);
      const response = result.response;
      const inlineParts = response.inlineDataParts();

      if (!inlineParts || inlineParts.length === 0) {
        throw new Error(
          'Firebase AI Logic tidak mengembalikan gambar untuk prompt tersebut. Coba deskripsi lain atau gunakan mode Vektor SVG.'
        );
      }

      const firstImg = inlineParts[0].inlineData;
      const dataUrl = `data:${firstImg.mimeType};base64,${firstImg.data}`;
      return {
        title: trimmed,
        imageUrl: dataUrl,
        isObjectUrl: false,
      };
    }

    // Vector SVG character generation via Firebase AI Logic, with automatic server fallback on 403
    const vectorSchema = Schema.object({
      properties: {
        title: Schema.string({
          description: 'Short Indonesian title for the character (2-5 words).',
        }),
        svg: Schema.string({
          description:
            'Complete transparent-background SVG character artwork with viewBox="0 0 512 512".',
        }),
      },
    });

    const model = getGenerativeModel(ai, {
      model: 'gemini-2.5-flash',
      systemInstruction: `You are an expert 2D vector character illustrator creating crisp sticker illustrations.
Return ONLY valid JSON matching the schema with:
- "title": short Indonesian character title (2-5 words).
- "svg": a complete, rich, expressive SVG character illustration with viewBox="0 0 512 512".
Rules for the SVG:
1. Background MUST be completely transparent (do NOT draw a full-canvas background rectangle).
2. Center the character inside x: 56..456, y: 40..472 so nothing is clipped.
3. Use 15-35 well-crafted SVG elements (<g>, <path>, <circle>, <ellipse>, <rect>, <polygon>) with clean round linecaps/linejoins, expressive face/eyes, shading highlights, and clear silhouette.
4. Only use standard SVG shapes and fill/stroke attributes. Never include <script>, <foreignObject>, <style>, <image>, <use>, or event attributes.`,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: vectorSchema,
      },
    });

    const vectorPrompt = `Buatkan ilustrasi karakter SVG vektor untuk stiker & kartu WhatsApp berdasarkan deskripsi: "${trimmed}".
Gunakan warna aksen harmonis dengan ${params.primaryColor} dan ${params.secondaryColor} selain warna natural karakter.
Gaya visual: ${styleDesc}`;

    const result = await model.generateContent(vectorPrompt);
    const rawText = result.response.text().trim();

    if (!rawText) {
      throw new Error('Firebase AI Logic tidak mengembalikan data karakter. Silakan coba lagi.');
    }

    let parsed: { title?: string; svg?: string };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error('Format respons karakter tidak valid. Silakan coba lagi.');
    }

    if (typeof parsed.svg !== 'string') {
      throw new Error('SVG karakter tidak valid. Silakan coba deskripsi lain.');
    }

    const title =
      typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : trimmed;

    return createSvgObjectResult(title, parsed.svg);
  } catch (err: unknown) {
    if (params.mode === 'vector' && isAccessDeniedError(err)) {
      firebaseAiBlocked = true;
      return generateVectorViaServer({
        prompt: trimmed,
        style: params.style,
        primaryColor: params.primaryColor,
        secondaryColor: params.secondaryColor,
      });
    }
    handleFirebaseAIError(err);
  }
}
