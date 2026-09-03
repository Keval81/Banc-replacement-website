"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Navigation, 
  MapPin, 
  Clock,
  Train,
  Bus,
  Footprints,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JourneyResult } from "@/lib/types/data";

const COMMON_DESTINATIONS = [
  { name: 'London Bridge', postcode: 'SE1 9SG' },
  { name: 'Waterloo', postcode: 'SE1 7ND' },
  { name: 'Canary Wharf', postcode: 'E14 5AB' },
  { name: 'Liverpool Street', postcode: 'EC2M 7PY' },
  { name: 'Kings Cross', postcode: 'N1 9AL' },
];

interface JourneyPlannerProps {
  fromPostcode?: string;
  className?: string;
}

export function JourneyPlanner({ fromPostcode, className = "" }: JourneyPlannerProps) {
  const [from, setFrom] = useState(fromPostcode || "");
  const [to, setTo] = useState("");
  const [journey, setJourney] = useState<JourneyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planJourney = async () => {
    if (!from || !to) return;
    
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/transport/journey', window.location.origin);
      url.searchParams.append('from', from);
      url.searchParams.append('to', to);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to plan journey');
      
      const data = await response.json();
      setJourney(data);
    } catch (err) {
      setError('Unable to plan journey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const planToDestination = async (postcode: string) => {
    setTo(postcode);
    if (!from) return;
    
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/transport/journey', window.location.origin);
      url.searchParams.append('from', from);
      url.searchParams.append('to', postcode);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to plan journey');
      
      const data = await response.json();
      setJourney(data);
    } catch (err) {
      setError('Unable to plan journey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'tube':
      case 'overground':
      case 'dlr':
        return <Train className="h-4 w-4" />;
      case 'bus':
        return <Bus className="h-4 w-4" />;
      case 'walking':
        return <Footprints className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-banc-grey/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-banc-grey/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-banc-dark">Journey Planner</h3>
            <p className="text-sm text-banc-muted-readable">Plan your commute</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Inputs */}
        <div className="space-y-3 mb-4">
          {!fromPostcode && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-banc-muted-readable flex-shrink-0" />
              <Input
                placeholder="From postcode..."
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="flex-1"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-banc-muted-readable flex-shrink-0" />
            <Input
              placeholder="To postcode..."
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <Button 
          onClick={planJourney} 
          disabled={loading || !from || !to}
          className="w-full mb-4"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
          Plan Journey
        </Button>

        {/* Quick Destinations */}
        <div className="mb-4">
          <p className="text-sm text-banc-muted-readable mb-2">Quick destinations:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_DESTINATIONS.map((dest) => (
              <button
                key={dest.postcode}
                onClick={() => planToDestination(dest.postcode)}
                disabled={loading || !from}
                className="text-xs px-3 py-1.5 bg-banc-grey-pale hover:bg-banc-grey/20 rounded-full text-banc-dark-mid transition-colors"
              >
                {dest.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Journey Result */}
        {journey && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-banc-grey/20 pt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-banc-dark">{journey.duration} min</p>
                <p className="text-sm text-banc-muted-readable">
                  {journey.modes.filter((m, i, a) => a.indexOf(m) === i).join(' → ')}
                </p>
              </div>
              {journey.fare && (
                <div className="text-right">
                  <p className="text-xl font-bold text-banc-dark">{journey.fare.total}</p>
                  {journey.fare.zones && (
                    <p className="text-sm text-banc-muted-readable">{journey.fare.zones}</p>
                  )}
                </div>
              )}
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {journey.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-banc-grey-pale rounded-full flex items-center justify-center flex-shrink-0">
                    {getModeIcon(step.mode)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-banc-dark">{step.instruction}</p>
                    <p className="text-xs text-banc-muted-readable">{step.duration} min</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
