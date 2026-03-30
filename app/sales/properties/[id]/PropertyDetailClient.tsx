"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
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
  ImageIcon,
  Printer,
  Clock,
} from "lucide-react";

type ViewType = "images" | "map" | "floorplan";

interface PropertyDetailClientProps {
  property: {
    id: string;
    title: string;
    address: string;
    price: string;
    status: string;
    featured: boolean;
    newListing: boolean;
    addedDate: string;
    stats: {
      beds: number;
      baths: number;
      receptions: number;
      sqft: number;
      sqm: number;
      epc: string;
    };
    images: string[];
    mapImage?: string;
    floorplanImage?: string;
    description: string;
    tenure: {
      type: string;
      leaseExpires: string;
      groundRent: string;
      serviceCharge: string;
      councilTax: string;
      localAuthority: string;
      reference: string;
    };
    stations: Array<{
      name: string;
      distance: string;
      zone: number;
      lines: string[];
    }>;
    agent: {
      name: string;
      title: string;
      phone: string;
      email: string;
      image: string;
    };
  };
}

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
    <div className="border-b border-[#E0DFDC]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left hover:bg-[#F4F3F1] transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-[#4AC8E8]" />}
          <h3 className="text-base font-semibold text-[#2C2A27]">{title}</h3>
        </div>
        <ChevronDown 
          className={`h-5 w-5 text-[#9CA3AF] transition-transform duration-200 ${
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
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("images");

  const hasMap = Boolean(property.mapImage);
  const hasFloorplan = Boolean(property.floorplanImage);
  const hasAlternativeViews = hasMap || hasFloorplan;

  const getCurrentImage = () => {
    switch (activeView) {
      case "map":
        return property.mapImage || property.images[currentImageIndex];
      case "floorplan":
        return property.floorplanImage || property.images[currentImageIndex];
      default:
        return property.images[currentImageIndex];
    }
  };

  const nextImage = () => {
    if (activeView !== "images") return;
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    if (activeView !== "images") return;
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const breadcrumbItems = [
    { label: "For Sale", href: "/sales/properties" },
    { label: property.address },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-[#F4F3F1] border-b border-[#E0DFDC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-8 lg:grid-cols-[60%_40%]">
          {/* Left Column */}
          <div>
            {/* Foxtons-style Image Gallery */}
            <div className="relative mb-4">
              {/* Main Image Container */}
              <div 
                className="relative bg-black cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => setIsFullscreen(true)}
              >
                <div className="aspect-[4/3] relative">
                  <Image
                    src={getCurrentImage()}
                    alt={activeView === "images" ? `Property image ${currentImageIndex + 1}` : `${activeView} view`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>

                {/* Navigation Arrows */}
                {activeView === "images" && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-[#2C2A27] hover:bg-white transition-colors shadow-lg"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-[#2C2A27] hover:bg-white transition-colors shadow-lg"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded text-sm text-white font-medium">
                  {activeView === "images" 
                    ? `${currentImageIndex + 1} / ${property.images.length}`
                    : activeView === "floorplan" ? "Floor Plan" : "Map"
                  }
                </div>

                {/* View Toggle Button */}
                {hasAlternativeViews && (
                  <div className="absolute bottom-3 right-3">
                    <div className="flex rounded-full bg-black/80 backdrop-blur-sm p-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveView("images"); }}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                          activeView === "images" ? "bg-[#4AC8E8] text-white" : "text-white hover:bg-white/20"
                        }`}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Photos
                      </button>
                      {hasMap && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveView("map"); }}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            activeView === "map" ? "bg-[#4AC8E8] text-white" : "text-white hover:bg-white/20"
                          }`}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Map
                        </button>
                      )}
                      {hasFloorplan && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveView("floorplan"); }}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            activeView === "floorplan" ? "bg-[#4AC8E8] text-white" : "text-white hover:bg-white/20"
                          }`}
                        >
                          <Home className="h-3.5 w-3.5" />
                          Floorplan
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {activeView === "images" && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-14 overflow-hidden rounded border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-[#4AC8E8]"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Header - Foxtons Style */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {property.newListing && (
                  <span className="bg-[#4AC8E8] text-white px-2.5 py-1 text-xs font-semibold rounded">
                    NEW LISTING
                  </span>
                )}
                {property.featured && (
                  <span className="bg-[#4AC8E8] text-white px-2.5 py-1 text-xs font-semibold rounded">
                    FEATURED
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-[#8A8880] bg-[#F3F4F6] px-2.5 py-1 rounded">
                  <Clock className="h-3 w-3" />
                  {property.addedDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#2C2A27] mb-1">
                {property.title} for sale
              </h1>
              <p className="text-lg text-[#8A8880] mb-3">{property.address}</p>
              
              <p className="text-3xl font-bold text-[#4AC8E8]">{property.price}</p>
            </div>

            {/* Key Stats Row */}
            <div className="flex flex-wrap gap-6 py-4 border-y border-[#E0DFDC] mb-6">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-[#4AC8E8]" />
                <span className="font-semibold text-[#2C2A27]">{property.stats.beds}</span>
                <span className="text-[#8A8880]">beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-[#4AC8E8]" />
                <span className="font-semibold text-[#2C2A27]">{property.stats.baths}</span>
                <span className="text-[#8A8880]">baths</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-[#4AC8E8]" />
                <span className="font-semibold text-[#2C2A27]">{property.stats.receptions}</span>
                <span className="text-[#8A8880]">receptions</span>
              </div>
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-[#4AC8E8]" />
                <span className="font-semibold text-[#2C2A27]">{property.stats.sqft.toLocaleString()}</span>
                <span className="text-[#8A8880]">sq ft</span>
              </div>
            </div>

            {/* Accordion Sections */}
            <div>
              {/* Description */}
              <AccordionItem title="Description" defaultOpen={true} icon={FileText}>
                <div className="prose max-w-none">
                  <p className="text-[#3D3B37] whitespace-pre-line leading-relaxed text-sm">
                    {property.description}
                  </p>
                </div>
              </AccordionItem>

              {/* Further Details */}
              <AccordionItem title="Further information" icon={Info}>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="bg-[#F4F3F1] p-3 rounded">
                    <p className="text-xs text-[#8A8880] mb-1">Tenure</p>
                    <p className="font-medium text-[#2C2A27]">{property.tenure.type}</p>
                  </div>
                  <div className="bg-[#F4F3F1] p-3 rounded">
                    <p className="text-xs text-[#8A8880] mb-1">Lease Expires</p>
                    <p className="font-medium text-[#2C2A27]">{property.tenure.leaseExpires}</p>
                  </div>
                  <div className="bg-[#F4F3F1] p-3 rounded">
                    <p className="text-xs text-[#8A8880] mb-1">Service Charge</p>
                    <p className="font-medium text-[#2C2A27]">{property.tenure.serviceCharge}</p>
                  </div>
                  <div className="bg-[#F4F3F1] p-3 rounded">
                    <p className="text-xs text-[#8A8880] mb-1">Council Tax</p>
                    <p className="font-medium text-[#2C2A27]">{property.tenure.councilTax}</p>
                  </div>
                  <div className="bg-[#F4F3F1] p-3 rounded sm:col-span-2">
                    <p className="text-xs text-[#8A8880] mb-1">Total Sq Ft</p>
                    <p className="font-medium text-[#2C2A27]">{property.stats.sqft.toLocaleString()} ({property.stats.sqm} Sq M) approx.</p>
                  </div>
                </div>
              </AccordionItem>

              {/* Nearest Stations */}
              <AccordionItem title="Nearest stations" icon={Train}>
                <div className="space-y-2">
                  {property.stations.map((station, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-[#E0DFDC] rounded hover:border-[#4AC8E8] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#4AC8E8]/10 rounded">
                          <Train className="h-5 w-5 text-[#4AC8E8]" />
                        </div>
                        <div>
                          <a href="#" className="font-semibold text-[#4AC8E8] hover:underline">
                            {station.name}
                          </a>
                          <p className="text-xs text-[#8A8880]">
                            {station.distance} • Zone {station.zone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {station.lines.map((line) => (
                          <span
                            key={line}
                            className="px-2 py-0.5 text-xs bg-[#F3F4F6] text-[#3D3B37] rounded"
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
              <AccordionItem title="EPC" icon={FileText}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-[#4AC8E8] flex items-center justify-center rounded">
                    <span className="text-3xl font-bold text-white">{property.stats.epc}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C2A27]">Current Rating: {property.stats.epc}</p>
                    <p className="text-sm text-[#8A8880]">Potential Rating: B</p>
                  </div>
                </div>
              </AccordionItem>
            </div>
          </div>

          {/* Right Column - Sticky Agent Card */}
          <div>
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Action Card */}
              <div className="bg-white border border-[#E0DFDC] rounded-lg p-5 shadow-sm">
                <Button className="w-full bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white py-6 text-base font-semibold rounded-lg mb-3">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book a Viewing
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className={`flex-1 py-5 border-2 rounded-lg ${saved ? 'border-red-500 text-red-500' : 'border-[#E0DFDC] text-[#8A8880]'}`}
                    onClick={() => setSaved(!saved)}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 py-5 border-2 border-[#E0DFDC] text-[#8A8880] hover:text-[#4AC8E8] hover:border-[#4AC8E8] rounded-lg"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Agent Card */}
              <div className="bg-[#F4F3F1] border border-[#E0DFDC] rounded-lg p-5">
                <p className="text-sm text-[#8A8880] mb-4">Contact Agent</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white border border-[#E0DFDC]">
                    <Image
                      src={property.agent.image}
                      alt={property.agent.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C2A27]">{property.agent.name}</p>
                    <p className="text-sm text-[#8A8880]">{property.agent.title}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <a 
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center gap-3 p-3 bg-white border border-[#E0DFDC] rounded-lg hover:border-[#4AC8E8] transition-colors"
                  >
                    <Phone className="h-4 w-4 text-[#4AC8E8]" />
                    <span className="text-[#2C2A27]">{property.agent.phone}</span>
                  </a>
                  <a 
                    href={`mailto:${property.agent.email}`}
                    className="flex items-center gap-3 p-3 bg-white border border-[#E0DFDC] rounded-lg hover:border-[#4AC8E8] transition-colors"
                  >
                    <Mail className="h-4 w-4 text-[#4AC8E8]" />
                    <span className="text-[#2C2A27]">Email agent</span>
                  </a>
                </div>
              </div>

              {/* Print Button */}
              <button className="flex items-center gap-2 text-sm text-[#8A8880] hover:text-[#4AC8E8] transition-colors">
                <Printer className="h-4 w-4" />
                Print details
              </button>
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
              className="absolute right-4 top-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-full flex items-center justify-center">
              <Image
                src={getCurrentImage()}
                alt={activeView === "images" ? `Property image ${currentImageIndex + 1}` : `${activeView} view`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />

              {activeView === "images" && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white text-sm">
                {activeView === "images" 
                  ? `${currentImageIndex + 1} / ${property.images.length}`
                  : activeView === "floorplan" ? "Floor Plan" : "Map"
                }
              </div>

              {/* View Tabs in Fullscreen */}
              {hasAlternativeViews && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <div className="flex rounded-full bg-black/80 backdrop-blur-sm p-1">
                    <button
                      onClick={() => setActiveView("images")}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        activeView === "images" ? "bg-[#4AC8E8] text-white" : "text-white hover:bg-white/20"
                      }`}
                    >
                      <ImageIcon className="h-4 w-4" />
                      Photos
                    </button>
                    {hasMap && (
                      <button
                        onClick={() => setActiveView("map")}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                          activeView === "map" ? "bg-[#4AC8E8] text-white" : "text-white hover:bg-white/20"
                        }`}
                      >
                        <MapPin className="h-4 w-4" />
                        Map
                      </button>
                    )}
                    {hasFloorplan && (
                      <button
                        onClick={() => setActiveView("floorplan")}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                          activeView === "floorplan" ? "bg-[#4AC8E8] text-white" : "text-white hover:bg-white/20"
                        }`}
                      >
                        <Home className="h-4 w-4" />
                        Floorplan
                      </button>
                    )}
                  </div>
                </div>
              )}
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
              className="bg-white p-6 max-w-md w-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Share this property</h3>
                <button onClick={() => setShowShareModal(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href);
                      setShowShareModal(false);
                    }
                  }}
                >
                  Copy Link
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Share via Email
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
