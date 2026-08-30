/**
 * Turning a committed SVG into a download, at a chosen scale and colour.
 *
 * Extracted from Logo.stories.tsx when the Shapes page needed the same thing.
 * Rasterising to PNG is fiddly enough — read the viewBox, resize, round-trip
 * through a data URI, draw to a canvas — that a second copy would have drifted
 * from the first within a release. Both pages now call this.
 *
 * Everything is generated from the committed vector at request time rather than
 * shipping pre-baked PNGs, so there is exactly one file per asset and any size
 * or colour is available from it.
 */

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function readViewBoxSize(svgText: string): { width: number; height: number } {
  const match = svgText.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!match) return { width: 100, height: 100 };
  return { width: parseFloat(match[1]), height: parseFloat(match[2]) };
}

function withSize(svgText: string, width: number, height: number): string {
  return svgText
    .replace(/width="[\d.]+"/, `width="${width}"`)
    .replace(/height="[\d.]+"/, `height="${height}"`);
}

/**
 * Repaint every non-`none` fill.
 *
 * The shape vectors ship filled with the brand red because that is how they
 * were exported, while the palette gives each one a different colour. Rewriting
 * the fill on the way out means one file per shape instead of twenty times
 * eleven — the same reasoning as recolouring with a CSS mask on screen.
 *
 * `fill="none"` is left alone: on these files it is the root element declaring
 * it paints nothing itself, and overriding it fills the bounding box.
 */
function withFill(svgText: string, fill: string): string {
  return svgText.replace(/fill="(?!none")[^"]*"/g, `fill="${fill}"`);
}

async function prepare(svgUrl: string, scale: number, fill?: string) {
  const raw = await (await fetch(svgUrl)).text();
  const text = fill ? withFill(raw, fill) : raw;
  const { width, height } = readViewBoxSize(text);
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);
  return { sized: withSize(text, targetWidth, targetHeight), targetWidth, targetHeight };
}

export async function downloadSvg(
  svgUrl: string,
  filenameBase: string,
  scale: number,
  fill?: string
) {
  const { sized } = await prepare(svgUrl, scale, fill);
  saveBlob(new Blob([sized], { type: 'image/svg+xml' }), `${filenameBase}@${scale}x.svg`);
}

export async function downloadPng(
  svgUrl: string,
  filenameBase: string,
  scale: number,
  fill?: string
) {
  const { sized, targetWidth, targetHeight } = await prepare(svgUrl, scale, fill);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    canvas.toBlob((blob) => {
      if (blob) saveBlob(blob, `${filenameBase}@${scale}x.png`);
    }, 'image/png');
  };
  img.src = dataUrl;
}

/**
 * Generate at an arbitrary scale or an exact pixel width.
 *
 * `downloadSvg`/`downloadPng` above take a scale, which covers the fixed 1x/2x/4x
 * buttons on the Logo and Shapes pages. The help chat needs more than that: a
 * visitor asks for "the mark at 4x" or "512px wide", and the honest answer is the
 * file, not a link to a page with different buttons on it.
 *
 * Everything is still derived from the one committed vector at request time, so
 * there is no size matrix to ship and no new file to keep in sync.
 */
export async function downloadAtSize(
  svgUrl: string,
  filenameBase: string,
  options: { format: 'svg' | 'png'; scale?: number; width?: number; fill?: string }
): Promise<void> {
  const raw = await (await fetch(svgUrl)).text();
  const text = options.fill ? withFill(raw, options.fill) : raw;
  const { width, height } = readViewBoxSize(text);

  // A width request wins over a scale: it is the more specific of the two, and
  // asking for both is a caller bug rather than something to reconcile silently.
  const scale = options.width ? options.width / width : (options.scale ?? 1);
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const sized = withSize(text, targetWidth, targetHeight);

  // Name it after what was asked for. `@1.7067x` is what a width request would
  // otherwise produce, which tells the person who downloaded it nothing.
  const suffix = options.width ? `@${targetWidth}px` : `@${options.scale ?? 1}x`;

  if (options.format === 'svg') {
    saveBlob(new Blob([sized], { type: 'image/svg+xml' }), `${filenameBase}${suffix}.svg`);
    return;
  }

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve();
        return;
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      canvas.toBlob((blob) => {
        if (blob) saveBlob(blob, `${filenameBase}${suffix}.png`);
        resolve();
      }, 'image/png');
    };
    // Resolve rather than hang if the vector will not decode; the caller shows
    // its own failure message.
    img.onerror = () => resolve();
    img.src = dataUrl;
  });
}

import { colors } from '../tokens.mjs';

/**
 * Brand colour tokens the help chat may recolour a shape with.
 *
 * Exported from this bundle so the manager widget — a plain script that cannot
 * import tokens.mjs — validates fills against the real palette instead of a
 * retyped copy of it. Keys are what the assistant writes (`fill=mo-blue`);
 * values are whatever tokens.mjs says today.
 */
export const BRAND_FILLS: Record<string, string> = Object.fromEntries(
  ['mo-red', 'mo-black', 'mo-yellow', 'mo-orange', 'mo-pink', 'mo-purple',
   'mo-green', 'mo-forest', 'mo-blue', 'mo-ocean']
    .map((name) => {
      // mo-black (and mo-white) are plain strings in tokens.mjs; the paired
      // colours are objects with a DEFAULT. The earlier cast papered over
      // that, which made BRAND_FILLS['mo-black'] undefined — so the chat
      // silently refused black fills while accepting the other nine.
      const value = (colors as Record<string, string | { DEFAULT: string }>)[name];
      return [name, typeof value === 'string' ? value : value.DEFAULT];
    })
);

export const SCALE_PRESETS = [1, 2, 4];
