// API Route for Push Notification Subscriptions
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId } from '@/lib/auth';
import { isAdminRequest } from '@/lib/admin-token';

export const runtime = 'nodejs';

const subscriptionSchema = z
  .object({
    endpoint: z.string().url().max(2048).refine((v) => v.startsWith('https://'), 'https only'),
    expirationTime: z.number().nullable().optional(),
    keys: z
      .object({
        p256dh: z.string().max(512),
        auth: z.string().max(512),
      })
      .optional(),
  })
  .strict();

const unsubscribeSchema = z.object({ endpoint: z.string().url().max(2048) }).strict();

const broadcastSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    body: z.string().trim().max(500).optional(),
    tag: z.string().trim().max(60).optional(),
    url: z.string().max(2048).optional(),
    requireInteraction: z.boolean().optional(),
  })
  .strict();

type StoredSubscription = z.infer<typeof subscriptionSchema> & {
  userId: string;
  createdAt: string;
};

// Store subscriptions in memory (per server instance; use a database in production)
const subscriptions = new Map<string, StoredSubscription>();

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = subscriptionSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid subscription' },
      { status: 400 }
    );
  }

  subscriptions.set(`${userId}:${parsed.data.endpoint}`, {
    ...parsed.data,
    userId,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: 'Subscribed to notifications',
  });
}

export async function DELETE(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = unsubscribeSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Endpoint required' },
      { status: 400 }
    );
  }

  // Only the owning user may remove a subscription
  subscriptions.delete(`${userId}:${parsed.data.endpoint}`);

  return NextResponse.json({
    success: true,
    message: 'Unsubscribed from notifications',
  });
}

// Send push notification to a subscription
async function sendPushNotification(
  subscription: StoredSubscription,
  payload: z.infer<typeof broadcastSchema>
) {
  // In production, use web-push library with VAPID keys
  // This is a placeholder implementation
  console.log('Sending push to:', subscription.endpoint, payload.title);
}

// Broadcast notification to all subscribers (admin only: ADMIN_API_TOKEN bearer)
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = broadcastSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid payload', details: parsed.error.issues },
      { status: 400 }
    );
  }

  let sent = 0;
  let failed = 0;
  for (const subscription of subscriptions.values()) {
    try {
      await sendPushNotification(subscription, parsed.data);
      sent += 1;
    } catch (error) {
      console.error('Push send error:', error);
      failed += 1;
    }
  }

  return NextResponse.json({ success: true, sent, failed });
}
