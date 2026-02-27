'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calculator, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Home, 
  MapPin, 
  CheckCircle2,
  AlertCircle,
  PoundSterling
} from 'lucide-react';

interface ValuationResult {
  estimate: number;
  lowEstimate: number;
  highEstimate: number;
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  comparables: Array<{
    address: string;
    price: number;
    date: string;
    bedrooms: number;
    propertyType: string;
    distance: number;
  }>;
  marketTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
}

export default function AVMValuation() {
  const [formData, setFormData] = useState({
    address: '',
    postcode: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    condition: 'good',
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/valuation/avm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: formData.address,
          postcode: formData.postcode,
          propertyType: formData.propertyType,
          bedrooms: parseInt(formData.bedrooms, 10),
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms, 10) : undefined,
          condition: formData.condition,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.valuation);
      } else {
        setError(data.error || 'Failed to calculate valuation');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTrendIcon = () => {
    if (!result) return null;
    switch (result.marketTrend.direction) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Valuation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Property Address *</Label>
            <div className="relative mt-1">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., 42 Station Road"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="postcode">Postcode *</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                placeholder="e.g., EN6 4BB"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="propertyType">Property Type *</Label>
            <Select
              value={formData.propertyType}
              onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Detached House">Detached House</SelectItem>
                <SelectItem value="Semi-Detached House">Semi-Detached House</SelectItem>
                <SelectItem value="Terraced House">Terraced House</SelectItem>
                <SelectItem value="Bungalow">Bungalow</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Cottage">Cottage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bedrooms">Bedrooms *</Label>
            <Select
              value={formData.bedrooms}
              onValueChange={(value) => setFormData({ ...formData, bedrooms: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4 Bedrooms</SelectItem>
                <SelectItem value="5">5+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Select
              value={formData.bathrooms}
              onValueChange={(value) => setFormData({ ...formData, bathrooms: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select bathrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Bathroom</SelectItem>
                <SelectItem value="2">2 Bathrooms</SelectItem>
                <SelectItem value="3">3+ Bathrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) => setFormData({ ...formData, condition: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="poor">Requires Work</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#1a4d5c] hover:bg-[#1a4d5c]/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Get Instant Valuation
            </>
          )}
        </Button>
      </form>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-50 rounded-2xl p-6 space-y-6"
          >
            {/* Main Estimate */}
            <div className="text-center">
              <p className="text-gray-600 mb-2">Estimated Value</p>
              <p className="text-5xl font-bold text-[#1a4d5c]">
                {formatPrice(result.estimate)}
              </p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="text-gray-500">
                  Range: {formatPrice(result.lowEstimate)} - {formatPrice(result.highEstimate)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidenceLevel)}`}>
                  {result.confidenceLevel === 'high' && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                  {result.confidence}% Confidence
                </span>
              </div>
            </div>

            {/* Market Trend */}
            <div className="bg-white rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Market Trend</p>
                <p className="font-medium">{result.marketTrend.period}</p>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className={`font-bold ${
                  result.marketTrend.direction === 'up' ? 'text-green-600' :
                  result.marketTrend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {result.marketTrend.direction === 'up' ? '+' : ''}
                  {result.marketTrend.percentage}%
                </span>
              </div>
            </div>

            {/* Factors */}
            {(result.factors.positive.length > 0 || result.factors.negative.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4">
                {result.factors.positive.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="font-medium text-green-800 mb-2">Positive Factors</p>
                    <ul className="space-y-1">
                      {result.factors.positive.map((factor, i) => (
                        <li key={i} className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.factors.negative.length > 0 && (
                  <div className="bg-gray-100 rounded-xl p-4">
                    <p className="font-medium text-gray-800 mb-2">Considerations</p>
                    <ul className="space-y-1">
                      {result.factors.negative.map((factor, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Comparables */}
            <div>
              <p className="font-medium text-gray-900 mb-3">Recent Comparable Sales</p>
              <div className="space-y-2">
                {result.comparables.map((comp, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{comp.address}</p>
                      <p className="text-gray-500">
                        {comp.bedrooms} bed {comp.propertyType} • Sold {comp.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(comp.price)}</p>
                      <p className="text-gray-500">{comp.distance} miles away</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#1a4d5c] text-white rounded-xl p-4 text-center">
              <p className="font-medium mb-2">Want a more accurate valuation?</p>
              <p className="text-sm text-white/80 mb-3">
                Our local experts can provide a detailed in-person valuation
              </p>
              <Button variant="secondary" className="bg-white text-[#1a4d5c] hover:bg-gray-100">
                Book Free Valuation
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}