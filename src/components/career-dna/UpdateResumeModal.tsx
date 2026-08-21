"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface UpdateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentResumeName?: string;
  lastUpdatedDate?: string;
}

export function UpdateResumeModal({
  isOpen,
  onClose,
  onSuccess,
  currentResumeName,
  lastUpdatedDate,
}: UpdateResumeModalProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<"idle" | "uploading" | "analyzing" | "completed">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const validateFile = (file: File): boolean => {
    setErrorMessage("");
    const validExtensions = [".pdf", ".docx", ".doc"];
    const isExtensionValid = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isExtensionValid && !file.type.match(/(pdf|word)/i)) {
      setErrorMessage("Please upload a valid PDF or DOCX file.");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Resume file size must be less than 10 MB.");
      return false;
    }

    if (file.size === 0) {
      setErrorMessage("The uploaded file is empty.");
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      setSelectedFile(file);
      if (currentResumeName) {
        setShowConfirm(true);
      }
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setUploadStep("uploading");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", user.id);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUploadStep("analyzing");

        // Simulate short background completion check
        setTimeout(() => {
          setUploadStep("completed");
          success("Resume uploaded & Resume DNA recalculated successfully!");
          setIsUploading(false);
          setShowConfirm(false);
          setSelectedFile(null);
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setErrorMessage(data.error || "Failed to upload resume.");
        setIsUploading(false);
        setUploadStep("idle");
      }
    } catch {
      setErrorMessage("Network error uploading resume. Your previous Resume DNA remains active.");
      setIsUploading(false);
      setUploadStep("idle");
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
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Update Your Resume</h2>
            <p className="text-xs text-muted-foreground">
              Upload your latest resume to refresh your Resume DNA and improve your overall Career DNA.
            </p>
          </div>
        </div>

        {/* Current Active Resume Info */}
        {currentResumeName && (
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                  Current Active Resume
                </span>
                <span className="font-bold text-foreground truncate block max-w-[200px]">
                  {currentResumeName}
                </span>
              </div>
            </div>
            <Badge variant="emerald" size="sm" className="text-[10px] shrink-0">
              Active
            </Badge>
          </div>
        )}

        {/* Replacement Confirmation Prompt */}
        {showConfirm && !isUploading && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Replace current resume?
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Your new resume <strong className="text-foreground">{selectedFile?.name}</strong> will become your active resume and your Resume DNA will be recalculated.
            </p>
          </div>
        )}

        {/* Processing Tracker */}
        {isUploading && (
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-500 animate-spin" /> Processing Resume DNA Pipeline
              </span>
              <span className="text-purple-500 uppercase text-[10px] font-semibold">{uploadStep}</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${uploadStep !== "idle" ? "text-emerald-500" : "text-muted"}`} />
                <span>Resume file uploaded</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${uploadStep === "analyzing" || uploadStep === "completed" ? "text-emerald-500" : "text-muted"}`} />
                <span>Extracting document text &amp; analyzing skills</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${uploadStep === "completed" ? "text-emerald-500" : "text-muted"}`} />
                <span>Recalculating overall Career DNA score</span>
              </div>
            </div>
          </div>
        )}

        {/* File Dropzone / Browser Input */}
        {!isUploading && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-purple-500/50 bg-muted/20 hover:bg-purple-500/5 transition-all text-center cursor-pointer space-y-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 mx-auto flex items-center justify-center text-purple-500">
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">
                {selectedFile ? selectedFile.name : "Click to upload new resume or drag & drop"}
              </p>
              <p className="text-[11px] text-muted-foreground">PDF or DOCX up to 10 MB</p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
            • {errorMessage}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isUploading}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleStartUpload}
            disabled={!selectedFile || isUploading}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            {isUploading ? "Processing..." : showConfirm ? "Replace Resume" : "Upload & Analyze"}
          </Button>
        </div>
      </div>
    </div>
  );
}
