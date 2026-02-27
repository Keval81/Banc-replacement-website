// AI Chat utilities and prompts for Property Chatbot

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

export interface PropertySearchParams {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  features?: string[];
}

export const SYSTEM_PROMPT = `You are Banc, an AI property assistant for a premium UK estate agency. 

Your role:
- Help users find their perfect property
- Answer questions about properties, the buying process, and local areas
- Be friendly, professional, and knowledgeable
- Guide users through scheduling viewings
- Provide property valuations when requested

Guidelines:
- Keep responses concise (2-3 sentences max)
- Ask clarifying questions when needed
- Always mention specific property details when available
- Be encouraging but not pushy
- If unsure, suggest speaking with a human agent

You have access to property data and can search based on:
- Location (areas, postcodes)
- Price range
- Number of bedrooms
- Property type (house, apartment, etc.)
- Features (garden, parking, etc.)

Current date: ${new Date().toLocaleDateString('en-GB')}`;

export const PROPERTY_SEARCH_FUNCTION = {
  name: 'searchProperties',
  description: 'Search for properties matching user criteria',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'Location, area, or postcode to search in',
      },
      minPrice: {
        type: 'number',
        description: 'Minimum price in GBP',
      },
      maxPrice: {
        type: 'number',
        description: 'Maximum price in GBP',
      },
      bedrooms: {
        type: 'number',
        description: 'Number of bedrooms required',
      },
      propertyType: {
        type: 'string',
        description: 'Type of property: house, apartment, flat, bungalow, etc.',
      },
      features: {
        type: 'array',
        items: { type: 'string' },
        description: 'Required features like garden, parking, garage',
      },
    },
    required: [],
  },
};

export const SCHEDULE_VIEWING_FUNCTION = {
  name: 'scheduleViewing',
  description: 'Schedule a property viewing',
  parameters: {
    type: 'object',
    properties: {
      propertyId: {
        type: 'string',
        description: 'ID of the property to view',
      },
      preferredDate: {
        type: 'string',
        description: 'Preferred date for viewing (YYYY-MM-DD)',
      },
      preferredTime: {
        type: 'string',
        description: 'Preferred time: morning, afternoon, or evening',
      },
      name: {
        type: 'string',
        description: 'Name of the person viewing',
      },
      email: {
        type: 'string',
        description: 'Email address',
      },
      phone: {
        type: 'string',
        description: 'Phone number',
      },
    },
    required: ['propertyId', 'name', 'email', 'phone'],
  },
};

export const VALUATION_FUNCTION = {
  name: 'requestValuation',
  description: 'Request a property valuation',
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'Full property address',
      },
      propertyType: {
        type: 'string',
        description: 'Type of property',
      },
      bedrooms: {
        type: 'number',
        description: 'Number of bedrooms',
      },
      name: {
        type: 'string',
        description: 'Name of the owner',
      },
      email: {
        type: 'string',
        description: 'Email address',
      },
      phone: {
        type: 'string',
        description: 'Phone number',
      },
    },
    required: ['address', 'name', 'email', 'phone'],
  },
};

// Parse natural language search query
export function parseSearchQuery(message: string): PropertySearchParams {
  const params: PropertySearchParams = {};
  const lowerMessage = message.toLowerCase();

  // Extract location
  const locationPatterns = [
    /in\s+([a-z\s]+?)(?:\s+under|\s+below|\s+for|\s+with|\s+and|$)/i,
    /(?:in|near)\s+([a-z\s]+?)(?:\?|\.|$|,)/i,
  ];
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match) {
      params.location = match[1].trim();
      break;
    }
  }

  // Extract bedrooms
  const bedPatterns = [
    /(\d+)\s*(?:bed|bedroom|br)/i,
    /(\d+)\s*beds/i,
    /(\d+)\s*bedroom/i,
  ];
  for (const pattern of bedPatterns) {
    const match = message.match(pattern);
    if (match) {
      params.bedrooms = parseInt(match[1], 10);
      break;
    }
  }

  // Extract price - look for numbers near price indicators
  const pricePatterns = [
    /(?:under|below|up to|max|maximum)\s*[£$]?\s*(\d[\d,]*)(?:k|000)?/i,
    /[£$]?\s*(\d[\d,]*)(?:k|000)?\s*(?:or less|maximum|max)/i,
    /[£$]?\s*(\d[\d,]*)(?:k|000)?\s*(?:to|-)\s*[£$]?\s*(\d[\d,]*)(?:k|000)?/i,
  ];
  for (const pattern of pricePatterns) {
    const match = message.match(pattern);
    if (match) {
      let price = parseInt(match[1].replace(/,/g, ''), 10);
      if (price < 1000) price *= 1000; // Convert "800K" to 800000
      params.maxPrice = price;
      if (match[2]) {
        let maxPrice = parseInt(match[2].replace(/,/g, ''), 10);
        if (maxPrice < 1000) maxPrice *= 1000;
        params.maxPrice = maxPrice;
      }
      break;
    }
  }

  // Extract property type
  const propertyTypes = ['house', 'apartment', 'flat', 'bungalow', 'cottage', 'maisonette', 'penthouse'];
  for (const type of propertyTypes) {
    if (lowerMessage.includes(type)) {
      params.propertyType = type;
      break;
    }
  }

  // Extract features
  const features: string[] = [];
  const featureKeywords = ['garden', 'parking', 'garage', 'balcony', 'ensuite', 'conservatory', 'driveway'];
  for (const feature of featureKeywords) {
    if (lowerMessage.includes(feature)) {
      features.push(feature);
    }
  }
  if (features.length > 0) {
    params.features = features;
  }

  return params;
}

// Generate property description highlights
export function generateSmartDescription(property: {
  features: string[];
  bedrooms: number;
  location: string;
  propertyType: string;
  nearbySchools?: boolean;
  transportLinks?: boolean;
}): string[] {
  const highlights: string[] = [];

  // Family-friendly detection
  const familyFeatures = ['garden', 'driveway', 'garage', 'conservatory', 'ensuite'];
  const hasFamilyFeatures = property.features.some(f => 
    familyFeatures.some(ff => f.toLowerCase().includes(ff))
  );
  
  if (property.bedrooms >= 3 && hasFamilyFeatures) {
    highlights.push('Perfect for families');
  }

  // Commuter-friendly detection
  if (property.transportLinks) {
    highlights.push('Great for commuters');
  }

  // Premium features
  if (property.features.some(f => 
    ['swimming pool', 'cinema room', 'wine cellar', 'gym'].some(pf => 
      f.toLowerCase().includes(pf)
    )
  )) {
    highlights.push('Luxury living');
  }

  // First-time buyer friendly
  if (property.bedrooms <= 2 && !property.features.some(f => 
    f.toLowerCase().includes('chain')
  )) {
    highlights.push('Ideal for first-time buyers');
  }

  // Garden lovers
  if (property.features.some(f => 
    ['garden', 'landscaped', 'patio', 'terrace'].some(gf => 
      f.toLowerCase().includes(gf)
    )
  )) {
    highlights.push('Outdoor space to enjoy');
  }

  return highlights;
}