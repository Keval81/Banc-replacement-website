"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  School, 
  MapPin, 
  Footprints, 
  Star, 
  GraduationCap,
  Loader2,
  AlertCircle,
  ExternalLink,
  Users,
  Calendar
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { School as SchoolType } from "@/lib/types/data";

interface SchoolsNearbyProps {
  postcode?: string;
  className?: string;
  showFilter?: boolean;
  maxSchools?: number;
}

const OFSTED_COLORS: Record<string, string> = {
  'Outstanding': 'bg-green-100 text-green-700 border-green-200',
  'Good': 'bg-blue-100 text-blue-700 border-blue-200',
  'Requires Improvement': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Inadequate': 'bg-red-100 text-red-700 border-red-200',
  'Not Inspected': 'bg-gray-100 text-gray-700 border-gray-200',
};

const TYPE_LABELS: Record<string, string> = {
  'primary': 'Primary',
  'secondary': 'Secondary',
  'independent': 'Independent',
  'academy': 'Academy',
  'grammar': 'Grammar',
};

export function SchoolsNearby({ 
  postcode: initialPostcode, 
  className = "",
  showFilter = true,
  maxSchools = 10
}: SchoolsNearbyProps) {
  const [postcode, setPostcode] = useState(initialPostcode || "");
  const [phase, setPhase] = useState<'primary' | 'secondary' | undefined>(undefined);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  const fetchSchools = async () => {
    if (!postcode) return;
    
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/schools/nearby', window.location.origin);
      url.searchParams.append('postcode', postcode);
      if (phase) url.searchParams.append('phase', phase);
      url.searchParams.append('limit', maxSchools.toString());

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setSchools(data.schools || []);
    } catch (err) {
      setError('Unable to load school data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPostcode) {
      fetchSchools();
    }
  }, [initialPostcode]);

  useEffect(() => {
    if (postcode && !initialPostcode) {
      fetchSchools();
    }
  }, [phase]);

  const filteredSchools = phase 
    ? schools.filter(s => s.phase === phase)
    : schools;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
            <School className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Nearby Schools</h3>
            <p className="text-sm text-gray-600">DfE and Ofsted data</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilter && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2">
            {!initialPostcode && (
              <input
                type="text"
                placeholder="Enter postcode..."
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                onBlur={fetchSchools}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
            )}
            <div className="flex gap-2">
              <Button
                variant={phase === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhase(undefined)}
              >
                All
              </Button>
              <Button
                variant={phase === 'primary' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhase('primary')}
              >
                Primary
              </Button>
              <Button
                variant={phase === 'secondary' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhase('secondary')}
              >
                Secondary
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schools List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <School className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No schools found</p>
            {!initialPostcode && <p className="text-sm mt-1">Enter a postcode to search</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSchools.map((school, index) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setExpandedSchool(expandedSchool === school.id ? null : school.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{school.name}</h4>
                      <Badge variant="outline" className={OFSTED_COLORS[school.ofstedRating]}>
                        {school.ofstedRating}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{school.address}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {TYPE_LABELS[school.type] || school.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {school.distance} miles
                      </span>
                      <span className="flex items-center gap-1">
                        <Footprints className="h-3.5 w-3.5" />
                        {school.walkingTime} min walk
                      </span>
                      {school.totalPupils && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {school.totalPupils} pupils
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedSchool === school.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Age Range</p>
                        <p className="font-medium">{school.ageRange.min} - {school.ageRange.max} years</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Gender</p>
                        <p className="font-medium capitalize">{school.gender}</p>
                      </div>
                      {school.religion && (
                        <div>
                          <p className="text-gray-500">Religion</p>
                          <p className="font-medium">{school.religion}</p>
                        </div>
                      )}
                      {school.hasSixthForm && (
                        <div>
                          <p className="text-gray-500">Sixth Form</p>
                          <p className="font-medium">Yes</p>
                        </div>
                      )}
                      {school.ofstedDate && (
                        <div>
                          <p className="text-gray-500">Last Inspection</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(school.ofstedDate).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      )}
                    </div>
                    {school.ofstedReportUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        asChild
                      >
                        <a href={school.ofstedReportUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          View Ofsted Report
                        </a>
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {schools.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
          Data from Department for Education and Ofsted
        </div>
      )}
    </div>
  );
}
