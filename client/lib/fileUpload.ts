/**
 * File Upload Utilities for Pre-checkout Steps
 * Handles file validation and type detection for different upload APIs
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: "pdf" | "image" | "document";
  uploadMethod?: "pdf" | "image";
}

export interface UploadConfig {
  maxFileSize: number; // in MB
  allowedTypes: string[];
  maxFiles: number;
}

/**
 * Validate file against field requirements
 */
export function validateFile(
  file: File,
  config: UploadConfig,
): FileValidationResult {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  const fileSizeInMB = file.size / (1024 * 1024);

  // Check file extension
  if (!fileExtension || !config.allowedTypes.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type .${fileExtension} is not allowed. Allowed types: ${config.allowedTypes.join(", ")}`,
    };
  }

  // Check file size
  if (fileSizeInMB > config.maxFileSize) {
    return {
      isValid: false,
      error: `File size (${fileSizeInMB.toFixed(1)}MB) exceeds maximum allowed size (${config.maxFileSize}MB)`,
    };
  }

  // Determine file type and upload method
  const fileType = getFileType(fileExtension);
  const uploadMethod = getUploadMethod(fileExtension);

  return {
    isValid: true,
    fileType,
    uploadMethod,
  };
}

/**
 * Get file type category
 */
export function getFileType(extension: string): "pdf" | "image" | "document" {
  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
  const documentTypes = ["doc", "docx", "txt", "rtf"];

  if (extension === "pdf") {
    return "pdf";
  } else if (imageTypes.includes(extension)) {
    return "image";
  } else {
    return "document";
  }
}

/**
 * Get the appropriate upload method/API to use
 */
export function getUploadMethod(extension: string): "pdf" | "image" {
  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];

  if (imageTypes.includes(extension)) {
    return "image";
  } else {
    // All non-image files go through PDF API (handles docs, PDFs, etc.)
    return "pdf";
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${sizes[i]}`;
}

/**
 * Get file icon name based on file type (returns Lucide icon names)
 */
export function getFileIcon(extension: string): string {
  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
  const documentTypes = ["doc", "docx"];

  if (extension === "pdf") {
    return "FileText"; // PDF icon
  } else if (imageTypes.includes(extension)) {
    return "Image"; // Image icon
  } else if (documentTypes.includes(extension)) {
    return "FileText"; // Document icon
  } else {
    return "File"; // Generic file icon
  }
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Generate unique upload ID
 */
export function generateUploadId(fieldId: number): string {
  return `${fieldId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
  return imageTypes.includes(extension);
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  return extension === "pdf";
}

/**
 * Create preview URL for images
 */
export function createImagePreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file.name)) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Validate multiple files at once
 */
export function validateFiles(
  files: FileList | File[],
  config: UploadConfig,
): { validFiles: File[]; errors: string[] } {
  const fileArray = Array.from(files);
  const validFiles: File[] = [];
  const errors: string[] = [];

  // Check total file count
  if (fileArray.length > config.maxFiles) {
    errors.push(`Too many files. Maximum ${config.maxFiles} file(s) allowed.`);
    return { validFiles, errors };
  }

  // Validate each file
  fileArray.forEach((file, index) => {
    const validation = validateFile(file, config);
    if (validation.isValid) {
      validFiles.push(file);
    } else {
      errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
    }
  });

  return { validFiles, errors };
}
