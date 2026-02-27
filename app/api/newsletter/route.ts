// API Route for Newsletter Subscriptions
import { NextRequest, NextResponse } from 'next/server';

interface SubscriptionRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: {
    newProperties?: boolean;
    marketUpdates?: boolean;
    blogPosts?: boolean;
    priceDrops?: boolean;
  };
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

// In-memory store for demo (replace with database in production)
const subscribers: Map<string, SubscriptionRequest> = new Map();

async function addToMailchimp(data: SubscriptionRequest): Promise<boolean> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  
  if (!apiKey || !listId) {
    console.log('Mailchimp not configured, using local storage');
    return false;
  }
  
  try {
    const [apiKeyValue, datacenter] = apiKey.split('-');
    const response = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
    });
    
    return response.ok || response.status === 400; // 400 means already subscribed
  } catch (error) {
    console.error('Mailchimp error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscriptionRequest = await request.json();
    
    // Validation
    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }
    
    const normalizedEmail = body.email.toLowerCase().trim();
    
    // Check if already subscribed
    if (subscribers.has(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'This email is already subscribed' },
        { status: 409 }
      );
    }
    
    // Set default preferences
    const subscription: SubscriptionRequest = {
      ...body,
      preferences: {
        newProperties: true,
        marketUpdates: true,
        blogPosts: false,
        priceDrops: true,
        ...body.preferences,
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!subscribers.has(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Email not found in subscriber list' },
        { status: 404 }
      );
    }
    
    // Remove from local storage
    subscribers.delete(normalizedEmail);
    
    // Try to unsubscribe from Mailchimp
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;
    
    if (apiKey && listId) {
      const [apiKeyValue, datacenter] = apiKey.split('-');
      const subscriberHash = await crypto.subtle.digest(
        'MD5',
        new TextEncoder().encode(normalizedEmail)
      ).then(buf => Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
      
      await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
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

// Get subscriber preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const subscriber = subscribers.get(normalizedEmail);
    
    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      subscriber: {
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        preferences: subscriber.preferences,
      },
    });
  } catch (error) {
    console.error('Get subscriber error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get subscriber' },
      { status: 500 }
    );
  }
}