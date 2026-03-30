"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  School, 
  MapPin, 
  Footprints, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertCircle,
  Info,
  ArrowRight,
  GraduationCap,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { School as SchoolType, CatchmentCheckResult } from "@/lib/types/data";

const LIKELIHOOD_COLORS: Record<string, string> = {
  'high': 'bg-green-100 text-green-700 border-green-200',
  'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'low': 'bg-red-100 text-red-700 border-red-200',
  'unknown': 'bg-gray-100 text-gray-700 border-gray-200',
};

const LIKELIHOOD_LABELS: Record<string, string> = {
  'high': 'High likelihood',
  'medium': 'Medium likelihood',
  'low': 'Low likelihood',
  'unknown': 'Unknown',
};

const OFSTED_COLORS: Record<string, string> = {
  'Outstanding': 'bg-green-100 text-green-700',
  'Good': 'bg-blue-100 text-blue-700',
  'Requires Improvement': 'bg-yellow-100 text-yellow-700',
  'Inadequate': 'bg-red-100 text-red-700',
  'Not Inspected': 'bg-gray-100 text-gray-700',
};

export default function CatchmentCheckerPage() {
  const [postcode, setPostcode] = useState("");
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [result, setResult] = useState<CatchmentCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'postcode' | 'school' | 'result'>('postcode');

  const fetchSchools = async () => {
    if (!postcode) return;
    
    setLoadingSchools(true);
    setError(null);

    try {
      const url = new URL('/api/schools/nearby', window.location.origin);
      url.searchParams.append('postcode', postcode);
      url.searchParams.append('maxDistance', '5');
      url.searchParams.append('limit', '50');

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch schools');
      
      const data = await response.json();
      setSchools(data.schools || []);
      setStep('school');
    } catch (err) {
      setError('Unable to load schools. Please try again.');
    } finally {
      setLoadingSchools(false);
    }
  };

  const checkCatchment = async (school: SchoolType) => {
    setSelectedSchool(school);
    setLoading(true);
    setError(null);

    try {
      // Simulate API call with calculated result
      // In production, this would call a real catchment API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result: CatchmentCheckResult = {
        school,
        distance: school.distance,
        walkingTime: school.walkingTime,
        inCatchment: school.distance < 1.5,
        lastYearAdmissionDistance: 1.2,
        likelihood: school.distance < 1.0 ? 'high' : school.distance < 2.0 ? 'medium' : 'low',
      };

      setResult(result);
      setStep('result');
    } catch (err) {
      setError('Unable to check catchment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('postcode');
    setSelectedSchool(null);
    setResult(null);
    setSchools([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">School Catchment Checker</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check if a property falls within a school's catchment area and see admission likelihood.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'postcode' ? 'text-[#4AC8E8]' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'postcode' ? 'bg-[#4AC8E8] text-white' : 'bg-green-100'}`}>
                {step === 'postcode' ? '1' : <CheckCircle className="h-5 w-5" />}
              </div>
              <span className="text-sm font-medium hidden sm:block">Enter Postcode</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${step === 'school' ? 'text-[#4AC8E8]' : step === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'school' ? 'bg-[#4AC8E8] text-white' : step === 'result' ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                {step === 'result' ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <span className="text-sm font-medium hidden sm:block">Select School</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${step === 'result' ? 'text-[#4AC8E8]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'result' ? 'bg-[#4AC8E8] text-white' : 'bg-gray-100'}`}>
                3
              </div>
              <span className="text-sm font-medium hidden sm:block">View Result</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Postcode Input */}
            {step === 'postcode' && (
              <motion.div
                key="postcode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                <div className="max-w-md mx-auto text-center">
                  <div className="w-16 h-16 bg-[#4AC8E8] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="h-8 w-8 text-[#4AC8E8]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter a Postcode</h2>
                  <p className="text-gray-600 mb-6">We'll find schools near this location</p>
                  
                  <div className="flex gap-3">
                    <Input
                      placeholder="e.g. SW1A 1AA"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="flex-1 text-center text-lg"
                      onKeyDown={(e) => e.key === 'Enter' && fetchSchools()}
                    />
                    <Button 
                      onClick={fetchSchools} 
                      disabled={!postcode || loadingSchools}
                      className="bg-[#4AC8E8] hover:bg-[#4AC8E8]/90"
                    >
                      {loadingSchools ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: School Selection */}
            {step === 'school' && (
              <motion.div
                key="school"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Select a School</h2>
                    <p className="text-gray-600">Found {schools.length} schools near {postcode}</p>
                  </div>
                  <Button variant="outline" onClick={reset} size="sm">
                    Change Postcode
                  </Button>
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {schools.map((school, index) => (
                    <motion.button
                      key={school.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => checkCatchment(school)}
                      disabled={loading}
                      className="flex items-start gap-4 p-4 text-left border border-gray-200 rounded-lg hover:border-[#4AC8E8] hover:bg-blue-50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <School className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{school.name}</h3>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${OFSTED_COLORS[school.ofstedRating]}`}>
                            {school.ofstedRating}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{school.address}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {school.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {school.distance} miles
                          </span>
                          <span className="flex items-center gap-1">
                            <Footprints className="h-3.5 w-3.5" />
                            {school.walkingTime} min walk
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Result */}
            {step === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8"
              >
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.inCatchment ? 'bg-green-100' : 'bg-red-100'}`}>
                    {result.inCatchment ? (
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    ) : (
                      <XCircle className="h-10 w-10 text-red-600" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {result.inCatchment ? 'In Catchment Area' : 'Outside Catchment Area'}
                  </h2>
                  <p className="text-gray-600">
                    {result.school.name}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Distance Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Distance
                        </span>
                        <span className="font-semibold">{result.distance} miles</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Footprints className="h-4 w-4" />
                          Walking Time
                        </span>
                        <span className="font-semibold">{result.walkingTime} minutes</span>
                      </div>
                      {result.lastYearAdmissionDistance && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Last Year's Cutoff
                          </span>
                          <span className="font-semibold">{result.lastYearAdmissionDistance} miles</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Admission Likelihood</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${LIKELIHOOD_COLORS[result.likelihood]}`}>
                          {LIKELIHOOD_LABELS[result.likelihood]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Based on distance from school and historical admission data.
                        Actual admission depends on availability and catchment criteria.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setStep('school')}>
                    Check Another School
                  </Button>
                  <Button onClick={reset} className="bg-[#4AC8E8] hover:bg-[#4AC8E8]/90">
                    Start Over
                  </Button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                  Disclaimer: Catchment areas can change year to year. Always check with the school or local authority for the most up-to-date information.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
