'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, Check, Frown } from 'lucide-react';

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
      <div className="min-h-screen bg-banc-grey-pale flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-banc-dark mb-3">
            You&apos;ve Been Unsubscribed
          </h2>
          <p className="text-banc-grey mb-6">
            You have been successfully removed from our mailing list. You will no longer receive emails from us.
          </p>
          <p className="text-sm text-banc-grey mb-6">
            Changed your mind?{' '}
            <a href="/newsletter/signup" className="text-[#1a4d5c] hover:underline">
              Subscribe again
            </a>
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full">
            Back to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-banc-grey-pale flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-banc-grey-pale rounded-full flex items-center justify-center mx-auto mb-4">
            <Frown className="w-8 h-8 text-banc-grey" />
          </div>
          <h1 className="text-2xl font-bold text-banc-dark mb-2">
            Unsubscribe
          </h1>
          <p className="text-banc-grey">
            We&apos;re sorry to see you go. Enter your email to unsubscribe from our newsletter.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Unsubscribe'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-banc-grey">
            Having trouble?{' '}
            <a href="mailto:info@banc.co.uk" className="text-[#1a4d5c] hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}