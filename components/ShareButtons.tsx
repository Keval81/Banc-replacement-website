"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, 
  Link, 
  Mail, 
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Check,
  X,
  Printer,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  propertyUrl: string;
  propertyTitle: string;
  propertyPrice: string;
  className?: string;
  onSave?: () => void;
  isSaved?: boolean;
}

export function ShareButtons({ 
  propertyUrl, 
  propertyTitle, 
  propertyPrice,
  className = "",
  onSave,
  isSaved = false
}: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${propertyUrl}`
    : propertyUrl;

  const shareText = `Check out this property: ${propertyTitle} - ${propertyPrice}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Property: ${propertyTitle}`);
    const body = encodeURIComponent(`${shareText}\n\n${fullUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareText}\n\n${fullUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(fullUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(fullUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(fullUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Save Button */}
      {onSave && (
        <Button
          variant="outline"
          onClick={onSave}
          className={`flex-1 py-5 border-2 rounded-lg transition-colors ${
            isSaved 
              ? 'border-red-500 text-red-500 bg-red-50' 
              : 'border-gray-200 text-gray-600 hover:border-[#4AC8E8] hover:text-[#4AC8E8]'
          }`}
        >
          <Heart className={`h-4 w-4 mr-2 ${isSaved ? "fill-red-500" : ""}`} />
          {isSaved ? "Saved" : "Save"}
        </Button>
      )}

      {/* Print Button */}
      <Button
        variant="outline"
        onClick={handlePrint}
        className="flex-1 py-5 border-2 border-gray-200 text-gray-600 hover:border-[#4AC8E8] hover:text-[#4AC8E8] rounded-lg transition-colors"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>

      {/* Share Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex-1 py-5 border-2 border-gray-200 text-gray-600 hover:border-[#4AC8E8] hover:text-[#4AC8E8] rounded-lg transition-colors"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {/* Share Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[101] p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Share this property</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* Copy Link */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate">
                    {fullUrl}
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Link className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-1">Link copied to clipboard!</p>
                )}
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600">WhatsApp</span>
                </button>

                <button
                  onClick={handleEmailShare}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-600">Email</span>
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Facebook className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-600">Facebook</span>
                </button>

                <button
                  onClick={handleTwitterShare}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                    <Twitter className="h-6 w-6 text-sky-500" />
                  </div>
                  <span className="text-xs text-gray-600">Twitter</span>
                </button>
              </div>

              {/* Additional Options */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleLinkedInShare}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <span className="text-sm text-gray-700">Share on LinkedIn</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
