"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  Calendar, 
  Clock,
  MapPin,
  MessageSquare,
  Send,
  User,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Agent } from "@/lib/types/property";

interface AgentContactCardProps {
  agent: Agent;
  propertyId: string;
  className?: string;
}

export function AgentContactCard({ 
  agent, 
  propertyId,
  className = "" 
}: AgentContactCardProps) {
  const [activeTab, setActiveTab] = useState<"contact" | "viewing">("contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferredTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        preferredTime: "",
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Agent Info Header */}
      <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <p className="text-sm text-gray-500 mb-4">Listed by</p>
        
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-[#1DBFDD]/20 shadow-sm">
            <Image
              src={agent.image}
              alt={agent.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.title}</p>
            {agent.branch && (
              <p className="text-xs text-gray-400 mt-0.5">{agent.branch.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <a 
            href={`tel:${agent.phone}`}
            className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-[#1DBFDD]/10 hover:text-[#1DBFDD] transition-colors group"
          >
            <Phone className="h-4 w-4" />
            <span className="text-sm font-medium">Call</span>
          </a>
          <a 
            href={`mailto:${agent.email}?subject=Property Enquiry - Ref: ${propertyId}`}
            className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-[#1DBFDD]/10 hover:text-[#1DBFDD] transition-colors group"
          >
            <Mail className="h-4 w-4" />
            <span className="text-sm font-medium">Email</span>
          </a>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 ${
            activeTab === "contact" ? "text-[#1DBFDD]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Message
          {activeTab === "contact" && (
            <motion.div 
              layoutId="agent-tab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1DBFDD]"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("viewing")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 ${
            activeTab === "viewing" ? "text-[#1DBFDD]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Viewing
          {activeTab === "viewing" && (
            <motion.div 
              layoutId="agent-tab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1DBFDD]"
            />
          )}
        </button>
      </div>

      {/* Forms */}
      <div className="p-5">
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Message Sent!</h4>
            <p className="text-sm text-gray-500">
              {agent.name} will be in touch shortly.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="020 7123 4567"
                  className="pl-10"
                />
              </div>
            </div>

            {activeTab === "viewing" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Preferred Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1DBFDD]/20 focus:border-[#1DBFDD]"
                  >
                    <option value="">Select a time...</option>
                    <option value="weekday-morning">Weekday Morning</option>
                    <option value="weekday-afternoon">Weekday Afternoon</option>
                    <option value="weekday-evening">Weekday Evening</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {activeTab === "viewing" ? "Additional Notes" : "Message"}
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={activeTab === "viewing" 
                  ? "Any specific requirements or questions..." 
                  : "I'm interested in this property..."}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white py-5 text-base font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {activeTab === "viewing" ? "Request Viewing" : "Send Message"}
                </span>
              )}
            </Button>
          </form>
        )}
      </div>

      {/* Branch Info */}
      {agent.branch && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">{agent.branch.name}</p>
              <p className="mt-0.5">{agent.branch.address}</p>
              <p className="mt-1 text-xs text-gray-500">{agent.branch.openingHours}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
