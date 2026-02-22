"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Phone,
  Mail,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Train,
  Calendar,
  Info,
  Home,
  ChevronDown,
  FileText,
  Calculator,
} from "lucide-react";

// Property data
const propertyData = {
  id: "chpk1487075",
  title: "6 Bedroom House",
  subtitle: "terraced for Sale",
  address: "Bourne Street, Belgravia, London SW1W",
  price: "£15,500,000",
  status: "For Sale",
  featured: true,
  newListing: true,
  stats: {
    beds: 6,
    baths: 4,
    receptions: 3,
    sqft: 5759,
    sqm: 535.01,
    epc: "C",
  },
  images: [
    "/hertfordshire-home-1.png",
    "/hertfordshire-home-4.png",
    "/hertfordshire-home-1.png",
    "/hertfordshire-home-4.png",
    "/hertfordshire-home-1.png",
    "/hertfordshire-home-4.png",
  ],
  description: `This impressive 6 bedroom townhouse within a development which completed circa 2001, benefits from an impressive private swimming pool, steam room, lift access, private sunny garden and large underground garage.

The property is arranged over five floors and includes an elegant entrance hall, grand double reception room, open-plan kitchen and family room with bi-fold doors opening onto a west-facing garden. The master suite occupies the entire second floor with dressing room and en-suite bathroom.

Additional features include air conditioning, underfloor heating, integrated Sonos sound system, and a separate utility room.`,
  tenure: {
    type: "Leasehold plus share of freehold",
    leaseExpires: "25 Dec, 2999",
    groundRent: "-",
    serviceCharge: "£10,000 per quarter (2025)",
    councilTax: "£2,034.36 per year (H)",
    localAuthority: "The City of Westminster",
    reference: "11487075",
  },
  stations: [
    { name: "Victoria", distance: "0.3 miles", zone: 1, lines: ["District", "Circle", "Victoria"] },
    { name: "Sloane Square", distance: "0.4 miles", zone: 1, lines: ["District", "Circle"] },
    { name: "Hyde Park Corner", distance: "0.6 miles", zone: 1, lines: ["Piccadilly"] },
  ],
  agent: {
    name: "James Harrington",
    title: "Senior Property Consultant",
    phone: "020 7123 4567",
    email: "james.harrington@banc.co.uk",
    image: "/banc-logo.png",
  },
};

