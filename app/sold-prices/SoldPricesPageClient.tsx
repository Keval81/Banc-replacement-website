"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Map, List, Loader2, AlertCircle, Building2, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  actionPrimary,
  eyebrow,
  fieldControl,
  fieldLabel,
  formPanel,
  segmented,
  segmentedOption,
} from "@/components/ui/form-styles";

import { SoldPriceHistory } from "@/components/data/SoldPriceHistory";
import { AreaStats } from "@/components/data/AreaStats";
import { SoldPriceRecord, SoldPriceStats } from "@/lib/types/data";

const PROPERTY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'detached', label: 'Detached' },
  { value: 'semi-detached', label: 'Semi-Detached' },
  { value: 'terraced', label: 'Terraced' },
  { value: 'flat', label: 'Flat' },
];

const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: '12m', label: 'Last 12 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '3m', label: 'Last 3 Months' },
];

export default function SoldPricesPage() {
  const [postcode, setPostcode] = useState("");
  const [street, setStreet] = useState("");
  const [prices, setPrices] = useState<SoldPriceRecord[]>([]);
  const [stats, setStats] = useState<SoldPriceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const search = async () => {
    if (!postcode && !street) return;
    
    setLoading(true);
    setError(null);

    try {
      const searchPostcode = postcode || 'SW1A 1AA';
      const response = await fetch(`/api/land-registry/${encodeURIComponent(searchPostcode)}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setPrices(data.prices || []);
      setStats(data.stats || null);
    } catch (err) {
      setError('Unable to load sold price data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort prices
  let filteredPrices = [...prices];
  
  // Property type filter
  if (filterType !== 'all') {
    filteredPrices = filteredPrices.filter(p => p.propertyType === filterType);
  }
  
  // Date filter
  if (filterDate !== 'all') {
    const now = new Date();
    const months = filterDate === '12m' ? 12 : filterDate === '6m' ? 6 : 3;
    const cutoff = new Date(now.setMonth(now.getMonth() - months));
    filteredPrices = filteredPrices.filter(p => new Date(p.date) >= cutoff);
  }
  
  // Street filter
  if (street) {
    filteredPrices = filteredPrices.filter(p => 
      p.address.toLowerCase().includes(street.toLowerCase())
    );
  }
  
  // Sort
  filteredPrices.sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
    }
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <main>
        <PageBand
          eyebrow="Land Registry data"
          title="Sold Prices"
          lede="Search HM Land Registry sold price data for any UK postcode"
        />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
          {/* Search Section */}
          <div className={cn(formPanel, "mb-8")}>
            <div className="mb-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>Postcode</label>
                <input
                  placeholder="e.g. SW1A 1AA"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && search()}
                  className={fieldControl}
                />
              </div>
              <div>
                <label className={fieldLabel}>Street (optional)</label>
                <input
                  placeholder="e.g. High Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && search()}
                  className={fieldControl}
                />
              </div>
            </div>
            <button
              onClick={search}
              disabled={loading || !postcode}
              className={actionPrimary}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search Sold Prices
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Results */}
          {prices.length > 0 && stats && (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Stats Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6 lg:sticky lg:top-28">
                  {/* Summary Card */}
                  <div className={formPanel}>
                    <h2 className={eyebrow}>Market Summary</h2>
                    <p className="mt-5 text-sm text-banc-muted-readable">Average Price</p>
                    <p className="mt-2 font-display text-[clamp(36px,9vw,48px)] font-light leading-none tracking-[-0.02em] text-banc-dark-deep">
                      {formatPrice(stats.averagePrice)}
                    </p>
                    <div className="mt-6 divide-y divide-banc-dark/15 border-t border-banc-dark/15">
                      <div className="flex items-center justify-between gap-4 py-3">
                        <span className="text-banc-muted-readable">Median Price</span>
                        <span className="font-medium text-banc-dark-deep">{formatPrice(stats.medianPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <span className="text-banc-muted-readable">Sales (12 months)</span>
                        <span className="font-medium text-banc-dark-deep">{stats.salesCount12Months}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 pt-3">
                        <span className="text-banc-muted-readable">Price Change</span>
                        <span className={`font-medium ${stats.priceChangePercent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {stats.priceChangePercent >= 0 ? '+' : ''}{stats.priceChangePercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Area Stats */}
                  {postcode && <AreaStats postcode={postcode} compact />}
                </div>
              </div>

              {/* Results List */}
              <div className="lg:col-span-2">
                {/* Filters */}
                <div className="mb-6">
                  <p className={fieldLabel}>Filters</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className={cn(fieldControl, "appearance-none pr-11")}
                      >
                        {PROPERTY_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-banc-muted-readable" />
                    </div>

                    <div className="relative">
                      <select
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className={cn(fieldControl, "appearance-none pr-11")}
                      >
                        {DATE_RANGES.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-banc-muted-readable" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-sm text-banc-muted-readable">{filteredPrices.length} results</span>
                    <div className={cn(segmented, "w-auto")}>
                      <button
                        onClick={() => setViewMode('list')}
                        className={cn(segmentedOption(viewMode === 'list'), "inline-flex items-center justify-center px-3")}
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={cn(segmentedOption(viewMode === 'map'), "inline-flex items-center justify-center px-3")}
                      >
                        <Map className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price List */}
                {filteredPrices.length > 0 && (
                  <div className="divide-y divide-banc-dark/15 overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white">
                    {filteredPrices.map((price, index) => (
                      <motion.div
                        key={price.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-5 sm:px-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-banc-dark-deep">{price.address}</h3>
                            {price.newBuild && (
                              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-banc-muted-readable">New Build</p>
                            )}
                            <p className="mt-1 text-sm text-banc-muted-readable">{price.postcode}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1 text-sm text-banc-muted-readable">
                                <Building2 className="h-3.5 w-3.5" />
                                {price.propertyType}
                              </span>
                              <span className="flex items-center gap-1 text-sm text-banc-muted-readable">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(price.date)}
                              </span>
                              <span className="text-sm capitalize text-banc-muted-readable">
                                {price.tenure}
                              </span>
                            </div>
                          </div>
                          <p className="flex-shrink-0 text-right text-lg font-semibold text-banc-dark-deep">{price.priceFormatted}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {filteredPrices.length === 0 && (
                  <p className="border-t border-banc-dark/15 pt-6 text-banc-muted-readable">No results match your filters</p>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && prices.length === 0 && !error && (
            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className="mb-2 text-lg font-semibold text-banc-dark-deep">Search for Sold Prices</h3>
              <p className="text-banc-muted-readable">Enter a postcode to see sold price history and area statistics</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
