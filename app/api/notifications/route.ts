// API Route for Push Notification Subscriptions
import { NextRequest, NextResponse } from 'next/server';

// Store subscriptions in memory (use database in production)
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    // Store subscription with user ID if available
    const userId = request.headers.get('x-user-id') || 'anonymous';
    subscriptions.set(`${userId}:${subscription.endpoint}`, {
      ...subscription,
      userId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscribed to notifications',
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint required' },
        { status: 400 }
      );
    }

    // Find and remove subscription
    for (const [key, sub] of subscriptions.entries()) {
      if (sub.endpoint === endpoint) {
        subscriptions.delete(key);
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed from notifications',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// Send push notification to a subscription
async function sendPushNotification(subscription: any, payload: any) {
  // In production, use web-push library with VAPID keys
  // This is a placeholder implementation
  console.log('Sending push to:', subscription.endpoint, payload);
}

// Broadcast notification to all subscribers
export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Send to all subscriptions
    const results = [];
    for (const [key, subscription] of subscriptions.entries()) {
      try {
        await sendPushNotification(subscription, payload);
        results.push({ endpoint: subscription.endpoint, success: true });
      } catch (error) {
        results.push({ endpoint: subscription.endpoint, success: false, error });
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      results,
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}