import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertCircle,
  Clock,
  Mail,
  Phone,
  FileText,
  ArrowRight,
  Shield,
  Scale,
  Check,
  MessageSquare,
  Building2,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Complaints Procedure | Banc Property Group",
  description: "Our complaints procedure. We take all complaints seriously and are committed to resolving issues promptly and fairly.",
  keywords: "complaints procedure, estate agent complaints, property ombudsman, banc complaints",
};

// Complaints process steps
const complaintSteps = [
  {
    step: "1",
    title: "Informal Resolution",
    description: "In the first instance, please speak to your dedicated negotiator or property manager. Many issues can be resolved quickly at this stage.",
    timeframe: "Within 24 hours",
    icon: MessageSquare
  },
  {
    step: "2",
    title: "Formal Complaint",
    description: "If informal resolution doesn't work, you can make a formal complaint in writing to our Office Manager.",
    timeframe: "Acknowledged within 3 working days",
    icon: FileText
  },
  {
    step: "3",
    title: "Investigation",
    description: "We will thoroughly investigate your complaint, speaking to all relevant parties and reviewing all documentation.",
    timeframe: "Within 15 working days",
    icon: Clock
  },
  {
    step: "4",
    title: "Final Response",
    description: "You will receive our final written response, including details of our decision and any actions we will take.",
    timeframe: "Within 8 weeks of receipt",
    icon: Check
  }
];

