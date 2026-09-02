"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Map,
  List,
  Loader2,
  AlertCircle,
  PoundSterling,
  Building2,
  ArrowUpDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen bg-banc-grey-pale py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-banc-dark mb-2">Sold Prices</h1>
          <p className="text-banc-grey">Search HM Land Registry sold price data for any UK postcode</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-banc-grey/20 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-banc-dark-mid mb-1">Postcode</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. SW1A 1AA"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && search()}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-banc-dark-mid mb-1">Street (optional)</label>
              <Input
                placeholder="e.g. High Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
              />
            </div>
          </div>
          <Button 
            onClick={search} 
            disabled={loading || !postcode}
            className="w-full md:w-auto bg-[#4AC8E8] hover:bg-[#4AC8E8]/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search Sold Prices
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Results */}
        {prices.length > 0 && stats && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Stats Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-xl shadow-sm border border-banc-grey/20 p-6">
                  <h2 className="text-lg font-semibold text-banc-dark mb-4">Market Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-banc-grey">Average Price</span>
                      <span className="text-xl font-bold text-banc-dark">{formatPrice(stats.averagePrice)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-banc-grey">Median Price</span>
                      <span className="text-lg font-semibold text-banc-dark">{formatPrice(stats.medianPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-banc-grey">Sales (12 months)</span>
                      <span className="font-semibold text-banc-dark">{stats.salesCount12Months}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-banc-grey">Price Change</span>
                      <span className={`font-semibold ${stats.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.priceChangePercent >= 0 ? '+' : ''}{stats.priceChangePercent}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-banc-grey">Price per sq ft</span>
                      <span className="font-semibold text-banc-dark">£{stats.pricePerSqft}</span>
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
              <div className="bg-white rounded-xl shadow-sm border border-banc-grey/20 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-banc-grey" />
                    <span className="text-sm font-medium text-banc-dark-mid">Filters:</span>
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-sm border border-banc-grey/30 rounded-md px-3 py-1.5"
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>

                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="text-sm border border-banc-grey/30 rounded-md px-3 py-1.5"
                  >
                    {DATE_RANGES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-banc-grey">{filteredPrices.length} results</span>
                    <div className="flex border rounded-md overflow-hidden">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-banc-grey-pale' : 'hover:bg-banc-grey-pale'}`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`p-2 ${viewMode === 'map' ? 'bg-banc-grey-pale' : 'hover:bg-banc-grey-pale'}`}
                      >
                        <Map className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price List */}
              <div className="space-y-3">
                {filteredPrices.map((price, index) => (
                  <motion.div
                    key={price.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-xl shadow-sm border border-banc-grey/20 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-banc-dark">{price.address}</h3>
                          {price.newBuild && (
                            <Badge variant="secondary" className="text-xs">New Build</Badge>
                          )}
                        </div>
                        <p className="text-sm text-banc-grey">{price.postcode}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="text-sm text-banc-grey flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {price.propertyType}
                          </span>
                          <span className="text-sm text-banc-grey flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(price.date)}
                          </span>
                          <span className="text-sm text-banc-grey capitalize">
                            {price.tenure}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-banc-dark">{price.priceFormatted}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredPrices.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-banc-grey/20">
                  <Home className="h-12 w-12 mx-auto mb-3 text-banc-grey" />
                  <p className="text-banc-grey">No results match your filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && prices.length === 0 && !error && (
          <div className="text-center py-16">
            <Home className="h-16 w-16 mx-auto mb-4 text-banc-grey" />
            <h3 className="text-lg font-medium text-banc-dark mb-2">Search for Sold Prices</h3>
            <p className="text-banc-grey">Enter a postcode to see sold price history and area statistics</p>
          </div>
        )}
      </div>
    </div>
  );
}
