"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Clock,
  Building2,
  Plus,
  X,
  Loader2,
  Train,
  Bus,
  Footprints,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCommuteTimes } from "@/lib/api/transport";

interface Destination {
  name: string;
  postcode: string;
  duration?: number;
  modes?: string[];
}

interface CommuteTimeCalculatorProps {
  propertyPostcode?: string;
  className?: string;
}

const PRESET_DESTINATIONS = [
  { name: 'London Bridge', postcode: 'SE1 9SG' },
  { name: 'Canary Wharf', postcode: 'E14 5AB' },
  { name: 'City of London', postcode: 'EC2N 2DB' },
  { name: 'West End', postcode: 'W1D 7PR' },
];

export function CommuteTimeCalculator({ 
  propertyPostcode,
  className = "" 
}: CommuteTimeCalculatorProps) {
  const [postcode, setPostcode] = useState(propertyPostcode || "");
  const [destinations, setDestinations] = useState<Destination[]>(PRESET_DESTINATIONS);
  const [loading, setLoading] = useState(false);
  const [newDestName, setNewDestName] = useState("");
  const [newDestPostcode, setNewDestPostcode] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const calculateTimes = async () => {
    if (!postcode) return;
    
    setLoading(true);
    try {
      const postcodes = destinations.map(d => d.postcode);
      const results = await getCommuteTimes(postcode, postcodes);
      
      setDestinations(prev => prev.map((dest, index) => ({
        ...dest,
        duration: results[index]?.duration || 0,
        modes: results[index]?.modes || [],
      })));
    } catch (error) {
      console.error('Error calculating commute times:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyPostcode) {
      calculateTimes();
    }
  }, [propertyPostcode]);

  const addDestination = () => {
    if (newDestName && newDestPostcode) {
      setDestinations([...destinations, { name: newDestName, postcode: newDestPostcode }]);
      setNewDestName("");
      setNewDestPostcode("");
      setShowAddForm(false);
    }
  };

  const removeDestination = (index: number) => {
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'tube':
      case 'overground':
      case 'dlr':
        return <Train className="h-3 w-3" />;
      case 'bus':
        return <Bus className="h-3 w-3" />;
      case 'walking':
        return <Footprints className="h-3 w-3" />;
      case 'driving':
        return <Car className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-banc-grey/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-banc-grey/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-banc-dark">Commute Calculator</h3>
            <p className="text-sm text-banc-muted-readable">Travel times to key destinations</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Property Postcode Input */}
        {!propertyPostcode && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-banc-dark-mid mb-1">
              Property Postcode
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. SW1A 1AA"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={calculateTimes} 
                disabled={loading || !postcode}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calculate'}
              </Button>
            </div>
          </div>
        )}

        {/* Destinations List */}
        <div className="space-y-2 mb-4">
          {destinations.map((dest, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-banc-grey-pale rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-banc-muted-readable" />
                <div>
                  <p className="font-medium text-banc-dark">{dest.name}</p>
                  <p className="text-xs text-banc-muted-readable">{dest.postcode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {dest.duration !== undefined && (
                  <div className="text-right">
                    <p className="font-bold text-banc-dark">{dest.duration} min</p>
                    {dest.modes && dest.modes.length > 0 && (
                      <div className="flex items-center gap-1 justify-end">
                        {dest.modes.filter((m, i, a) => a.indexOf(m) === i).slice(0, 3).map((mode, i) => (
                          <span key={i} className="text-banc-muted-readable">
                            {getModeIcon(mode)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => removeDestination(index)}
                  className="text-banc-muted-readable hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Destination */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add destination
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 p-3 bg-blue-50 rounded-lg"
          >
            <Input
              placeholder="Destination name"
              value={newDestName}
              onChange={(e) => setNewDestName(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Postcode"
              value={newDestPostcode}
              onChange={(e) => setNewDestPostcode(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addDestination} className="flex-1">
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