// Redress information
const redressSchemes = [
  {
    name: "The Property Ombudsman",
    description: "Independent redress scheme for consumers",
    website: "www.tpos.co.uk",
    phone: "01722 333306",
    email: "admin@tpos.co.uk"
  },
  {
    name: "Propertymark",
    description: "Professional body for estate agents",
    website: "www.propertymark.co.uk",
    phone: "01926 417 796",
    email: "info@propertymark.co.uk"
  }
];

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-[#1A1917] py-24 lg:py-32 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/80 via-[#1A1917]/60 to-[#1A1917]/40" />
        </div>
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4AC8E8] rounded-full blur-[128px]" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Shield className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-white/80">Our Commitment</span>
            </div>
            
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Complaints Procedure
            </h1>
            <p className="mt-6 text-xl text-white/70 leading-relaxed">
              At Banc Property Group, we pride ourselves on delivering excellent service. 
              However, if something goes wrong, we want to know about it so we can put it right.
            </p>
          </div>
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
                <Scale className="h-4 w-4 text-[#4AC8E8]" />
                <span className="text-sm font-medium text-[#1A9BBF]">Our Promise</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-semibold text-[#1A1917] mb-6">
                We're Committed to Fairness
              </h2>
              
              <p className="text-lg text-[#8A8880] mb-8">
                We take all complaints seriously and are committed to dealing with them promptly, 
                fairly, and confidentially. Our complaints procedure is designed to be simple 
                and straightforward.
              </p>
              
              <div className="space-y-4">
                {[
                  "We will acknowledge your complaint within 3 working days",
                  "We will treat your complaint confidentially",
                  "We will investigate thoroughly and impartially",
                  "We will keep you informed throughout the process",
                  "We aim to resolve complaints within 8 weeks",
                  "If you're not satisfied, you can escalate to The Property Ombudsman"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-[#4AC8E8]" />
                    </div>
                    <span className="text-[#3D3B37]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Important notice box */}
            <div className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1917]">Before You Complain</h3>
              </div>
              
              <p className="text-[#8A8880] mb-6">
                If you have an issue, we recommend trying to resolve it informally first. 
                Often, a quick conversation can sort things out without needing a formal complaint.
              </p>
              
              <div className="bg-[#F4F3F1] rounded-xl p-6">
                <h4 className="font-semibold text-[#1A1917] mb-3">Try These First:</h4>
                <ul className="space-y-2 text-[#8A8880]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4AC8E8]">1.</span>
                    Speak to your dedicated negotiator
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4AC8E8]">2.</span>
                    Call our office on 01707 877781
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4AC8E8]">3.</span>
                    Email your property manager directly
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complaints Process Section */}
      <section className="py-20 lg:py-28 bg-[#1A1917]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Clock className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-white/80">The Process</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              How to Make a Complaint
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Our four-step process is designed to resolve your complaint as quickly as possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complaintSteps.map((step) => (
              <div key={step.step} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#4AC8E8]/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <span className="text-4xl font-bold text-white/10">{step.step}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm mb-4">{step.description}</p>
                
                <div className="flex items-center gap-2 text-[#4AC8E8] text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{step.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Complain Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact methods */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
                <Mail className="h-4 w-4 text-[#4AC8E8]" />
                <span className="text-sm font-medium text-[#1A9BBF]">Contact Us</span>
              </div>
              
              <h2 className="text-3xl font-semibold text-[#1A1917] mb-6">
                How to Contact Us
              </h2>
              
              <p className="text-[#8A8880] mb-8">
                You can make a complaint using any of the following methods. Please provide 
                as much detail as possible to help us investigate effectively.
              </p>
              
              <div className="space-y-4">
                <a href="mailto:complaints@bancproperty.com" className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#E0DFDC]/30 hover:border-[#4AC8E8]/50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1917] group-hover:text-[#4AC8E8] transition-colors">Email</h3>
                    <p className="text-sm text-[#8A8880]">complaints@bancproperty.com</p>
                  </div>
                </a>
                
                <a href="tel:01707877781" className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#E0DFDC]/30 hover:border-[#4AC8E8]/50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1917] group-hover:text-[#4AC8E8] transition-colors">Phone</h3>
                    <p className="text-sm text-[#8A8880]">01707 877781</p>
                  </div>
                </a>
                
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#E0DFDC]/30">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1917]">Post</h3>
                    <p className="text-sm text-[#8A8880]">
                      Complaints Department<br />
                      Banc Property Group<br />
                      1 Station Road<br />
                      Cuffley, EN6 4HU
                    </p>
                  </div>
                </div>
              </div>
              
              {/* What to include */}
              <div className="mt-8 bg-[#F4F3F1] rounded-xl p-6">
                <h4 className="font-semibold text-[#1A1917] mb-3">Please Include:</h4>
                <ul className="space-y-2 text-sm text-[#8A8880]">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#4AC8E8] mt-0.5" />
                    Your full name and contact details
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#4AC8E8] mt-0.5" />
                    Property address (if applicable)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#4AC8E8] mt-0.5" />
                    Details of what went wrong
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#4AC8E8] mt-0.5" />
                    What you'd like us to do to put it right
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#4AC8E8] mt-0.5" />
                    Any relevant reference numbers
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Complaint form */}
            <div className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30 shadow-lg">
              <h3 className="text-xl font-semibold text-[#1A1917] mb-2">Make a Complaint</h3>
              <p className="text-sm text-[#8A8880] mb-6">
                Use this form to submit your complaint. We'll respond within 3 working days.
              </p>
              
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D3B37] mb-2">First Name *</label>
                    <Input 
                      placeholder="John"
                      className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D3B37] mb-2">Last Name *</label>
                    <Input 
                      placeholder="Smith"
                      className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D3B37] mb-2">Email Address *</label>
                    <Input 
                      type="email"
                      placeholder="john@example.com"
                      className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D3B37] mb-2">Phone Number</label>
                    <Input 
                      type="tel"
                      placeholder="01707 877781"
                      className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3D3B37] mb-2">Property Address (if applicable)</label>
                  <Input 
                    placeholder="1 Station Road, Cuffley, EN6 4HU"
                    className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3D3B37] mb-2">Nature of Complaint *</label>
                  <div className="relative">
                    <select 
                      className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-2 focus:ring-[#4AC8E8]/20 bg-white text-[#3D3B37] appearance-none cursor-pointer transition-colors hover:border-[#4AC8E8]/50"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="service">Quality of Service</option>
                      <option value="communication">Communication Issues</option>
                      <option value="fees">Fees or Charges</option>
                      <option value="maintenance">Maintenance/Repairs</option>
                      <option value="staff">Staff Conduct</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8880] pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3D3B37] mb-2">Details of Complaint *</label>
                  <Textarea 
                    placeholder="Please provide as much detail as possible about your complaint..."
                    rows={5}
                    className="border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20 resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3D3B37] mb-2">What would you like us to do?</label>
                  <Textarea 
                    placeholder="How would you like us to resolve this matter?"
                    rows={3}
                    className="border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20 resize-none"
                  />
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-[#F4F3F1] rounded-xl">
                  <Checkbox 
                    id="privacy-complaint"
                    required
                    className="mt-0.5 border-[#E0DFDC] data-[state=checked]:bg-[#4AC8E8] data-[state=checked]:border-[#4AC8E8]"
                  />
                  <label htmlFor="privacy-complaint" className="text-sm text-[#8A8880] leading-relaxed">
                    I understand that my personal information will be used to investigate this complaint 
                    in accordance with our <Link href="/privacy" className="text-[#4AC8E8] hover:underline">Privacy Policy</Link>.
                  </label>
                </div>
                
                <Button type="submit" className="w-full h-12 bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white font-semibold">
                  Submit Complaint
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Redress Section */}
      <section className="py-20 lg:py-28 bg-[#F4F3F1]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
              <Scale className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-[#1A9BBF]">Independent Redress</span>
            </div>
            <h2 className="text-3xl font-semibold text-[#1A1917]">
              Independent Redress
            </h2>
            <p className="mt-4 text-lg text-[#8A8880]">
              If you're not satisfied with our final response, you can escalate your complaint 
              to an independent redress scheme.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {redressSchemes.map((scheme) => (
              <div key={scheme.name} className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30 shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center mb-4">
                  <Scale className="h-7 w-7 text-[#4AC8E8]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1917] mb-2">{scheme.name}</h3>
                <p className="text-[#8A8880] mb-6">{scheme.description}</p>
                
                <div className="space-y-3 text-sm">
                  <a 
                    href={`https://${scheme.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#4AC8E8] hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    {scheme.website}
                  </a>
                  <a href={`tel:${scheme.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-[#3D3B37]">
                    <Phone className="h-4 w-4 text-[#4AC8E8]" />
                    {scheme.phone}
                  </a>
                  <a href={`mailto:${scheme.email}`} className="flex items-center gap-2 text-[#3D3B37]">
                    <Mail className="h-4 w-4 text-[#4AC8E8]" />
                    {scheme.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Important Note</h4>
                <p className="text-sm text-amber-700">
                  You must wait until you receive our final written response (or 8 weeks from 
                  the date of your complaint if we haven't responded) before escalating to 
                  The Property Ombudsman. Their service is free for consumers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Info Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#E0DFDC]/30">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-semibold text-[#1A1917] mb-4">
                  Regulatory Information
                </h2>
                <p className="text-[#8A8880] mb-6">
                  Banc Property Group is committed to maintaining the highest professional standards. 
                  We are members of professional bodies and subject to regulatory oversight.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#4AC8E8] mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1A1917]">Member of The Property Ombudsman</p>
                      <p className="text-sm text-[#8A8880]">Redress scheme membership</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#4AC8E8] mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1A1917]">Propertymark Member</p>
                      <p className="text-sm text-[#8A8880]">Professional body membership</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#4AC8E8] mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1A1917]">Client Money Protection</p>
                      <p className="text-sm text-[#8A8880]">All client funds fully protected</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F4F3F1] rounded-2xl p-6">
                <h3 className="font-semibold text-[#1A1917] mb-4">Our Registration Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#E0DFDC]/30">
                    <span className="text-[#8A8880]">Company Name</span>
                    <span className="font-medium text-[#1A1917]">Banc Property Group Ltd</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E0DFDC]/30">
                    <span className="text-[#8A8880]">Registered Address</span>
                    <span className="font-medium text-[#1A1917]">1 Station Road, Cuffley, EN6 4HU</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E0DFDC]/30">
                    <span className="text-[#8A8880]">Phone</span>
                    <span className="font-medium text-[#1A1917]">01707 877781</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#8A8880]">Email</span>
                    <span className="font-medium text-[#1A1917]">info@bancproperty.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