// Accordion Component
function AccordionItem({ 
  title, 
  children, 
  defaultOpen = false,
  icon: Icon
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#E5E7EB]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left hover:bg-[#F9FAFB] transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-[#1DBFDD]" />}
          <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
        </div>
        <ChevronDown 
          className={`h-5 w-5 text-[#1DBFDD] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PropertyDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyData.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyData.images.length) % propertyData.images.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-2 text-sm text-[#6B7280]">
            <a href="/" className="hover:text-[#1DBFDD] transition-colors">Home</a>
            <ChevronRight className="h-4 w-4" />
            <a href="/sales/properties" className="hover:text-[#1DBFDD] transition-colors">Properties for Sale</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-[#111827] truncate max-w-[200px] sm:max-w-[400px]">{propertyData.address}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-8 lg:grid-cols-[58%_42%]">
          {/* Left Column */}
          <div>
            {/* Image Gallery */}
            <div className="relative mb-6">
              {/* Main Image - 3:2 Aspect Ratio */}
              <div 
                className="relative bg-black cursor-pointer group"
                onClick={() => setIsFullscreen(true)}
              >
                <div className="aspect-[3/2] relative">
                  <Image
                    src={propertyData.images[currentImageIndex]}
                    alt={`Property image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1.5 text-sm text-white font-medium">
                  {currentImageIndex + 1} / {propertyData.images.length}
                </div>

                {/* Featured Tag */}
                {propertyData.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#1DBFDD] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wide">
                      Featured
                    </span>
                  </div>
                )}

                {/* New Listing Tag */}
                {propertyData.newListing && (
                  <div className="absolute top-4" style={{ left: propertyData.featured ? '110px' : '16px' }}>
                    <span className="bg-[#0D9488] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wide">
                      New Listing
                    </span>
                  </div>
                )}

                {/* Save/Share Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
                    className="w-11 h-11 bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${saved ? "fill-red-500 text-red-500" : "text-white"}`} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
                    className="w-11 h-11 bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-thin">
                {propertyData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-24 h-16 overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-[#1DBFDD]"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Property Info */}
            <div className="hidden lg:block mb-8">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#111827] mb-1">
                    {propertyData.title}
                  </h1>
                  <p className="text-lg text-[#6B7280]">{propertyData.subtitle}</p>
                  <p className="text-[#6B7280] mt-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {propertyData.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#0D9488]">{propertyData.price}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-[#1DBFDD]" />
                  <span className="font-semibold text-[#111827]">{propertyData.stats.beds}</span>
                  <span className="text-[#6B7280]">Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-[#1DBFDD]" />
                  <span className="font-semibold text-[#111827]">{propertyData.stats.baths}</span>
                  <span className="text-[#6B7280]">Baths</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-[#1DBFDD]" />
                  <span className="font-semibold text-[#111827]">{propertyData.stats.receptions}</span>
                  <span className="text-[#6B7280]">Receptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-[#1DBFDD]" />
                  <span className="font-semibold text-[#111827]">{propertyData.stats.sqft.toLocaleString()}</span>
                  <span className="text-[#6B7280]">sq ft</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-[#0D9488] text-white text-sm font-bold">
                    EPC {propertyData.stats.epc}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Property Info */}
            <div className="lg:hidden mb-6">
              <p className="text-[#1DBFDD] font-semibold text-sm uppercase tracking-wider mb-2">
                {propertyData.status}
              </p>
              <h1 className="text-2xl font-bold text-[#111827] mb-1">
                {propertyData.title}
              </h1>
              <p className="text-[#6B7280]">{propertyData.subtitle}</p>
              <p className="text-2xl font-bold text-[#0D9488] mt-3">{propertyData.price}</p>
              <p className="text-[#6B7280] mt-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {propertyData.address}
              </p>
              
              {/* Mobile Stats */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#E5E7EB]">
                <span className="flex items-center gap-1 text-sm">
                  <Bed className="h-4 w-4 text-[#1DBFDD]" />
                  <strong>{propertyData.stats.beds}</strong> Beds
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <Bath className="h-4 w-4 text-[#1DBFDD]" />
                  <strong>{propertyData.stats.baths}</strong> Baths
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <Square className="h-4 w-4 text-[#1DBFDD]" />
                  <strong>{propertyData.stats.sqft.toLocaleString()}</strong> sq ft
                </span>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className="border-t border-[#E5E7EB]">
              {/* Description */}
              <AccordionItem title="Description" defaultOpen={true} icon={FileText}>
                <div className="prose max-w-none">
                  <p className="text-[#374151] whitespace-pre-line leading-relaxed">
                    {propertyData.description}
                  </p>
                </div>
              </AccordionItem>

              {/* Further Details */}
              <AccordionItem title="Further details" icon={Info}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-[#F9FAFB] p-4">
                    <p className="text-sm text-[#6B7280] mb-1">Tenure</p>
                    <p className="font-medium text-[#111827]">{propertyData.tenure.type}</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-4">
                    <p className="text-sm text-[#6B7280] mb-1">Lease Expires</p>
                    <p className="font-medium text-[#111827]">{propertyData.tenure.leaseExpires}</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-4">
                    <p className="text-sm text-[#6B7280] mb-1">Ground Rent</p>
                    <p className="font-medium text-[#111827]">{propertyData.tenure.groundRent}</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-4">
                    <p className="text-sm text-[#6B7280] mb-1">Service Charge</p>
                    <p className="font-medium text-[#111827]">{propertyData.tenure.serviceCharge}</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-4">
                    <p className="text-sm text-[#6B7280] mb-1">Council Tax</p>
                    <p className="font-medium text-[#111827]">{propertyData.tenure.councilTax}</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-4">
                    <p className="text-sm text-[#6B7280] mb-1">Local Authority</p>
                    <p className="font-medium text-[#111827]">{propertyData.tenure.localAuthority}</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-4 sm:col-span-2">
                    <p className="text-sm text-[#6B7280] mb-1">Total Sq Ft</p>
                    <p className="font-medium text-[#111827]">{propertyData.stats.sqft.toLocaleString()} ({propertyData.stats.sqm} Sq M) approx.</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-4">
                    <p className="text-sm text-[#6B7280] mb-1">Reference</p>
                    <p className="font-medium text-[#111827]">{propertyData.tenure.reference}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-[#6B7280] bg-[#F9FAFB] p-4">
                  <Info className="h-3 w-3 inline mr-1" />
                  Tenure details, service charges, ground rent (where applicable) and council tax are
                  given as a guide only and should be checked and confirmed by your Solicitor prior to
                  exchange of contracts.
                </p>
              </AccordionItem>

              {/* Nearest Stations */}
              <AccordionItem title="Nearest stations" icon={Train}>
                <div className="space-y-3">
                  {propertyData.stations.map((station, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-[#E5E7EB] hover:border-[#1DBFDD] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-[#1DBFDD]/10">
                          <Train className="h-6 w-6 text-[#1DBFDD]" />
                        </div>
                        <div>
                          <a href="#" className="font-semibold text-[#1DBFDD] hover:underline text-lg">
                            {station.name}
                          </a>
                          <p className="text-sm text-[#6B7280]">
                            {station.distance} • Zone {station.zone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                        {station.lines.map((line) => (
                          <span
                            key={line}
                            className="px-2 py-1 text-xs font-medium bg-[#F3F4F6] text-[#374151]"
                          >
                            {line}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionItem>

              {/* EPC */}
              <AccordionItem title="Energy Performance Certificates" icon={FileText}>
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-24 h-24 bg-[#0D9488] flex items-center justify-center">
                    <span className="text-5xl font-bold text-white">{propertyData.stats.epc}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#111827] text-lg">Current Rating: {propertyData.stats.epc}</p>
                    <p className="text-[#6B7280]">Potential Rating: B</p>
                  </div>
                </div>
                <p className="text-[#6B7280] leading-relaxed">
                  The Energy Performance Certificate (EPC) gives the building a standard energy
                  and carbon emission efficiency grade from &apos;A&apos; to &apos;G&apos;, where
                  &apos;A&apos; is the most efficient and &apos;D&apos; being the average to date.
                </p>
              </AccordionItem>

              {/* Mortgage */}
              <AccordionItem title="Mortgage" icon={Calculator}>
                <div className="bg-[#F9FAFB] p-6">
                  <p className="text-[#374151] mb-4 leading-relaxed">
                    Find out how much you could borrow and what it might cost with our mortgage calculator.
                  </p>
                  <Button className="bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8">
                    Calculate Mortgage
                  </Button>
                </div>
              </AccordionItem>
            </div>
          </div>

          {/* Right Column - Agent Card */}
          <div>
            <div className="lg:sticky lg:top-24">
              {/* Desktop Agent Card */}
              <div className="hidden lg:block bg-white border border-[#E5E7EB] p-6 shadow-sm">
                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  <Button className="w-full bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white py-6 text-lg font-semibold">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book a Viewing
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className={`flex-1 py-5 border-2 ${saved ? 'border-red-500 text-red-500' : 'border-[#1DBFDD] text-[#1DBFDD]'} hover:bg-[#1DBFDD] hover:text-white`}
                      onClick={() => setSaved(!saved)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${saved ? "fill-current" : ""}`} />
                      {saved ? "Saved" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 py-5 border-2 border-[#1DBFDD] text-[#1DBFDD] hover:bg-[#1DBFDD] hover:text-white"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Agent Info */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <p className="text-sm text-[#6B7280] mb-4">Contact Agent</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#F3F4F6] border-2 border-[#E5E7EB]">
                      <Image
                        src={propertyData.agent.image}
                        alt={propertyData.agent.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827] text-lg">{propertyData.agent.name}</p>
                      <p className="text-sm text-[#6B7280]">{propertyData.agent.title}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start border-[#E5E7EB] hover:border-[#1DBFDD] hover:text-[#1DBFDD] py-5">
                      <Phone className="h-4 w-4 mr-3" />
                      {propertyData.agent.phone}
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-[#E5E7EB] hover:border-[#1DBFDD] hover:text-[#1DBFDD] py-5">
                      <Mail className="h-4 w-4 mr-3" />
                      Email Agent
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mobile Bottom Bar */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-4 z-50">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className={`w-14 ${saved ? 'border-red-500 text-red-500' : 'border-[#E5E7EB]'}`}
                    onClick={() => setSaved(!saved)}
                  >
                    <Heart className={`h-5 w-5 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button className="flex-1 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white py-6 text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book a Viewing
                  </Button>
                </div>
              </div>

              {/* Mobile Spacer */}
              <div className="lg:hidden h-24" />
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Gallery Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 z-10 w-12 h-12 flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative h-full flex items-center justify-center">
              <Image
                src={propertyData.images[currentImageIndex]}
                alt={`Property image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />

              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 text-white font-medium">
                {currentImageIndex + 1} / {propertyData.images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Share this property</h3>
                <button onClick={() => setShowShareModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowShareModal(false);
                }}>
                  Copy Link
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Share via Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Share on WhatsApp
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
