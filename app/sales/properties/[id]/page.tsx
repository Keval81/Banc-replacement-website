"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PropertyGallery } from "@/components/PropertyGallery";
import { FloorplanViewer } from "@/components/FloorplanViewer";
import { EPCVisualizer } from "@/components/EPCVisualizer";
import { TransportLinks } from "@/components/TransportLinks";
import { LocalAmenities } from "@/components/LocalAmenities";
import { StreetViewComponent } from "@/components/StreetView";
import { AgentContactCard } from "@/components/AgentContactCard";
import { SimilarProperties } from "@/components/SimilarProperties";
import { ShareButtons } from "@/components/ShareButtons";
import MatchScore from "@/components/ai/MatchScore";
import ViewingCounter from "@/components/social/ViewingCounter";
import SmartDescription from "@/components/ai/SmartDescription";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Home,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Check,
  TrendingUp,
  History,
  ImageIcon,
  Play,
  X,
  Phone,
} from "lucide-react";
import { sampleProperty, similarProperties, getPropertyById } from "@/lib/property-data";

type GalleryTab = "photos" | "tour" | "map" | "floorplan";

// Accordion Component
function AccordionItem({ 
  title, 
  children, 
  defaultOpen = false,
  icon: Icon,
  badge,
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-banc-grey/20 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3 sm:py-4 text-left hover:bg-banc-grey-pale/50 transition-colors group min-h-[56px]"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#4AC8E8] flex-shrink-0" />}
          <h3 className="text-sm sm:text-base font-semibold text-banc-dark">{title}</h3>
          {badge && (
            <span className="text-[10px] sm:text-xs bg-[#4AC8E8]/10 text-[#4AC8E8] px-1.5 sm:px-2 py-0.5 rounded-full font-medium flex-shrink-0">
              {badge}
            </span>
          )}
        </div>
        <ChevronRight 
          className={`h-4 w-4 sm:h-5 sm:w-5 text-banc-grey transition-transform duration-200 group-hover:text-[#4AC8E8] flex-shrink-0 ml-2 ${
            isOpen ? "rotate-90" : ""
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

// Virtual Tour Modal
function VirtualTourModal({ 
  url, 
  isOpen, 
  onClose 
}: { 
  url: string; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black"
    >
      <div className="flex items-center justify-between px-6 py-4 bg-banc-dark-deep text-white">
        <div className="flex items-center gap-3">
          <Play className="h-5 w-5 text-[#4AC8E8]" />
          <span className="font-medium">Virtual Tour</span>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="h-[calc(100vh-72px)]">
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="xr-spatial-tracking"
          className="w-full h-full"
        />
      </div>
    </motion.div>
  );
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<GalleryTab>("photos");
  const [showTourModal, setShowTourModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const property = getPropertyById(params.id) ?? sampleProperty;

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-banc-grey-pale border-b border-banc-grey/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-banc-grey">
            <a href="/" className="hover:text-[#4AC8E8] transition-colors">Home</a>
            <ChevronRight className="h-4 w-4" />
            <a href="/sales/properties" className="hover:text-[#4AC8E8] transition-colors">For Sale</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-banc-dark truncate max-w-[200px] sm:max-w-[400px]">{property.address}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-6">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[65%_35%]">
          {/* Left Column */}
          <div>
            {/* Gallery with Tabs */}
            <div className="mb-6">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <button
                  onClick={() => setActiveTab("photos")}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === "photos" 
                      ? "bg-[#4AC8E8] text-white" 
                      : "bg-banc-grey-pale text-banc-grey hover:bg-banc-grey/20"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Photos ({property.images.length})</span>
                  <span className="sm:hidden">Photos</span>
                </button>
                {property.virtualTour && (
                  <button
                    onClick={() => setActiveTab("tour")}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === "tour" 
                        ? "bg-[#4AC8E8] text-white" 
                        : "bg-banc-grey-pale text-banc-grey hover:bg-banc-grey/20"
                    }`}
                  >
                    <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Virtual Tour</span>
                    <span className="sm:hidden">Tour</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("map")}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === "map" 
                      ? "bg-[#4AC8E8] text-white" 
                      : "bg-banc-grey-pale text-banc-grey hover:bg-banc-grey/20"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Map & Street View</span>
                  <span className="sm:hidden">Map</span>
                </button>
                <button
                  onClick={() => setActiveTab("floorplan")}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === "floorplan" 
                      ? "bg-[#4AC8E8] text-white" 
                      : "bg-banc-grey-pale text-banc-grey hover:bg-banc-grey/20"
                  }`}
                >
                  <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Floorplans</span>
                  <span className="sm:hidden">Plans</span>
                </button>
              </div>

              {/* Gallery Content */}
              <AnimatePresence mode="wait">
                {activeTab === "photos" && (
                  <motion.div
                    key="photos"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <PropertyGallery images={property.images} />
                  </motion.div>
                )}

                {activeTab === "tour" && property.virtualTour && (
                  <motion.div
                    key="tour"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative bg-banc-dark-deep rounded-lg overflow-hidden"
                  >
                    <div className="aspect-video relative">
                      <Image
                        src={property.virtualTour.thumbnail || property.images[0]?.url || ""}
                        alt="Virtual Tour Thumbnail"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button
                          onClick={() => setShowTourModal(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-[#4AC8E8] text-white rounded-full font-semibold hover:bg-[#4AC8E8]/90 transition-colors"
                        >
                          <Play className="h-5 w-5" />
                          Launch Virtual Tour
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "map" && (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <StreetViewComponent
                      lat={property.mapCoordinates.lat}
                      lng={property.mapCoordinates.lng}
                      address={property.address}
                    />
                  </motion.div>
                )}

                {activeTab === "floorplan" && (
                  <motion.div
                    key="floorplan"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <FloorplanViewer floorplans={property.floorplans} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Property Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                {property.newListing && (
                  <span className="bg-[#4AC8E8] text-white px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded">
                    NEW LISTING
                  </span>
                )}
                {property.featured && (
                  <span className="bg-[#4AC8E8] text-white px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded">
                    FEATURED
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-banc-grey bg-banc-grey-pale px-2 py-0.5 rounded">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Added {property.addedDate}
                </span>
                {/* AI Match Score */}
                <div className="hidden sm:block">
                  <MatchScore 
                    score={92} 
                    size="sm" 
                    showLabel={false}
                    reasons={['Within your price range', '4 bedrooms as requested', 'Has Garden, Garage, Parking']}
                  />
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-banc-dark mb-1 leading-tight">
                {property.title}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-banc-grey mb-2 sm:mb-3">{property.address}</p>
              
              {/* Price - Moved up for mobile visibility */}
              <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
                <p className="text-2xl sm:text-3xl font-bold text-[#4AC8E8]">{property.price}</p>
                {property.priceQualifier && (
                  <span className="text-xs sm:text-sm text-banc-grey">{property.priceQualifier}</span>
                )}
              </div>
              
              {/* Smart Description Tags */}
              <div className="mb-2 sm:mb-3">
                <SmartDescription 
                  property={{
                    features: property.features || [],
                    bedrooms: property.beds || 0,
                    location: property.address || '',
                    propertyType: 'Detached House',
                    nearbySchools: true,
                    transportLinks: true,
                  }}
                />
              </div>
              
              {/* Viewing Counter */}
              <div className="mb-2 sm:mb-3">
                <ViewingCounter propertyId={property.id} baseCount={18} />
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 py-3 sm:py-4 border-y border-banc-grey/20 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                  <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-[#4AC8E8]" />
                </div>
                <div className="min-w-0">
                  <span className="block font-bold text-banc-dark text-sm sm:text-base">{property.beds}</span>
                  <span className="text-[10px] sm:text-sm text-banc-grey">Beds</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                  <Bath className="h-4 w-4 sm:h-5 sm:w-5 text-[#4AC8E8]" />
                </div>
                <div className="min-w-0">
                  <span className="block font-bold text-banc-dark text-sm sm:text-base">{property.baths}</span>
                  <span className="text-[10px] sm:text-sm text-banc-grey">Baths</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 text-[#4AC8E8]" />
                </div>
                <div className="min-w-0">
                  <span className="block font-bold text-banc-dark text-sm sm:text-base">{property.receptions}</span>
                  <span className="text-[10px] sm:text-sm text-banc-grey hidden sm:block">Receptions</span>
                  <span className="text-[10px] sm:text-sm text-banc-grey sm:hidden">Recep</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                  <Square className="h-4 w-4 sm:h-5 sm:w-5 text-[#4AC8E8]" />
                </div>
                <div className="min-w-0">
                  <span className="block font-bold text-banc-dark text-xs sm:text-base truncate">{property.sqft.toLocaleString()}</span>
                  <span className="text-[10px] sm:text-sm text-banc-grey">sq ft</span>
                </div>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className="mb-8">
              {/* Description */}
              <AccordionItem title="Description" defaultOpen={true} icon={FileText}>
                <div className="prose max-w-none">
                  <p className="text-sm sm:text-base text-banc-grey whitespace-pre-line leading-relaxed">
                    {property.description}
                  </p>
                </div>
              </AccordionItem>

              {/* Features */}
              <AccordionItem title="Key Features" badge={`${property.features.length}`} icon={Check}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {property.features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-2 p-2 sm:p-2.5 bg-banc-grey-pale rounded"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4AC8E8] mt-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-banc-dark-mid leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </AccordionItem>

              {/* Further Information */}
              <AccordionItem title="Further Information" icon={Info}>
                <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                  <div className="bg-banc-grey-pale p-3 sm:p-4 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-banc-grey mb-0.5 sm:mb-1">Tenure</p>
                    <p className="text-sm sm:text-base font-medium text-banc-dark">{property.tenure.type}</p>
                  </div>
                  {property.tenure.leaseExpires && (
                    <div className="bg-banc-grey-pale p-3 sm:p-4 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-banc-grey mb-0.5 sm:mb-1">Lease Expires</p>
                      <p className="text-sm sm:text-base font-medium text-banc-dark">{property.tenure.leaseExpires}</p>
                    </div>
                  )}
                  {property.tenure.serviceCharge && (
                    <div className="bg-banc-grey-pale p-3 sm:p-4 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-banc-grey mb-0.5 sm:mb-1">Service Charge</p>
                      <p className="text-sm sm:text-base font-medium text-banc-dark">{property.tenure.serviceCharge}</p>
                    </div>
                  )}
                  {property.tenure.councilTax && (
                    <div className="bg-banc-grey-pale p-3 sm:p-4 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-banc-grey mb-0.5 sm:mb-1">Council Tax</p>
                      <p className="text-sm sm:text-base font-medium text-banc-dark">{property.tenure.councilTax}</p>
                    </div>
                  )}
                  {property.tenure.localAuthority && (
                    <div className="bg-banc-grey-pale p-3 sm:p-4 rounded-lg sm:col-span-2">
                      <p className="text-[10px] sm:text-xs text-banc-grey mb-0.5 sm:mb-1">Local Authority</p>
                      <p className="text-sm sm:text-base font-medium text-banc-dark">{property.tenure.localAuthority}</p>
                    </div>
                  )}
                </div>
              </AccordionItem>

              {/* EPC */}
              <AccordionItem title="Energy Performance" badge={property.epc.currentRating} icon={TrendingUp}>
                <EPCVisualizer epc={property.epc} />
              </AccordionItem>

              {/* Transport */}
              <AccordionItem title="Transport Links" badge={`${property.transport.length}`} icon={MapPin}>
                <TransportLinks 
                  stations={property.transport} 
                  propertyAddress={property.address}
                />
              </AccordionItem>

              {/* Local Amenities */}
              <AccordionItem title="Local Amenities" badge={`${property.amenities.length}`} icon={Home}>
                <LocalAmenities 
                  amenities={property.amenities}
                  propertyAddress={property.address}
                />
              </AccordionItem>

              {/* Property History */}
              {property.history && property.history.length > 0 && (
                <AccordionItem title="Property History" icon={History}>
                  <div className="space-y-2 sm:space-y-3">
                    {property.history.map((record, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-banc-grey-pale rounded-lg"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-sm sm:text-base font-medium text-banc-dark">
                            {record.event === 'sold' ? 'Sold' : 'Listed for sale'}
                          </p>
                          <p className="text-xs sm:text-sm text-banc-grey">
                            {new Date(record.date).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                          {record.agent && (
                            <p className="text-[10px] sm:text-xs text-banc-grey truncate">{record.agent}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-semibold text-banc-dark">{record.price}</p>
                          {record.priceChange && (
                            <p className="text-xs sm:text-sm text-green-600">{record.priceChange}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              )}
            </div>

            {/* Map Section (if not in tabs) */}
            <div className="mb-8 lg:hidden">
              <h2 className="text-lg font-bold text-banc-dark mb-4">Location</h2>
              <StreetViewComponent
                lat={property.mapCoordinates.lat}
                lng={property.mapCoordinates.lng}
                address={property.address}
              />
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:pl-6 order-first lg:order-last">
            <div className="lg:sticky lg:top-24 space-y-3 sm:space-y-4">
              {/* Share Buttons - Hidden on mobile (moved to sticky CTA) */}
              <div className="hidden lg:block">
                <ShareButtons
                  propertyUrl={`/sales/properties/${property.id}`}
                  propertyTitle={property.title}
                  propertyPrice={property.price}
                  onSave={handleSave}
                  isSaved={isSaved}
                />
              </div>

              {/* Agent Contact Card */}
              <AgentContactCard
                agent={property.agent}
                propertyId={property.id}
              />

              {/* Reference Number */}
              <div className="text-center text-[10px] sm:text-xs text-banc-grey pb-4 lg:pb-0">
                Property Reference: {property.reference}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-banc-grey/20">
          <SimilarProperties properties={similarProperties} />
        </div>
      </main>

      {/* Virtual Tour Modal */}
      <AnimatePresence>
        {showTourModal && property.virtualTour && (
          <VirtualTourModal
            url={property.virtualTour.url}
            isOpen={showTourModal}
            onClose={() => setShowTourModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-banc-grey/20 p-3 sm:p-4 z-40 safe-area-pb">
        <div className="flex gap-2 sm:gap-3 max-w-lg mx-auto">
          <Button
            variant="outline"
            className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-semibold"
            onClick={handleSave}
          >
            {isSaved ? (
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                Saved
              </span>
            ) : (
              "Save"
            )}
          </Button>
          <Button className="flex-[2] h-12 sm:h-14 bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white text-sm sm:text-base font-semibold shadow-lg">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />
            Contact Agent
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
