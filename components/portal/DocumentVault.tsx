"use client";

import React, { useState } from "react";
import { StoredDocument } from "@/types/portal";
import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Upload,
  Eye,
  FileCheck,
} from "lucide-react";

interface DocumentVaultProps {
  documents: StoredDocument[];
  onUpload?: (files: FileList) => void;
  onDelete?: (documentId: string) => void;
  allowUpload?: boolean;
  maxFileSize?: number; // in MB
}

export default function DocumentVault({
  documents,
  onUpload,
  onDelete,
  allowUpload = true,
  maxFileSize = 10,
}: DocumentVaultProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [viewDocument, setViewDocument] = useState<StoredDocument | null>(null);

  const getFileIcon = (type: StoredDocument["type"]) => {
    switch (type) {
      case "epc":
      case "floorplan":
      case "brochure":
        return <Image className="w-6 h-6 text-[#1DBFDD]" />;
      case "contract":
      case "id":
        return <FileCheck className="w-6 h-6 text-green-500" />;
      default:
        return <FileText className="w-6 h-6 text-[#6B6E72]" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && onUpload) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpload) {
      onUpload(e.target.files);
    }
  };

  const documentTypes: Record<StoredDocument["type"], string> = {
    epc: "EPC Certificate",
    floorplan: "Floorplan",
    brochure: "Brochure",
    contract: "Contract",
    id: "ID Document",
    other: "Other",
  };

  return (
    <div className="bg-white rounded-xl border border-[#C8C9CB] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#C8C9CB] flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-[#2C2F33]">
            Document Vault
          </h3>
          <p className="text-sm text-[#6B6E72] mt-0.5">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {allowUpload && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`px-5 py-6 border-b border-[#C8C9CB] transition-colors ${
            isDragging ? "bg-[#1DBFDD]/5 border-[#1DBFDD]" : "bg-[#F0F0ED]/30"
          }`}
        >
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <div className="w-12 h-12 bg-[#1DBFDD]/10 rounded-full flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-[#1DBFDD]" />
            </div>
            <p className="text-sm font-medium text-[#2C2F33]">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-[#6B6E72] mt-1">
              PDF, JPG, PNG up to {maxFileSize}MB
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </label>
        </div>
      )}

      {/* Document List */}
      <div className="divide-y divide-[#C8C9CB]">
        {documents.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div className="w-12 h-12 bg-[#F0F0ED] rounded-full flex items-center justify-center mx-auto mb-3">
              <File className="w-6 h-6 text-[#6B6E72]" />
            </div>
            <p className="text-[#6B6E72]">No documents yet</p>
            <p className="text-sm text-[#6B6E72] mt-1">
              Upload documents to store them securely
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="px-5 py-4 hover:bg-[#F0F0ED]/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F0F0ED] rounded-lg flex items-center justify-center flex-shrink-0">
                  {getFileIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2C2F33] truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#6B6E72]">
                    <span className="px-2 py-0.5 bg-[#F0F0ED] rounded-full">
                      {documentTypes[doc.type]}
                    </span>
                    <span>{formatFileSize(doc.size)}</span>
                    <span>•</span>
                    <span>
                      {new Date(doc.uploadedAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewDocument(doc)}
                    className="p-2 rounded-lg hover:bg-[#F0F0ED] text-[#6B6E72] hover:text-[#1DBFDD] transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={doc.url}
                    download
                    className="p-2 rounded-lg hover:bg-[#F0F0ED] text-[#6B6E72] hover:text-[#1DBFDD] transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-[#6B6E72] hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#C8C9CB] flex items-center justify-between">
              <div>
                <h4 className="font-medium text-[#2C2F33]">
                  {viewDocument.name}
                </h4>
                <p className="text-sm text-[#6B6E72]">
                  {documentTypes[viewDocument.type]} •{" "}
                  {formatFileSize(viewDocument.size)}
                </p>
              </div>
              <button
                onClick={() => setViewDocument(null)}
                className="p-2 rounded-lg hover:bg-[#F0F0ED] transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5 bg-[#F0F0ED]">
              {viewDocument.type === "floorplan" ||
              viewDocument.type === "epc" ||
              viewDocument.thumbnailUrl ? (
                <img
                  src={viewDocument.thumbnailUrl || viewDocument.url}
                  alt={viewDocument.name}
                  className="max-w-full mx-auto shadow-lg rounded-lg"
                />
              ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                  <FileText className="w-16 h-16 text-[#C8C9CB] mx-auto mb-4" />
                  <p className="text-[#6B6E72]">
                    Preview not available for this file type
                  </p>
                  <a
                    href={viewDocument.url}
                    download
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1DBFDD] text-white rounded-lg hover:bg-[#0E8CAB] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download to View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
