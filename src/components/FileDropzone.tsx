'use client';

import React, { useRef, useState } from 'react';
import { FileText, Upload, X } from '../icons';

export interface FileDropzoneFile {
  name: string;
  /** Pre-formatted display size, e.g. "2.4 MB" — this component does no byte-size math itself */
  size?: string;
}

export interface FileDropzoneProps {
  /** Already-added/uploaded files, rendered as removable chips below the drop area */
  files?: FileDropzoneFile[];
  /** Called with every file dropped or selected via the browse dialog — one call per file, same as a native `<input type="file" multiple>` change handler processing its list */
  onAddFile: (file: File) => void;
  onRemoveFile?: (index: number) => void;
  /** Native `accept` attribute, e.g. ".pdf,.docx,.txt" */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  dragLabel?: string;
  hintLabel?: string;
  browseLabel?: string;
  className?: string;
}

/**
 * FileDropzone — a drag-and-drop file upload area with a click-to-browse
 * fallback and a list of added files. No drawn source exists for this in
 * the reference design file — it's a generic pattern — but the consumer app had
 * already reinvented this same drag-and-drop shell independently in at
 * least half a dozen places (teaching materials, syllabus upload, generate-
 * assignment document upload, and more). Deliberately does no uploading
 * itself: `onAddFile` fires once per selected/dropped file and the caller
 * owns validation, size limits, and the actual upload request.
 *
 * @example
 * ```tsx
 * <FileDropzone
 *   accept=".pdf,.docx,.txt"
 *   multiple
 *   files={files}
 *   onAddFile={(file) => uploadFile(file)}
 *   onRemoveFile={(i) => setFiles((f) => f.filter((_, idx) => idx !== i))}
 * />
 * ```
 */
export function FileDropzone({
  files = [],
  onAddFile,
  onRemoveFile,
  accept,
  multiple = false,
  disabled = false,
  label,
  dragLabel = 'Drag and drop files here',
  hintLabel,
  browseLabel = 'Browse files',
  className = '',
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFileList(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach((file) => onAddFile(file));
  }

  return (
    <div className={['flex w-full flex-col gap-3', className].filter(Boolean).join(' ')}>
      {label && <span className="font-body text-sm font-semibold text-mo-black">{label}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          handleFileList(e.target.files);
          e.target.value = '';
        }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (!disabled) handleFileList(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={[
          'flex h-36 w-full flex-col items-center justify-center gap-2.5 rounded-mo-md border-2 border-dashed transition-colors focus:outline-none focus:ring-2 focus:ring-mo-blue/30',
          disabled ? 'cursor-not-allowed opacity-60' : '',
          isDragOver ? 'border-mo-blue bg-mo-blue-1' : 'border-mo-grey-4 bg-mo-grey-1 hover:border-mo-grey-6',
        ].join(' ')}
      >
        <Upload size={24} className="text-mo-grey-6" />
        <span className="font-body text-sm text-mo-grey-8">{dragLabel}</span>
        {hintLabel && <span className="font-body text-mo-annotation text-mo-grey-6">{hintLabel}</span>}
        <span className="rounded-full border border-mo-grey-5 px-4 py-1.5 font-body text-sm font-semibold text-mo-grey-8">
          {browseLabel}
        </span>
      </button>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-mo-sm bg-mo-grey-1 px-3 py-1.5">
              <FileText size={14} className="shrink-0 text-mo-grey-7" />
              <span className="truncate font-body text-sm text-mo-black">
                {file.name}
                {file.size ? `  (${file.size})` : ''}
              </span>
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  aria-label={`Remove ${file.name}`}
                  className="-my-1.5 ml-auto flex size-6 shrink-0 items-center justify-center text-mo-grey-6 hover:text-mo-red"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
