"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Train, 
  MapPin, 
  Footprints, 
  Clock,
  Loader2,
  AlertCircle,
  Navigation,
  ArrowRight,
  TrainFront,
  Bus,
  TramFront,
  Waves,
  Accessibility
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransportStation, JourneyResult } from "@/lib/types/data";

interface NearestStationsProps {
  postcode?: string;
  destination?: string;
  className?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'tube': <TrainFront className="h-4 w-4" />,
  'rail': <Train className="h-4 w-4" />,
  'overground': <TrainFront className="h-4 w-4" />,
  'dlr': <TrainFront className="h-4 w-4" />,
  'bus': <Bus className="h-4 w-4" />,
  'tram': <TramFront className="h-4 w-4" />,
  'river': <Waves className="h-4 w-4" />,
};

const LINE_COLORS: Record<string, string> = {
  'Bakerloo': 'bg-amber-600',
  'Central': 'bg-red-600',
  'Circle': 'bg-yellow-500',
  'District': 'bg-green-600',
  'Hammersmith \& City': 'bg-pink-400',
  'Jubilee': 'bg-banc-grey-pale0',
  'Metropolitan': 'bg-purple-600',
  'Northern': 'bg-black',
  'Piccadilly': 'bg-blue-800',
  'Victoria': 'bg-sky-500',
  'Waterloo \& City': 'bg-teal-500',
  'Overground': 'bg-orange-500',
  'DLR': 'bg-teal-400',
  'Elizabeth': 'bg-purple-700',
};

export function NearestStations({ 
  postcode: initialPostcode, 
  destination,
  className = "" 
}: NearestStationsProps) {
  const [postcode, setPostcode] = useState(initialPostcode || "");
  const [stations, setStations] = useState<TransportStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStation, setExpandedStation] = useState<string | null>(null);
  const [journey, setJourney] = useState<JourneyResult | null>(null);
  const [planningJourney, setPlanningJourney] = useState(false);

  const fetchStations = async () => {
    if (!postcode) return;
    
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/transport/stations', window.location.origin);
      url.searchParams.append('postcode', postcode);
      url.searchParams.append('limit', '10');

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setStations(data.stations || []);
    } catch (err) {
      setError('Unable to load transport data');
    } finally {
      setLoading(false);
    }
  };

  const planJourney = async (toPostcode: string) => {
    if (!postcode) return;
    
    setPlanningJourney(true);
    try {
      const url = new URL('/api/transport/journey', window.location.origin);
      url.searchParams.append('from', postcode);
      url.searchParams.append('to', toPostcode);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to plan journey');
      
      const data = await response.json();
      setJourney(data);
    } catch (err) {
      console.error('Error planning journey:', err);
    } finally {
      setPlanningJourney(false);
    }
  };

  useEffect(() => {
    if (initialPostcode) {
      fetchStations();
    }
  }, [initialPostcode]);

  useEffect(() => {
    if (destination && postcode) {
      planJourney(destination);
    }
  }, [destination, postcode]);

  return (
    <div className={`bg-white rounded-lg border border-banc-grey/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-banc-grey/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
            <Train className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-banc-dark">Transport Links</h3>
            <p className="text-sm text-banc-grey">Nearby stations & travel times</p>
          </div>
        </div>
      </div>

      {/* Search */}
      {!initialPostcode && (
        <div className="p-4 border-b border-banc-grey/20">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter postcode..."
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <Button onClick={fetchStations} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
        </div>
      )}

      {/* Journey Result */}
      {journey && !planningJourney && (
        <div className="p-4 bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800">Journey to {journey.destination.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-green-900">{journey.duration} min</span>
                <span className="text-sm text-green-700">
                  {journey.modes.filter((m: string, i: number, a: string[]) => a.indexOf(m) === i).join(' → ')}
                </span>
              </div>
            </div>
            {journey.fare && (
              <div className="text-right">
                <p className="text-lg font-bold text-green-900">{journey.fare.total}</p>
                {journey.fare.zones && (
                  <p className="text-xs text-green-700">{journey.fare.zones}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stations List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-banc-grey" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : stations.length === 0 ? (
          <div className="text-center py-12 text-banc-grey">
            <Train className="h-12 w-12 mx-auto mb-3 text-banc-grey" />
            <p>No stations found</p>
            {!initialPostcode && <p className="text-sm mt-1">Enter a postcode to search</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stations.map((station, index) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-5 py-4 hover:bg-banc-grey-pale transition-colors cursor-pointer"
                onClick={() => setExpandedStation(expandedStation === station.id ? null : station.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-banc-grey">
                        {TYPE_ICONS[station.type] || <Train className="h-4 w-4" />}
                      </div>
                      <h4 className="font-medium text-banc-dark">{station.name}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-banc-grey">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {station.distance} miles
                      </span>
                      <span className="flex items-center gap-1">
                        <Footprints className="h-3.5 w-3.5" />
                        {station.walkingTime} min walk
                      </span>
                      {station.zone && (
                        <Badge variant="secondary" className="text-xs">
                          Zone {station.zone}
                        </Badge>
                      )}
                    </div>
                    {/* Lines */}
                    {station.lines.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {station.lines.slice(0, 4).map((line) => (
                          <span
                            key={line}
                            className={`text-xs px-2 py-0.5 rounded text-white ${
                              LINE_COLORS[line] || 'bg-banc-grey-pale0'
                            }`}
                          >
                            {line}
                          </span>
                        ))}
                        {station.lines.length > 4 && (
                          <span className="text-xs text-banc-grey px-1">
                            +{station.lines.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedStation === station.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-banc-grey/20"
                  >
                    <div className="space-y-2">
                      {station.lines.length > 0 && (
                        <div>
                          <p className="text-xs text-banc-grey mb-1">All Lines</p>
                          <div className="flex flex-wrap gap-1">
                            {station.lines.map((line) => (
                              <span
                                key={line}
                                className={`text-xs px-2 py-0.5 rounded text-white ${
                                  LINE_COLORS[line] || 'bg-banc-grey-pale0'
                                }`}
                              >
                                {line}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {destination && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            planJourney(destination);
                          }}
                          disabled={planningJourney}
                        >
                          <Navigation className="h-3.5 w-3.5 mr-1.5" />
                          Plan Journey
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {stations.length > 0 && (
        <div className="px-5 py-3 bg-banc-grey-pale border-t border-banc-grey/20 text-xs text-banc-grey text-center">
          Data from TfL and National Rail Enquiries
        </div>
      )}
    </div>
  );
}
