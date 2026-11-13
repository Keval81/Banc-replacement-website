"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/select";
import {
  CheckCircle,
  Home,
  User,
  MapPin,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimary,
  actionSecondary,
  choiceChip,
  eyebrow,
  fieldControl,
  fieldHelp,
  fieldLabel,
  fieldTextarea,
  formPanel,
  segmented,
  segmentedOption,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { BANC_CONTACT } from "@/lib/banc-contact";
import { checkValuationStep, describeSubmitError } from "@/lib/lead-form-rules";

import { describeBasis, headlineFor, homeSaleNote, type InstantEstimate } from "@/lib/valuation/present";
import { ConfidenceGauge } from "@/components/valuation/ConfidenceGauge";

type AddressOption = { paon: string; saon: string; label: string };
const NOT_LISTED = "not-listed";

const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;
const monthYear = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

const propertyTypes = [
  "Detached House",
  "Semi-Detached House",
  "Terraced House",
  "Bungalow",
  "Flat / Apartment",
  "Maisonette",
  "Cottage",
  "Other",
];

const bedrooms = ["Studio", "1", "2", "3", "4", "5", "6+"];

const timeframes = [
  "As soon as possible",
  "Within 1 month",
  "Within 3 months",
  "Within 6 months",
  "Just curious",
];

const steps = [
  { id: 1, title: "Address", icon: MapPin },
  { id: 2, title: "Property", icon: Home },
  { id: 3, title: "Contact", icon: User },
  { id: 4, title: "Results", icon: CheckCircle },
];

export default function ValuationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postcode: "",
    propertyType: "",
    bedrooms: "",
    timeframe: "",
    message: "",
    department: "sales" as "sales" | "lettings",
    paon: "",
    saon: "",
    website: "",
  });
  const [consent, setConsent] = useState(false);
  const [majorWork, setMajorWork] = useState<boolean | null>(null);
  const [estimate, setEstimate] = useState<InstantEstimate | null>(null);
  const [addresses, setAddresses] = useState<AddressOption[]>([]);
  const [picked, setPicked] = useState("");

  // A full postcode loads the addresses the register knows there, so the
  // estimate can start from this exact home's own last sale.
  useEffect(() => {
    const compact = formData.postcode.replace(/\s+/g, "").toUpperCase();
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact)) {
      setAddresses([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/valuation/addresses?postcode=${compact}`, { signal: controller.signal });
        const body = (await res.json()) as { addresses?: AddressOption[] };
        setAddresses(res.ok ? (body.addresses ?? []) : []);
      } catch (lookupError) {
        if (!controller.signal.aborted) {
          console.error("[Valuation] address list unavailable:", lookupError);
          setAddresses([]);
        }
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [formData.postcode]);

  const pickAddress = (value: string) => {
    setPicked(value);
    setError(null);
    const choice = value === NOT_LISTED || value === "" ? null : addresses.at(Number(value));
    setFormData((prev) => ({
      ...prev,
      paon: choice?.paon ?? "",
      saon: choice?.saon ?? "",
      address: choice ? choice.label : value === NOT_LISTED ? "" : prev.address,
    }));
  };

  // The landlords' guide links here as /valuation?intent=let. Read once on
  // mount rather than through useSearchParams, which would force a Suspense
  // boundary around a page that is otherwise fine to render statically.
  useEffect(() => {
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent === "let" || intent === "lettings") {
      setFormData((prev) => ({ ...prev, department: "lettings" }));
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };
  const isLettings = formData.department === "lettings";
  const postcodeShown = formData.postcode.trim().toUpperCase();
  const fullAddress = [formData.address.trim().replace(/\s*\n\s*/g, ", "), postcodeShown]
    .filter((part, i, parts) => part && !(i === 1 && parts[0]!.toUpperCase().includes(postcodeShown)))
    .join(", ");

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        if (addresses.length > 0 && picked === "") {
          setError("Please choose your address, or pick “My address isn’t listed”.");
          return false;
        }
        const problem = checkValuationStep("address", formData);
        if (problem) {
          setError(problem);
          return false;
        }
        return true;
      }
      case 2:
        return true; // Property details are optional
      case 3: {
        const problem = checkValuationStep("contact", formData);
        if (problem) {
          setError(problem);
          return false;
        }
        if (!consent) {
          setError("Please confirm you are happy for us to contact you via phone and email.");
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ...(majorWork === null ? {} : { majorWork }) }),
      });

      const data = await response.json();

      if (data.success) {
        setEstimate(data.estimate ?? null);
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(
          describeSubmitError(data, `Something went wrong. Please try again, or call us on ${BANC_CONTACT.displayPhone}.`),
        );
      }
    } catch {
      setError("Failed to submit request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <main>
        <PageBand
          eyebrow="Free valuation"
          title="Request a Free Valuation"
          lede="Discover the true value of your property in 3 simple steps"
        />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
        <div className="max-w-3xl">
          {/* Stepper */}
          <div className="mb-6">
            <p className={eyebrow}>
              Step {currentStep} of {steps.length} · {steps[currentStep - 1]?.title}
            </p>
            <div
              className="mt-3 h-0.5 w-full bg-banc-line"
              role="progressbar"
              aria-label="Valuation request progress"
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-valuenow={currentStep}
            >
              <div
                className="h-full bg-banc-focus transition-[width] duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                role="alert"
                className="mb-6 flex items-center gap-3 rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-red-700"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <div className={formPanel}>
            <AnimatePresence mode="wait">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="font-display text-2xl font-light text-banc-dark">
                      Where is your property?
                    </h2>
                    <p className="mt-2 text-sm text-banc-muted-readable">
                      Enter the address of the property you&apos;d like valued
                    </p>
                  </div>

                  <div className="space-y-5">
                    <fieldset>
                      <legend className={fieldLabel}>I&apos;d like to *</legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {([
                          { value: "sales", label: "Sell", hint: "Instant estimate, then a visit" },
                          { value: "lettings", label: "Let", hint: "Rental appraisal by the lettings team" },
                        ] as const).map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleChange("department", option.value)}
                            aria-pressed={formData.department === option.value}
                            className={`min-h-11 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 ${
                              formData.department === option.value
                                ? "border-banc-focus bg-banc-focus text-white"
                                : "border-banc-line bg-white text-banc-dark-deep hover:border-banc-focus"
                            }`}
                          >
                            <span className="block text-base font-semibold">{option.label}</span>
                            <span
                              className={`mt-0.5 block text-xs ${
                                formData.department === option.value ? "text-white/85" : "text-banc-muted-readable"
                              }`}
                            >
                              {option.hint}
                            </span>
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div>
                      <label htmlFor="postcode" className={fieldLabel}>
                        Postcode *
                      </label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => {
                          handleChange("postcode", e.target.value);
                          setPicked("");
                          setFormData((prev) => ({ ...prev, paon: "", saon: "" }));
                        }}
                        placeholder="EN6 4HU"
                        className={cn(fieldControl, "sm:max-w-xs")}
                        autoComplete="postal-code"
                      />
                    </div>

                    {addresses.length > 0 && (
                      <div>
                        <label htmlFor="address-pick" className={fieldLabel}>
                          Choose your address *
                        </label>
                        <NativeSelect
                          id="address-pick"
                          value={picked}
                          onChange={(e) => pickAddress(e.target.value)}
                          className={cn(fieldControl, "pr-10 hover:border-banc-focus")}
                        >
                          <option value="">Select your address</option>
                          {addresses.map((a, i) => (
                            <option key={`${a.saon}|${a.paon}`} value={String(i)}>
                              {a.label}
                            </option>
                          ))}
                          <option value={NOT_LISTED}>My address isn&apos;t listed</option>
                        </NativeSelect>
                      </div>
                    )}

                    {(addresses.length === 0 || picked === NOT_LISTED) && (
                      <div>
                        <label htmlFor="address" className={fieldLabel}>
                          Property Address *
                        </label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleChange("address", e.target.value)}
                          className={cn(fieldControl, fieldTextarea, "h-auto")}
                          placeholder="123 Station Road, Cuffley, Hertfordshire..."
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Property Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="font-display text-2xl font-light text-banc-dark">
                      Tell us about your property
                    </h2>
                    <p className="mt-2 text-sm text-banc-muted-readable">
                      These details help us provide a more accurate valuation
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className={fieldLabel}>Property Type</label>
                      <NativeSelect
                        value={formData.propertyType}
                        onChange={(e) => handleChange("propertyType", e.target.value)}
                        className={cn(fieldControl, "pr-10 hover:border-banc-focus")}
                      >
                        <option value="">Select type</option>
                        {propertyTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </NativeSelect>
                    </div>

                    <div>
                      <label className={fieldLabel}>Bedrooms</label>
                      <div className="flex flex-wrap gap-2">
                        {bedrooms.map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleChange("bedrooms", num)}
                            aria-pressed={formData.bedrooms === num}
                            className={cn(choiceChip(formData.bedrooms === num), "min-w-11")}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!isLettings && (
                      <fieldset>
                        <legend className="mb-2 block text-sm font-medium leading-relaxed text-banc-dark-deep">
                          Have you extended, converted the loft or fully refurbished since you bought?
                        </legend>
                        <div className={cn(segmented, "sm:max-w-xs")}>
                          {([
                            { value: true, label: "Yes" },
                            { value: false, label: "No" },
                          ] as const).map((option) => (
                            <button
                              key={option.label}
                              type="button"
                              onClick={() => setMajorWork(option.value)}
                              aria-pressed={majorWork === option.value}
                              className={segmentedOption(majorWork === option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        <p className={fieldHelp}>
                          Public records can&apos;t see improvements, so a yes tells the director to look closely.
                        </p>
                      </fieldset>
                    )}

                    <div>
                      <label className={fieldLabel}>
                        {isLettings ? "Looking to let in..." : "Looking to sell in..."}
                      </label>
                      <NativeSelect
                        value={formData.timeframe}
                        onChange={(e) => handleChange("timeframe", e.target.value)}
                        className={cn(fieldControl, "pr-10 hover:border-banc-focus")}
                      >
                        <option value="">Select timeframe</option>
                        {timeframes.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </NativeSelect>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="font-display text-2xl font-light text-banc-dark">
                      Your contact details
                    </h2>
                    <p className="mt-2 text-sm text-banc-muted-readable">
                      We&apos;ll use these to send your valuation report
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
                      <div>
                        <label htmlFor="firstName" className={fieldLabel}>
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleChange("firstName", e.target.value)}
                          placeholder="John"
                          className={fieldControl}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className={fieldLabel}>
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleChange("lastName", e.target.value)}
                          placeholder="Smith"
                          className={fieldControl}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className={fieldLabel}>
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                        className={fieldControl}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className={fieldLabel}>
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder={BANC_CONTACT.displayPhone}
                        className={fieldControl}
                      />
                    </div>

                    {/* Honeypot: hidden from people, filled by bots; the API rejects any value. */}
                    <input
                      id="website"
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute -left-[9999px] h-px w-px opacity-0"
                    />
                    <div>
                      <label htmlFor="message" className={fieldLabel}>
                        Additional Information (Optional)
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        className={cn(fieldControl, fieldTextarea, "h-auto")}
                        placeholder="Anything else we should know..."
                      />
                    </div>

                    <label htmlFor="consent" className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed text-banc-muted-readable">
                      <input
                        id="consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => {
                          setConsent(e.target.checked);
                          setError(null);
                        }}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-banc-line accent-[var(--banc-focus)]"
                      />
                      <span>
                        Please tick this box if you are happy for us to contact you via phone and email. *
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Results */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="mb-6 font-display text-2xl font-light text-banc-dark lg:text-3xl">
                    {isLettings ? "Thank you — we'll call about the rent" : estimate ? "Here's your indicative estimate" : "Thank you!"}
                  </h2>

                  {estimate && !isLettings && (() => {
                    const h = headlineFor(estimate);
                    return (
                      <div className="mb-6 border-y border-banc-dark/15 py-6">
                        <p className={eyebrow}>Instant estimate</p>
                        <p className="mt-2 text-sm font-medium text-banc-dark">{fullAddress}</p>
                        {h.figure ? (
                          <>
                            <p className="mt-2 font-display text-4xl text-banc-dark">{h.figure}</p>
                            <p className="mt-2 text-sm text-banc-muted-readable">Likely range {h.range}</p>
                          </>
                        ) : (
                          <>
                            <p className="mt-2 font-display text-3xl text-banc-dark">{h.range}</p>
                            <p className="mt-2 text-sm text-banc-muted-readable">
                              Public records can&apos;t pin this one down, so a director needs to see it.
                            </p>
                          </>
                        )}
                        <div className="mt-4 border-t border-banc-dark/15 pt-4">
                          <ConfidenceGauge confidence={estimate.confidence} />
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-banc-muted-readable">{describeBasis(estimate)}</p>
                        {estimate.homeLastSale && (
                          <div className="mt-4 flex items-start justify-between gap-3 border-t border-banc-dark/15 pt-3 text-sm text-banc-dark">
                            <span className="font-medium">{homeSaleNote(estimate.homeLastSale)}</span>
                            <span className="tabular-nums">{gbp(estimate.homeLastSale.price)}</span>
                          </div>
                        )}
                        {estimate.comparables.length > 0 && (
                          <div className="mt-4 border-t border-banc-dark/15 pt-3">
                            <p className={eyebrow}>Similar sales nearby</p>
                            <ul className="mt-2 space-y-1.5 text-sm">
                              {estimate.comparables.slice(0, 4).map((c) => (
                                <li key={`${c.address}|${c.date}`} className="flex items-start justify-between gap-3 text-banc-dark">
                                  <span className="min-w-0">
                                    <span className="block">{c.address.toLowerCase().replace(/\b[a-z]/g, (l) => l.toUpperCase())}</span>
                                    <span className="block text-xs text-banc-muted-readable">Sold {monthYear(c.date)}</span>
                                  </span>
                                  <span className="tabular-nums">{gbp(c.price)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="mt-3 text-xs leading-relaxed text-banc-muted-readable">
                          Sold prices as registered. This is an estimate from public records, not a valuation of your home — one of the directors will call to give you an accurate figure.
                        </p>
                      </div>
                    );
                  })()}

                  <p className="mb-2 max-w-xl text-banc-muted-readable">
                    Your {isLettings ? "rental appraisal" : "valuation"} request for <span className="font-medium text-banc-dark">{fullAddress}</span> has been received.
                  </p>
                  <p className="mb-6 max-w-xl text-banc-muted-readable">
                    {isLettings
                      ? "One of the directors will call you within one working day to talk through what it could let for."
                      : estimate
                        ? "One of the directors will call you within one working day with an accurate figure."
                        : "We couldn't reach enough recent sales for an instant figure. One of the directors will call you within one working day to arrange your free, no-obligation valuation."}
                  </p>

                  <div className="mb-8 border-t border-banc-dark/15 pt-6">
                    <h3 className="mb-3 text-sm font-semibold text-banc-dark">What happens next?</h3>
                    <ul className="space-y-2">
                      {(isLettings
                        ? [
                            "The lettings team review your property details",
                            "A director calls to book a visit",
                            "We give you a rent figure and a plan for letting it",
                            "You decide — no obligation",
                          ]
                        : [
                            "We review your property details",
                            "A local expert calls to book a visit",
                            "We provide a detailed market appraisal",
                            "You decide — no obligation",
                          ]).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-banc-muted-readable">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-banc-focus" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => (window.location.href = "/")}
                    className={cn(actionPrimary, "shadow-none")}
                  >
                    Return to Homepage
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-banc-dark/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep} className={actionSecondary}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                <Button
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className={cn(actionPrimary, "shadow-none")}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : currentStep === 3 ? (
                    "Submit Request"
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Privacy note */}
          {currentStep < 4 && (
            <p className="mt-4 text-sm text-banc-muted-readable">
              By submitting, you agree to our{" "}
              <a href="/privacy" className="text-banc-focus underline underline-offset-4 hover:text-banc-focus-hover">Privacy Policy</a>.
              We never share your details with third parties.
            </p>
          )}
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
