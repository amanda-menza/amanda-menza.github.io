"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  isUploading?: boolean;
  label?: string;
}

export function FileUploader({
  onFileSelected,
  accept = "*/*",
  isUploading = false,
  label = "Upload File",
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onFileSelected(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        disabled={isUploading}
      />
      <div className="flex flex-col space-y-2">
        <Button
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
          style={{ color: 'var(--secondary-color)' }}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {label}
            </>
          )}
        </Button>
        {selectedFileName && (
          <p className="text-sm text-muted-foreground mt-1 truncate">
            Selected: {selectedFileName}
          </p>
        )}
      </div>
    </div>
  );
} 