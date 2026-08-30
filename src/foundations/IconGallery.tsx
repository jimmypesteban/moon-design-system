import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import JSZip from 'jszip';
import * as Icons from '../icons';
import { LayoutList as ListViewIcon, LayoutGrid as GridViewIcon } from '../icons';
import { CUSTOM_ICONS, CUSTOM_ICON_NAMES, type CustomIconName } from '../customIcons';
import { CustomIcon } from '../components/CustomIcon';
import { fontFamily } from '../../tokens.mjs';

const BODY_FONT = fontFamily.body.join(', ');

type LucideIconComponent = ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
const LUCIDE_ICONS = Icons as unknown as Record<string, LucideIconComponent>;

// One unified icon browser — lucide-backed icons and Moon's own custom
// (non-lucide) icons, grouped into categories under a single sticky
// customizer (search, size, stroke, color), modeled after lucide.dev/icons'
// and IconPark's own customizers. Click an icon to add/remove it from the
// batch export; every icon exports as SVG or PNG regardless of category.

type Entry = { key: string; name: string; category: 'Lucide' | 'Custom' };

const LUCIDE_ENTRIES: Entry[] = Object.entries(Icons)
  .filter(([name, value]) => name !== 'ICON_SIZE' && typeof value !== 'number')
  .map(([name]) => ({ key: `lucide:${name}`, name, category: 'Lucide' }));

const CUSTOM_ENTRIES: Entry[] = CUSTOM_ICON_NAMES.map((name) => ({
  key: `custom:${name}`,
  name,
  category: 'Custom',
}));

const ALL_ENTRIES: Entry[] = [...LUCIDE_ENTRIES, ...CUSTOM_ENTRIES];
const CATEGORY_ORDER: Array<Entry['category']> = ['Lucide', 'Custom'];

// Display names as lowercase-hyphenated, IconPark-style (e.g. `AlertTriangle`
// -> `alert-triangle`), even though the underlying lucide export stays
// PascalCase. Custom icon names are already kebab-case.
function toKebabCase(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function displayName(entry: Entry) {
  return entry.category === 'Lucide' ? toKebabCase(entry.name) : entry.name;
}

// Preset swatches — the brand ramp DEFAULTs from tokens.mjs, so the color
// picker's quick options always match the real Moon palette.
const COLOR_PRESETS = [
  { name: 'black', hex: '#313030' },
  { name: 'red', hex: '#B82431' },
  { name: 'yellow', hex: '#FDC734' },
  { name: 'orange', hex: '#F57134' },
  { name: 'pink', hex: '#E354A4' },
  { name: 'purple', hex: '#4C1C75' },
  { name: 'green', hex: '#54C47A' },
  { name: 'forest', hex: '#1B4B35' },
  { name: 'blue', hex: '#528CFF' },
  { name: 'ocean', hex: '#182E42' },
];

function renderIcon(entry: Entry, size: number, strokeWidth: number, color: string) {
  if (entry.category === 'Lucide') {
    const Icon = LUCIDE_ICONS[entry.name];
    return <Icon size={size} strokeWidth={strokeWidth} color={color} />;
  }
  return <CustomIcon name={entry.name as CustomIconName} size={size} color={color} />;
}

function entryToSvgString(entry: Entry, size: number, strokeWidth: number, color: string) {
  if (entry.category === 'Lucide') {
    const Icon = LUCIDE_ICONS[entry.name];
    return renderToStaticMarkup(<Icon size={size} strokeWidth={strokeWidth} color={color} />);
  }
  return CUSTOM_ICONS[entry.name as keyof typeof CUSTOM_ICONS]
    .replace('width="100%"', `width="${size}"`)
    .replace('height="100%"', `height="${size}"`)
    .replace('<svg ', `<svg style="color:${color}" `);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadSvg(entry: Entry, size: number, strokeWidth: number, color: string) {
  const svg = entryToSvgString(entry, size, strokeWidth, color);
  downloadBlob(`${displayName(entry)}.svg`, new Blob([svg], { type: 'image/svg+xml' }));
}

function entryToPngBlob(entry: Entry, size: number, strokeWidth: number, color: string): Promise<Blob | null> {
  // Export at 4x the on-screen size so the PNG stays crisp regardless of the
  // size slider's current value.
  const exportSize = size * 4;
  const svg = entryToSvgString(entry, exportSize, strokeWidth, color);
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = exportSize;
      canvas.height = exportSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, exportSize, exportSize);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    };
    img.src = svgUrl;
  });
}

function downloadPng(entry: Entry, size: number, strokeWidth: number, color: string) {
  entryToPngBlob(entry, size, strokeWidth, color).then((blob) => {
    if (blob) downloadBlob(`${displayName(entry)}.png`, blob);
  });
}

