'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Loader2, Home, TrendingUp, FileText, Tag } from 'lucide-react';
import { PageBand } from '@/components/PageBand';
import { actionPrimary, fieldControl, fieldLabel, formPanel, sectionHeading } from '@/components/ui/form-styles';
import { cn } from '@/lib/utils';

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
      <div className="flex min-h-screen items-center bg-banc-grey-pale px-4 py-12 sm:px-6">
        <div className={cn(formPanel, 'mx-auto w-full max-w-md')}>
          <Check className="mb-4 h-8 w-8 text-green-700" aria-hidden="true" />
          <h2 className={cn(sectionHeading, 'mb-3')}>
            You&apos;re Subscribed!
          </h2>
          <p className="mb-6 text-banc-muted-readable">
            Thank you for subscribing to our newsletter. You&apos;ll receive property updates and market insights at {formData.email}.
          </p>
          <Button onClick={() => window.location.href = '/'} className={cn(actionPrimary, 'shadow-none sm:w-full')}>
            Back to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <PageBand
        eyebrow="Newsletter"
        title="Stay Informed with Property Updates"
        lede="Get the latest properties, market insights, and exclusive listings delivered straight to your inbox."
      />

      {/* Form Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
        <div>
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            {/* Benefits */}
            <div className="space-y-6">
              <h2 className={sectionHeading}>What You&apos;ll Receive</h2>

              <div className="flex items-start gap-4 border-t border-banc-dark/15 pt-5">
                <Home className="mt-0.5 h-5 w-5 shrink-0 text-banc-focus" aria-hidden="true" />
                <div>
                  <h3 className="font-medium text-banc-dark">New Property Alerts</h3>
                  <p className="text-sm text-banc-muted-readable">Be the first to know when properties matching your criteria come on the market.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-banc-dark/15 pt-5">
                <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-banc-focus" aria-hidden="true" />
                <div>
                  <h3 className="font-medium text-banc-dark">Market Updates</h3>
                  <p className="text-sm text-banc-muted-readable">Weekly market reports and price trend analysis for your area.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-banc-dark/15 pt-5">
                <Tag className="mt-0.5 h-5 w-5 shrink-0 text-banc-focus" aria-hidden="true" />
                <div>
                  <h3 className="font-medium text-banc-dark">Price Drop Alerts</h3>
                  <p className="text-sm text-banc-muted-readable">Get notified when properties you&apos;re interested in reduce in price.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-banc-dark/15 pt-5">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-banc-focus" aria-hidden="true" />
                <div>
                  <h3 className="font-medium text-banc-dark">Expert Insights</h3>
                  <p className="text-sm text-banc-muted-readable">Tips and advice from our property experts on buying, selling, and investing.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className={cn(formPanel, 'self-start')}>
              <h2 className="mb-6 font-display text-2xl font-light text-banc-dark">Subscribe Now</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email" className={fieldLabel}>Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className={fieldControl}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <Label htmlFor="firstName" className={fieldLabel}>First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      className={fieldControl}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className={fieldLabel}>Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Smith"
                      className={fieldControl}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Label className={fieldLabel}>Email Preferences</Label>
                  <div>
                    <div className="flex min-h-11 items-center gap-3">
                      <Checkbox
                        id="newProperties"
                        checked={preferences.newProperties}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, newProperties: checked as boolean })
                        }
                      />
                      <Label htmlFor="newProperties" className="flex-1 cursor-pointer py-3 text-sm text-banc-dark-deep">
                        New property alerts
                      </Label>
                    </div>
                    <div className="flex min-h-11 items-center gap-3">
                      <Checkbox
                        id="marketUpdates"
                        checked={preferences.marketUpdates}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, marketUpdates: checked as boolean })
                        }
                      />
                      <Label htmlFor="marketUpdates" className="flex-1 cursor-pointer py-3 text-sm text-banc-dark-deep">
                        Market updates
                      </Label>
                    </div>
                    <div className="flex min-h-11 items-center gap-3">
                      <Checkbox
                        id="priceDrops"
                        checked={preferences.priceDrops}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, priceDrops: checked as boolean })
                        }
                      />
                      <Label htmlFor="priceDrops" className="flex-1 cursor-pointer py-3 text-sm text-banc-dark-deep">
                        Price drop alerts
                      </Label>
                    </div>
                    <div className="flex min-h-11 items-center gap-3">
                      <Checkbox
                        id="blogPosts"
                        checked={preferences.blogPosts}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, blogPosts: checked as boolean })
                        }
                      />
                      <Label htmlFor="blogPosts" className="flex-1 cursor-pointer py-3 text-sm text-banc-dark-deep">
                        Blog posts and articles
                      </Label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="rounded-[var(--radius-md)] bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className={cn(actionPrimary, 'shadow-none sm:w-full')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe to Newsletter'
                  )}
                </Button>

                <p className="text-xs text-banc-muted-readable">
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