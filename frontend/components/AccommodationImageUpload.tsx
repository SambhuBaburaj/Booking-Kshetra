'use client'

import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface AccommodationImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onUpload: (files: File[]) => Promise<string[]>;
  maxImages?: number;
  disabled?: boolean;
}

export default function AccommodationImageUpload({
  images,
  onImagesChange,
  onUpload,
  maxImages = 4,
  disabled = false
}: AccommodationImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const validateFiles = (files: File[]): string | null => {
    if (files.length === 0) return 'Please select at least one image';

    if (images.length + files.length > maxImages) {
      return `Maximum ${maxImages} images allowed. You currently have ${images.length} images.`;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return 'Please select only image files';
      }
      if (file.size > 5 * 1024 * 1024) {
        return 'Each image must be less than 5MB';
      }
    }
    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    const fileArray = Array.from(files);

    const validationError = validateFiles(fileArray);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      const newImageUrls = await onUpload(fileArray);
      onImagesChange([...images, ...newImageUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && images.length < maxImages) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const replaceImage = async (index: number, file: File) => {
    setError('');

    const validationError = validateFiles([file]);
    if (validationError && !validationError.includes('Maximum')) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      const [newImageUrl] = await onUpload([file]);
      const newImages = [...images];
      newImages[index] = newImageUrl;
      onImagesChange(newImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const canUploadMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Images ({images.length}/{maxImages})
        </label>
        {images.length > 0 && (
          <span className="text-xs text-gray-500">
            Click on an image to replace it
          </span>
        )}
      </div>

      {/* Current Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border-2 border-gray-200">
                <img
                  src={imageUrl}
                  alt={`Accommodation image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2">
                    <label className="bg-blue-600 text-white px-3 py-1 rounded text-sm cursor-pointer hover:bg-blue-700">
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            replaceImage(index, file);
                          }
                        }}
                        disabled={disabled || uploading}
                      />
                    </label>
                    <button
                      onClick={() => removeImage(index)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      disabled={disabled || uploading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled) {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*';
              input.onchange = (e) => handleInputChange(e as any);
              input.click();
            }
          }}
        >
          <div className="space-y-3">
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 mt-2">Uploading...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  {images.length === 0 ? (
                    <Upload className="h-12 w-12 text-gray-400" />
                  ) : (
                    <Plus className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {images.length === 0
                      ? `Click to upload or drag and drop images (max ${maxImages})`
                      : `Add ${maxImages - images.length} more image${maxImages - images.length !== 1 ? 's' : ''}`
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {!error && !uploading && images.length > 0 && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4" />
          <span>
            {images.length} image{images.length !== 1 ? 's' : ''} uploaded successfully
          </span>
        </div>
      )}

      {/* Instructions */}
      {images.length === 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Upload exactly {maxImages} high-quality images</p>
          <p>• Images will be displayed in the order uploaded</p>
          <p>• You can replace individual images later by clicking on them</p>
        </div>
      )}
    </div>
  );
}