async function downloadAllAsZip(entries: Entry[], size: number, strokeWidth: number, color: string) {
  const zip = new JSZip();
  const svgFolder = zip.folder('svg');
  const pngFolder = zip.folder('png');

  for (const entry of entries) {
    const filename = displayName(entry);
    svgFolder?.file(`${filename}.svg`, entryToSvgString(entry, size, strokeWidth, color));
    const pngBlob = await entryToPngBlob(entry, size, strokeWidth, color);
    if (pngBlob) pngFolder?.file(`${filename}.png`, pngBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob('moon-icons.zip', zipBlob);
}

/** Small hover/focus info bubble for the section explanation — see it, don't wade through it. */
export function InfoTooltip({ children }: { children: ReactNode }) {
  return (
    <span className="group/info relative inline-flex" style={{ verticalAlign: 'middle' }}>
      <span
        tabIndex={0}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '1px solid #ACABA7',
          color: '#6B6A66',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'help',
          fontFamily: BODY_FONT,
        }}
      >
        i
      </span>
      <span
        role="tooltip"
        className="icon-info-tooltip-content pointer-events-none absolute z-50 opacity-0 transition-opacity group-hover/info:opacity-100 group-focus-within/info:opacity-100"
        style={{
          top: '100%',
          left: 0,
          marginTop: 8,
          width: 380,
          padding: 12,
          borderRadius: 8,
          background: '#313030',
          color: '#F5F4F0',
          fontSize: 12,
          lineHeight: 1.5,
          fontFamily: BODY_FONT,
          whiteSpace: 'normal',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        {children}
      </span>
      <style>{`
        .icon-info-tooltip-content code {
          background: rgba(255, 255, 255, 0.15);
          color: #F5F4F0;
        }
        .icon-info-tooltip-content a {
          color: #F9C1D2;
        }
      `}</style>
    </span>
  );
}

export function IconGallery() {
  const [query, setQuery] = useState('');
  const [size, setSize] = useState(24);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [color, setColor] = useState('#313030');
  const [hexDraft, setHexDraft] = useState(color);
  const [selected, setSelected] = useState<Entry | null>(ALL_ENTRIES[0] ?? null);
  const [batch, setBatch] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'labeled' | 'iconOnly'>('labeled');
  const [selectedOnly, setSelectedOnly] = useState(false);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ENTRIES;
    return ALL_ENTRIES.filter((entry) => displayName(entry).includes(q));
  }, [query]);

  const filtered = selectedOnly ? searched.filter((entry) => batch.has(entry.key)) : searched;

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      entries: filtered.filter((entry) => entry.category === category),
    })).filter((group) => group.entries.length > 0);
  }, [filtered]);

  const batchEntries = ALL_ENTRIES.filter((entry) => batch.has(entry.key));

  function toggleBatch(entry: Entry) {
    setBatch((prev) => {
      const next = new Set(prev);
      if (next.has(entry.key)) next.delete(entry.key);
      else next.add(entry.key);
      return next;
    });
  }

  // Keep the hex text field in sync when color changes elsewhere (a preset
  // click or the native swatch picker), without fighting the user's typing.
  useEffect(() => {
    setHexDraft(color);
  }, [color]);

  function commitHex(value: string) {
    setHexDraft(value);
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
      setColor(value);
    }
  }

  return (
    <div style={{ fontFamily: BODY_FONT }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 0',
          background: '#fff',
          marginBottom: 20,
        }}
      >
        <input
          type="text"
          placeholder={`Search ${ALL_ENTRIES.length} icons...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: '1 1 240px', padding: '8px 12px', borderRadius: 6, border: '1px solid #D8CFC6', fontSize: 14 }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B6A66', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={selectedOnly} onChange={(e) => setSelectedOnly(e.target.checked)} />
          Selected only: {batch.size}/{ALL_ENTRIES.length}
        </label>

        <div style={{ display: 'flex', border: '1px solid #D8CFC6', borderRadius: 6, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setViewMode('labeled')}
            title="Icon + name"
            aria-pressed={viewMode === 'labeled'}
            style={{
              display: 'flex',
              padding: '6px 8px',
              border: 'none',
              background: viewMode === 'labeled' ? '#FCEFF3' : '#fff',
              color: viewMode === 'labeled' ? '#B82431' : '#6B6A66',
              cursor: 'pointer',
            }}
          >
            <ListViewIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('iconOnly')}
            title="Icon only"
            aria-pressed={viewMode === 'iconOnly'}
            style={{
              display: 'flex',
              padding: '6px 8px',
              border: 'none',
              borderLeft: '1px solid #D8CFC6',
              background: viewMode === 'iconOnly' ? '#FCEFF3' : '#fff',
              color: viewMode === 'iconOnly' ? '#B82431' : '#6B6A66',
              cursor: 'pointer',
            }}
          >
            <GridViewIcon size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div
          style={{
            position: 'sticky',
            top: 68,
            flex: '0 0 220px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 16,
            background: '#F5F4F0',
            borderRadius: 8,
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#6B6A66' }}>
            Size {size}px
            <input type="range" min={16} max={48} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#6B6A66' }}>
            Stroke {strokeWidth}px (lucide only)
            <input
              type="range"
              min={1}
              max={3}
              step={0.25}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
            />
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6B6A66' }}>Color</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setColor(preset.hex)}
                  title={`${preset.name} (${preset.hex})`}
                  style={{
                    aspectRatio: '1 / 1',
                    padding: 0,
                    borderRadius: 4,
                    background: preset.hex,
                    border: color.toLowerCase() === preset.hex.toLowerCase() ? '2px solid #B82431' : '1px solid #D8CFC6',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                border: '1px solid #D8CFC6',
                borderRadius: 8,
                background: '#fff',
              }}
            >
              <label
                title="Custom color"
                style={{
                  position: 'relative',
                  width: 22,
                  height: 22,
                  flexShrink: 0,
                  borderRadius: 4,
                  border: '1px solid #D8CFC6',
                  background: color,
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', border: 'none' }}
                />
              </label>
              <input
                type="text"
                value={hexDraft}
                onChange={(e) => commitHex(e.target.value)}
                spellCheck={false}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: '#313030',
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: '#6B6A66', margin: 0 }}>
              Flags and the Google logo keep their real colors regardless of this setting.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #E8DDD5', paddingTop: 16 }}>
            {selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: 96,
                    background: '#fff',
                    border: '1px solid #E8DDD5',
                    borderRadius: 8,
                  }}
                >
                  {renderIcon(selected, size, strokeWidth, color)}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#313030', wordBreak: 'break-word', textAlign: 'center' }}>
                  {displayName(selected)}
                </div>
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <button
                    type="button"
                    onClick={() => downloadSvg(selected, size, strokeWidth, color)}
                    style={{ flex: 1, fontSize: 12, padding: '6px 0', borderRadius: 6, border: '1px solid #D8CFC6', background: '#fff', cursor: 'pointer' }}
                  >
                    SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadPng(selected, size, strokeWidth, color)}
                    style={{ flex: 1, fontSize: 12, padding: '6px 0', borderRadius: 6, border: '1px solid #D8CFC6', background: '#fff', cursor: 'pointer' }}
                  >
                    PNG
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: '#6B6A66', margin: 0 }}>Click an icon to preview and export it.</p>
            )}
          </div>

          <div style={{ borderTop: '1px solid #E8DDD5', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#6B6A66' }}>
                {batch.size === 0 ? 'No icons selected' : `${batch.size} selected`}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setBatch(new Set(searched.map((entry) => entry.key)))}
                  disabled={searched.length === 0}
                  style={{ fontSize: 11, color: '#B82431', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Select visible
                </button>
                <button
                  type="button"
                  onClick={() => setBatch(new Set())}
                  disabled={batch.size === 0}
                  style={{ fontSize: 11, color: '#6B6A66', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Clear
                </button>
              </div>
            </div>
            <button
              type="button"
              disabled={isExporting || batch.size === 0}
              onClick={async () => {
                setIsExporting(true);
                try {
                  await downloadAllAsZip(batchEntries, size, strokeWidth, color);
                } finally {
                  setIsExporting(false);
                }
              }}
              style={{
                width: '100%',
                fontSize: 12,
                fontWeight: 600,
                padding: '8px 0',
                borderRadius: 6,
                border: '1px solid #D8CFC6',
                background: isExporting ? '#F0EAE2' : batch.size === 0 ? '#F5F1EA' : '#fff',
                color: batch.size === 0 ? '#ACABA7' : '#313030',
                cursor: isExporting || batch.size === 0 ? 'default' : 'pointer',
              }}
            >
              {isExporting ? 'Zipping…' : `Download selected (${batch.size})`}
            </button>
            <p style={{ fontSize: 11, color: '#6B6A66', margin: '6px 0 0' }}>
              Check the icons you need below, then export SVG + PNG for just those as a .zip — handy for marketing
              or anyone without editor access.
            </p>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {filtered.length === 0 ? (
            <p style={{ color: '#6B6A66', fontSize: 14 }}>
              {selectedOnly ? 'No icons selected yet.' : `No icons match “${query}”.`}
            </p>
          ) : (
            grouped.map(({ category, entries }) => (
              <div key={category} style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#313030', margin: '0 0 12px' }}>
                  {category} ({entries.length})
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(${viewMode === 'iconOnly' ? 56 : 100}px, 1fr))`,
                    gap: 12,
                  }}
                >
                  {entries.map((entry) => {
                    const isBatched = batch.has(entry.key);
                    return (
                      <button
                        key={entry.key}
                        type="button"
                        onClick={() => {
                          setSelected(entry);
                          toggleBatch(entry);
                        }}
                        title={`${displayName(entry)} — click to add/remove from batch export`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          padding: viewMode === 'iconOnly' ? 10 : 12,
                          width: '100%',
                          border: isBatched ? '1px solid #B82431' : '1px solid #E8DDD5',
                          background: isBatched ? '#FCEFF3' : '#fff',
                          borderRadius: 8,
                          cursor: 'pointer',
                          font: 'inherit',
                        }}
                      >
                        {renderIcon(entry, size, strokeWidth, color)}
                        {viewMode === 'labeled' && (
                          <div style={{ fontSize: 11, color: '#6B6A66', textAlign: 'center', wordBreak: 'break-word' }}>
                            {displayName(entry)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
