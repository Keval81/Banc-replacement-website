"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Building2, Loader2, AlertCircle } from "lucide-react";
import { actionPrimary, choiceChip, eyebrow, fieldControl } from "@/components/ui/form-styles";
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
    <div className={`overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-banc-dark/15 px-5 py-5 sm:px-6">
        <p className={eyebrow}>HM Land Registry data</p>
        <h3 className="mt-2 text-lg font-semibold text-banc-dark-deep">Sold Price History</h3>
      </div>

      {/* Search */}
      {!initialPostcode && (
        <div className="border-b border-banc-dark/15 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Enter postcode..."
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className={`${fieldControl} sm:flex-1`}
            />
            <button onClick={fetchData} disabled={loading} className={actionPrimary}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && !loading && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-banc-dark/15 px-5 py-5 sm:grid-cols-4 sm:px-6">
          <div>
            <p className="mb-1 text-xs text-banc-muted-readable">Average Price</p>
            <p className="text-lg font-medium text-banc-dark-deep">
              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(stats.averagePrice)}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-banc-muted-readable">Median Price</p>
            <p className="text-lg font-medium text-banc-dark-deep">
              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(stats.medianPrice)}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-banc-muted-readable">Sales (12m)</p>
            <p className="text-lg font-medium text-banc-dark-deep">{stats.salesCount12Months}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-banc-muted-readable">Price Change</p>
            <p className={`text-lg font-medium ${stats.priceChangePercent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {stats.priceChangePercent >= 0 ? '+' : ''}{stats.priceChangePercent}%
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      {prices.length > 0 && (
        <div className="overflow-x-auto border-b border-banc-dark/15 px-5 py-4 sm:px-6">
          <div className="flex gap-2">
            {(['all', 'detached', 'semi-detached', 'terraced', 'flat'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`${choiceChip(filter === type)} flex-shrink-0 whitespace-nowrap capitalize`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center px-5 py-12 sm:px-6">
            <Loader2 className="h-8 w-8 animate-spin text-banc-muted-readable" />
          </div>
        ) : error ? (
          <div className="flex items-center px-5 py-12 text-red-700 sm:px-6">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="px-5 py-12 text-banc-muted-readable sm:px-6">
            <p>No sold prices found</p>
            {!initialPostcode && <p className="mt-1 text-sm">Enter a postcode to search</p>}
          </div>
        ) : (
          <div className="divide-y divide-banc-dark/15">
            {filteredPrices.map((price, index) => (
              <motion.div
                key={price.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-5 py-4 sm:px-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-banc-dark-deep">{price.address}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1 text-xs text-banc-muted-readable">
                        <Calendar className="h-3 w-3" />
                        {formatDate(price.date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-banc-muted-readable">
                        <Building2 className="h-3 w-3" />
                        {price.propertyType}
                      </span>
                      {price.newBuild && (
                        <span className="text-xs font-medium text-green-700">
                          New build
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-semibold text-banc-dark-deep">{price.priceFormatted}</p>
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
        <div className="border-t border-banc-dark/15 px-5 py-3 text-xs text-banc-muted-readable sm:px-6">
          Data from HM Land Registry • Updated daily
        </div>
      )}
    </div>
  );
}
