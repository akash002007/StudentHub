"use client";

import React, { useState, useRef } from "react";
import {
  Award,
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface AddCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCertificateModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCertificateModalProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage("");

    const fileName = selectedFile.name.toLowerCase();
    const validExts = [".pdf", ".png", ".jpg", ".jpeg"];
    const isValid = validExts.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage("Please upload a PDF, PNG, JPG, or JPEG certificate.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File size exceeds allowed limit of 10 MB.");
      return;
    }

    if (selectedFile.size === 0) {
      setErrorMessage("Selected certificate file is empty.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);

      const res = await fetch("/api/certificates/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        success("Certificate uploaded successfully! Certificate Intelligence is analyzing in background.");
        setFile(null);
        onSuccess();
        onClose();
      } else {
        setErrorMessage(data.error || "Failed to upload certificate.");
      }
    } catch {
      setErrorMessage("Network error uploading certificate. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-5 right-5 p-2 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Add Certificate</h2>
            <p className="text-xs text-muted-foreground">
              Upload a certificate to analyze its contents, verify available evidence, and add it to your Career DNA.
            </p>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
              isDragOver
                ? "border-amber-500 bg-amber-500/10"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border/80 hover:border-amber-500/50 bg-muted/30 hover:bg-muted/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />

            {file ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground truncate max-w-[300px]">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Click to browse or drag certificate here</p>
                  <p className="text-xs text-muted-foreground pt-0.5">Supports PDF, PNG, JPG, JPEG (Max 10 MB)</p>
                </div>
              </>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUploading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!file || isUploading}
              className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading & Analyzing...
                </>
              ) : (
                "Upload Certificate →"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
