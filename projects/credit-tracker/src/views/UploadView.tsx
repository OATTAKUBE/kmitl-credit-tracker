import React, { useRef, useState } from 'react';
import { UploadCloud, Sparkles, AlertTriangle, Loader2, FileText } from 'lucide-react';

export interface UploadViewProps {
  onFileUpload: (file: File) => void;
  onDemoLoad: () => void;
  isProcessing: boolean;
  error: string | null;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onFileUpload,
  onDemoLoad,
  isProcessing,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        onFileUpload(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileUpload(file);
      // Reset input value to allow uploading the same file again if needed
      e.target.value = '';
    }
  };

  const handleClickUploadZone = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,application/pdf"
        className="hidden"
        disabled={isProcessing}
      />

      {/* Drag & Drop Zone */}
      <div
        onClick={handleClickUploadZone}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer select-none backdrop-blur-sm ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/40 shadow-indigo-500/10 shadow-lg scale-[1.01]'
            : 'border-slate-700 bg-slate-900/60 hover:border-indigo-500/60 hover:bg-slate-900/80 shadow-xl'
        } ${isProcessing ? 'pointer-events-none opacity-70' : ''}`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium text-slate-100">
              {isProcessing
                ? 'กำลังประมวลผลไฟล์ใบทรานสคริปต์...'
                : 'ลากไฟล์ใบทรานสคริปต์ (PDF) มาวางที่นี่'}
            </h3>
            <p className="text-sm text-slate-400">
              {isProcessing
                ? 'กรุณารอสักครู่ ระบบกำลังอ่านข้อมูลและวิเคราะห์หลักสูตร'
                : 'หรือคลิกเพื่อเลือกไฟล์ PDF จากอุปกรณ์ของคุณ'}
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              รองรับไฟล์ใบทรานสคริปต์ฉบับไม่เป็นทางการ (PDF) จากสำนักทะเบียน KMITL
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-lg backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-medium text-sm text-rose-300">เกิดข้อผิดพลาดในการอ่านไฟล์</p>
            <p className="text-xs text-rose-200/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Demo Data Option */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <span className="text-xs text-slate-400">ยังไม่มีไฟล์ทรานสคริปต์?</span>
        <button
          type="button"
          onClick={onDemoLoad}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 hover:border-indigo-500/60 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          ลองใช้ข้อมูลตัวอย่าง (Demo Data)
        </button>
      </div>
    </div>
  );
};
