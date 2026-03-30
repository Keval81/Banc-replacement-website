'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Mail, Loader2, Home, TrendingUp, FileText, Tag } from 'lucide-react';

export default function NewsletterSignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [preferences, setPreferences] = useState({
    newProperties: true,
    marketUpdates: true,
    blogPosts: false,
    priceDrops: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preferences,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-banc-grey-pale flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-banc-dark mb-3">
            You&apos;re Subscribed!
          </h1>
          <p className="text-banc-grey mb-6">
            Thank you for subscribing to our newsletter. You&apos;ll receive property updates and market insights at {formData.email}.
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full">
            Back to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-banc-grey-pale">
      {/* Hero */}
      <div className="bg-[#1a4d5c] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Mail className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h1 className="text-4xl font-bold mb-4">
            Stay Informed with Property Updates
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get the latest properties, market insights, and exclusive listings delivered straight to your inbox.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Benefits */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-banc-dark">What You&apos;ll Receive</h2>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1a4d5c]/10 rounded-lg flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5 text-[#1a4d5c]" />
                </div>
                <div>
                  <h3 className="font-medium text-banc-dark">New Property Alerts</h3>
                  <p className="text-sm text-banc-grey">Be the first to know when properties matching your criteria come on the market.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1a4d5c]/10 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#1a4d5c]" />
                </div>
                <div>
                  <h3 className="font-medium text-banc-dark">Market Updates</h3>
                  <p className="text-sm text-banc-grey">Weekly market reports and price trend analysis for your area.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1a4d5c]/10 rounded-lg flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-[#1a4d5c]" />
                </div>
                <div>
                  <h3 className="font-medium text-banc-dark">Price Drop Alerts</h3>
                  <p className="text-sm text-banc-grey">Get notified when properties you&apos;re interested in reduce in price.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1a4d5c]/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#1a4d5c]" />
                </div>
                <div>
                  <h3 className="font-medium text-banc-dark">Expert Insights</h3>
                  <p className="text-sm text-banc-grey">Tips and advice from our property experts on buying, selling, and investing.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-banc-dark mb-6">Subscribe Now</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Smith"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Label className="mb-3 block">Email Preferences</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="newProperties"
                        checked={preferences.newProperties}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, newProperties: checked as boolean })
                        }
                      />
                      <Label htmlFor="newProperties" className="text-sm cursor-pointer">
                        New property alerts
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="marketUpdates"
                        checked={preferences.marketUpdates}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, marketUpdates: checked as boolean })
                        }
                      />
                      <Label htmlFor="marketUpdates" className="text-sm cursor-pointer">
                        Market updates
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="priceDrops"
                        checked={preferences.priceDrops}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, priceDrops: checked as boolean })
                        }
                      />
                      <Label htmlFor="priceDrops" className="text-sm cursor-pointer">
                        Price drop alerts
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="blogPosts"
                        checked={preferences.blogPosts}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, blogPosts: checked as boolean })
                        }
                      />
                      <Label htmlFor="blogPosts" className="text-sm cursor-pointer">
                        Blog posts and articles
                      </Label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
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
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe to Newsletter'
                  )}
                </Button>

                <p className="text-xs text-banc-grey text-center">
                  By subscribing, you agree to our privacy policy. You can unsubscribe at any time.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}