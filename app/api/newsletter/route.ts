// API Route for Newsletter Subscriptions
import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { normaliseNewsletterEmail, verifyUnsubscribeToken } from '@/lib/newsletter-token';

export const runtime = 'nodejs';

const emailSchema = z.string().trim().email().max(254);

const subscriptionSchema = z
  .object({
    email: emailSchema,
    firstName: z.string().trim().max(80).optional(),
    lastName: z.string().trim().max(80).optional(),
    preferences: z
      .object({
        newProperties: z.boolean().optional(),
        marketUpdates: z.boolean().optional(),
        blogPosts: z.boolean().optional(),
        priceDrops: z.boolean().optional(),
      })
      .optional(),
    location: z.string().trim().max(120).optional(),
    minPrice: z.number().finite().nonnegative().optional(),
    maxPrice: z.number().finite().nonnegative().optional(),
    bedrooms: z.number().int().min(0).max(20).optional(),
  })
  .strip();

type SubscriptionRequest = z.infer<typeof subscriptionSchema>;

// In-memory store for demo (per server instance; replace with database in production)
const subscribers: Map<string, SubscriptionRequest> = new Map();

function mailchimpConfig(): { apiKey: string; listId: string; datacenter: string } | null {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!apiKey || !listId) return null;
  const datacenter = apiKey.split('-')[1];
  if (!datacenter) return null;
  return { apiKey, listId, datacenter };
}

async function addToMailchimp(data: SubscriptionRequest): Promise<boolean> {
  const config = mailchimpConfig();
  if (!config) {
    console.log('Mailchimp not configured, using local storage');
    return false;
  }

  try {
    const response = await fetch(
      `https://${config.datacenter}.api.mailchimp.com/3.0/lists/${config.listId}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: data.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: data.firstName || '',
            LNAME: data.lastName || '',
          },
          interests: {
            // Map preferences to Mailchimp interest groups
          },
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    return response.ok || response.status === 400; // 400 means already subscribed
  } catch (error) {
    console.error('Mailchimp error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      json = undefined;
    }

    const parsed = subscriptionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = normaliseNewsletterEmail(parsed.data.email);

    // Check if already subscribed
    if (subscribers.has(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    // Set default preferences
    const subscription: SubscriptionRequest = {
      ...parsed.data,
      email: normalizedEmail,
      preferences: {
        newProperties: true,
        marketUpdates: true,
        blogPosts: false,
        priceDrops: true,
        ...parsed.data.preferences,
      },
    };

    // Try Mailchimp first
    const mailchimpSuccess = await addToMailchimp(subscription);

    // Store locally either way
    subscribers.set(normalizedEmail, subscription);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      email: normalizedEmail,
      mailchimp: mailchimpSuccess,
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

// DELETE /api/newsletter?email=…&token=…  (token = signed unsubscribe token from the email footer)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailResult = emailSchema.safeParse(searchParams.get('email') ?? '');
    const token = searchParams.get('token') ?? '';

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = normaliseNewsletterEmail(emailResult.data);

    if (!verifyUnsubscribeToken(normalizedEmail, token)) {
      return NextResponse.json(
        {
          success: false,
          error: 'This unsubscribe link is invalid or has expired. Please use the link in your email.',
        },
        { status: 403 }
      );
    }

    // Remove from local storage (idempotent; do not reveal whether the address existed)
    subscribers.delete(normalizedEmail);

    // Try to unsubscribe from Mailchimp
    const config = mailchimpConfig();
    if (config) {
      const subscriberHash = createHash('md5').update(normalizedEmail).digest('hex');
      try {
        await fetch(
          `https://${config.datacenter}.api.mailchimp.com/3.0/lists/${config.listId}/members/${subscriberHash}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${config.apiKey}` },
            signal: AbortSignal.timeout(8000),
          }
        );
      } catch (error) {
        console.error('Mailchimp unsubscribe error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
