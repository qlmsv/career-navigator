import * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, File, X } from 'lucide-react';

export type FileWithPreview = File & {
  preview: string;
};

export interface FileUploadProps {
  onDrop: (acceptedFiles: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  label?: string;
  description?: string;
  error?: string;
  className?: string;
  files?: FileWithPreview[];
  onRemove?: (index: number) => void;
};

export function FileUpload({
  onDrop,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  label,
  description,
  error,
  className,
  files = [],
  onRemove,
}: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    accept,
    maxSize,
    maxFiles,
    disabled: files.length >= maxFiles,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="text-sm font-medium text-foreground">
          {label}
          {maxFiles > 1 && ` (Максимум ${maxFiles} файлов)`}
        </div>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          'hover:border-primary/50',
          isDragActive ? 'border-primary bg-primary/5' : 'border-input',
          error && 'border-destructive',
          files.length >= maxFiles && 'opacity-60 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            {isDragActive ? (
              <p>Перетащите файлы сюда</p>
            ) : (
              <p>
                <span className="font-medium text-primary">Нажмите для загрузки</span> или перетащите файлы
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {Object.values(accept)
              .flat()
              .map((ext) => ext.toUpperCase())
              .join(', ')}{' '}
            (макс. {formatFileSize(maxSize)})
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={file.name + index}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Удалить</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
