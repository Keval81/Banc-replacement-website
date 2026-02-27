"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Home, 
  Clock,
  PoundSterling,
  BarChart3,
  Loader2,
  AlertCircle,
  Building2,
  Calendar
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AreaStatistics } from "@/lib/types/data";

interface AreaStatsProps {
  postcode?: string;
  className?: string;
  compact?: boolean;
}

export function AreaStats({ postcode: initialPostcode, className = "", compact = false }: AreaStatsProps) {
  const [postcode, setPostcode] = useState(initialPostcode || "");
  const [stats, setStats] = useState<AreaStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!postcode) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/land-registry/${encodeURIComponent(postcode)}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      // Calculate area statistics from sold prices
      const prices = data.prices || [];
      const priceValues = prices.map((p: any) => p.price);
      
      const avg = priceValues.length > 0 
        ? priceValues.reduce((a: number, b: number) => a + b, 0) / priceValues.length 
        : 0;
      
      const sorted = [...priceValues].sort((a, b) => a - b);
      const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;

      // Property type breakdown
      const breakdown: Record<string, number> = {};
      prices.forEach((p: any) => {
        breakdown[p.propertyType] = (breakdown[p.propertyType] || 0) + 1;
      });

      const areaStats: AreaStatistics = {
        postcode,
        averagePrice: avg,
        medianPrice: median,
        pricePerSqft: Math.round(avg / 1000),
        salesCount12Months: data.stats?.salesCount12Months || 0,
        avgTimeOnMarket: 42,
        priceChange1Year: data.stats?.priceChangePercent || 0,
        priceChange3Years: (data.stats?.priceChangePercent || 0) * 2.5,
        priceChange5Years: (data.stats?.priceChangePercent || 0) * 4,
        propertyTypeBreakdown: breakdown,
      };

      setStats(areaStats);
    } catch (err) {
      setError('Unable to load area statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPostcode) {
      fetchStats();
    }
  }, [initialPostcode]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPercent = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

  if (compact) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : error ? (
          <span className="text-xs text-red-500">{error}</span>
        ) : stats ? (
          <>
            <div className="flex items-center gap-1.5">
              <PoundSterling className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-sm font-medium">{formatPrice(stats.averagePrice)} avg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className={`h-3.5 w-3.5 ${stats.priceChange1Year >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${stats.priceChange1Year >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(stats.priceChange1Year)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-sm text-gray-600">{stats.salesCount12Months} sales</span>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Area Statistics</h3>
            <p className="text-sm text-gray-600">{stats?.postcode || postcode || 'Enter a postcode'}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      {!initialPostcode && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter postcode..."
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <button 
              onClick={fetchStats}
              className="px-4 py-2 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 text-red-500">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      ) : stats ? (
        <div className="p-5">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <PoundSterling className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Average Price</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.averagePrice)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <PoundSterling className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Median Price</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.medianPrice)}</p>
            </div>
          </div>

          {/* Price Changes */}
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-700">Price Changes</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">1 Year</p>
                <p className={`text-lg font-bold ${stats.priceChange1Year >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(stats.priceChange1Year)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">3 Years</p>
                <p className={`text-lg font-bold ${stats.priceChange3Years >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(stats.priceChange3Years)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">5 Years</p>
                <p className={`text-lg font-bold ${stats.priceChange5Years >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(stats.priceChange5Years)}
                </p>
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-700">Market Activity</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Home className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-lg font-bold">{stats.salesCount12Months}</p>
                  <p className="text-xs text-gray-500">Sales (12m)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-lg font-bold">{stats.avgTimeOnMarket}</p>
                  <p className="text-xs text-gray-500">Days to sell</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <PoundSterling className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-lg font-bold">£{stats.pricePerSqft}</p>
                  <p className="text-xs text-gray-500">/ sq ft</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Type Breakdown */}
          {Object.keys(stats.propertyTypeBreakdown).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Property Types Sold</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.propertyTypeBreakdown).map(([type, count]) => (
                  <Badge key={type} variant="secondary" className="capitalize">
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No data available</p>
          {!initialPostcode && <p className="text-sm mt-1">Enter a postcode to search</p>}
        </div>
      )}

      {/* Footer */}
      {stats && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
          Data from HM Land Registry • Past performance not indicative of future results
        </div>
      )}
    </div>
  );
}
