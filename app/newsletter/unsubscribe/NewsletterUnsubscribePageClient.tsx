'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check } from 'lucide-react';
import { PageBand } from '@/components/PageBand';
import { actionPrimary, actionSecondary, fieldControl, fieldLabel, formPanel, sectionHeading } from '@/components/ui/form-styles';
import { cn } from '@/lib/utils';

export default function NewsletterUnsubscribePage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/newsletter?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.error || 'Failed to unsubscribe');
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
            You&apos;ve Been Unsubscribed
          </h2>
          <p className="mb-6 text-banc-muted-readable">
            You have been successfully removed from our mailing list. You will no longer receive emails from us.
          </p>
          <p className="mb-6 text-sm text-banc-muted-readable">
            Changed your mind?{' '}
            <a href="/newsletter/signup" className="text-banc-focus underline underline-offset-4 hover:text-banc-focus-hover">
              Subscribe again
            </a>
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
        title="Unsubscribe"
        lede={<>We&apos;re sorry to see you go. Enter your email to unsubscribe from our newsletter.</>}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
      <div className={cn(formPanel, 'max-w-xl')}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className={fieldLabel}>Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={fieldControl}
            />
          </div>

          {error && (
            <div role="alert" className="rounded-[var(--radius-md)] bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="outline"
            className={cn(actionSecondary, 'sm:w-full')}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Unsubscribe'
            )}
          </Button>
        </form>

        <div className="mt-6 border-t border-banc-dark/15 pt-6">
          <p className="text-sm text-banc-muted-readable">
            Having trouble?{' '}
            <a href="mailto:info@bancproperty.com" className="text-banc-focus underline underline-offset-4 hover:text-banc-focus-hover">
              Contact us
            </a>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}