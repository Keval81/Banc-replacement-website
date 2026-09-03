"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  PoundSterling,
  MapPin,
  Building2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SoldPriceRecord, SoldPriceStats } from "@/lib/types/data";

interface SoldPriceHistoryProps {
  postcode?: string;
  street?: string;
  className?: string;
}

export function SoldPriceHistory({ postcode: initialPostcode, street, className = "" }: SoldPriceHistoryProps) {
  const [postcode, setPostcode] = useState(initialPostcode || "");
  const [prices, setPrices] = useState<SoldPriceRecord[]>([]);
  const [stats, setStats] = useState<SoldPriceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'detached' | 'semi-detached' | 'terraced' | 'flat'>('all');

  const fetchData = async () => {
    if (!postcode) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/land-registry/${encodeURIComponent(postcode)}`);
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

  useEffect(() => {
    if (initialPostcode) {
      fetchData();
    }
  }, [initialPostcode]);

  const filteredPrices = filter === 'all' 
    ? prices 
    : prices.filter(p => p.propertyType === filter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  return (
    <div className={`bg-white rounded-lg border border-banc-grey/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-banc-grey/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-banc-dark">Sold Price History</h3>
            <p className="text-sm text-banc-muted-readable">HM Land Registry data</p>
          </div>
        </div>
      </div>

      {/* Search */}
      {!initialPostcode && (
        <div className="p-4 border-b border-banc-grey/20">
          <div className="flex gap-2">
            <Input
              placeholder="Enter postcode..."
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={fetchData} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border-b border-banc-grey/20">
          <div className="text-center">
            <p className="text-xs text-banc-muted-readable mb-1">Average Price</p>
            <p className="text-lg font-bold text-banc-dark">
              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(stats.averagePrice)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-banc-muted-readable mb-1">Median Price</p>
            <p className="text-lg font-bold text-banc-dark">
              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(stats.medianPrice)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-banc-muted-readable mb-1">Sales (12m)</p>
            <p className="text-lg font-bold text-banc-dark">{stats.salesCount12Months}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-banc-muted-readable mb-1">Price Change</p>
            <p className={`text-lg font-bold ${stats.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.priceChangePercent >= 0 ? '+' : ''}{stats.priceChangePercent}%
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      {prices.length > 0 && (
        <div className="px-4 py-3 border-b border-banc-grey/20 overflow-x-auto">
          <div className="flex gap-2">
            {(['all', 'detached', 'semi-detached', 'terraced', 'flat'] as const).map((type) => (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
                className="text-xs capitalize"
              >
                {type === 'all' ? 'All Types' : type}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Price List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-banc-muted-readable" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="text-center py-12 text-banc-muted-readable">
            <Home className="h-12 w-12 mx-auto mb-3 text-banc-muted-readable" />
            <p>No sold prices found</p>
            {!initialPostcode && <p className="text-sm mt-1">Enter a postcode to search</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPrices.map((price, index) => (
              <motion.div
                key={price.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-5 py-4 hover:bg-banc-grey-pale transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-banc-dark">{price.address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-banc-muted-readable flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(price.date)}
                      </span>
                      <span className="text-xs text-banc-muted-readable flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {price.propertyType}
                      </span>
                      {price.newBuild && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          New build
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-banc-dark">{price.priceFormatted}</p>
                    <span className="text-xs text-banc-muted-readable">{price.tenure}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {prices.length > 0 && (
        <div className="px-5 py-3 bg-banc-grey-pale border-t border-banc-grey/20 text-xs text-banc-muted-readable text-center">
          Data from HM Land Registry • Updated daily
        </div>
      )}
    </div>
  );
}
