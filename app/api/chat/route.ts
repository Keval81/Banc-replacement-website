// API Route for Property Chatbot
import { NextRequest, NextResponse } from 'next/server';
import { 
  SYSTEM_PROMPT, 
  parseSearchQuery,
  PROPERTY_SEARCH_FUNCTION,
  SCHEDULE_VIEWING_FUNCTION,
  VALUATION_FUNCTION,
  ChatMessage 
} from '@/lib/ai/chat';

// Mock property database for chatbot
const mockProperties = [
  {
    id: '1',
    title: 'Stunning 4-Bedroom Family Home',
    price: 750000,
    location: 'Cuffley, Hertfordshire',
    bedrooms: 4,
    propertyType: 'Detached House',
    features: ['Garden', 'Garage', 'Parking', 'Conservatory'],
    description: 'Beautiful detached family home with spacious gardens',
  },
  {
    id: '2',
    title: 'Modern 2-Bedroom Apartment',
    price: 425000,
    location: 'Brookmans Park, Hertfordshire',
    bedrooms: 2,
    propertyType: 'Apartment',
    features: ['Balcony', 'Parking', 'Lift Access'],
    description: 'Contemporary apartment in prime location',
  },
  {
    id: '3',
    title: 'Charming 3-Bedroom Cottage',
    price: 625000,
    location: 'Welham Green, Hertfordshire',
    bedrooms: 3,
    propertyType: 'Cottage',
    features: ['Garden', 'Period Features', 'Fireplace'],
    description: 'Character property with original features',
  },
  {
    id: '4',
    title: 'Luxury 5-Bedroom Villa',
    price: 1250000,
    location: 'Potters Bar, Hertfordshire',
    bedrooms: 5,
    propertyType: 'Detached House',
    features: ['Swimming Pool', 'Gym', 'Cinema Room', 'Triple Garage'],
    description: 'Exceptional family home with swimming pool',
  },
];

// Simple response generation without OpenAI (for demo/fallback)
function generateFallbackResponse(message: string, searchParams: any): { response: string; properties?: any[]; action?: string } {
  const lowerMessage = message.toLowerCase();
  
  // Search intent
  if (lowerMessage.includes('find') || lowerMessage.includes('looking') || lowerMessage.includes('search')) {
    const matching = mockProperties.filter(p => {
      if (searchParams.bedrooms && p.bedrooms !== searchParams.bedrooms) return false;
      if (searchParams.maxPrice && p.price > searchParams.maxPrice) return false;
      if (searchParams.location && !p.location.toLowerCase().includes(searchParams.location.toLowerCase())) return false;
      if (searchParams.propertyType && !p.propertyType.toLowerCase().includes(searchParams.propertyType.toLowerCase())) return false;
      return true;
    });
    
    if (matching.length > 0) {
      return {
        response: `I found ${matching.length} property${matching.length > 1 ? 'ies' : 'y'} that match your criteria. Here are the best matches:`,
        properties: matching.slice(0, 3),
      };
    }
    return {
      response: "I couldn't find any exact matches, but I'd be happy to notify you when properties meeting your criteria become available. Would you like to set up a property alert?",
    };
  }
  
  // Valuation intent
  if (lowerMessage.includes('value') || lowerMessage.includes('worth') || lowerMessage.includes('price') || lowerMessage.includes('sell')) {
    return {
      response: "I can help you get a free property valuation! Please provide your address, property type, and number of bedrooms, and I'll give you an instant estimate. Or would you prefer to speak with one of our valuation specialists?",
      action: 'valuation',
    };
  }
  
  // Viewing intent
  if (lowerMessage.includes('view') || lowerMessage.includes('see') || lowerMessage.includes('visit')) {
    return {
      response: "I'd be happy to arrange a viewing for you. Which property interests you? You can provide the address or property ID, and I'll check availability for you.",
      action: 'viewing',
    };
  }
  
  // FAQ responses
  if (lowerMessage.includes('fee') || lowerMessage.includes('commission') || lowerMessage.includes('cost')) {
    return {
      response: "Our commission rates are competitive and transparent. For sales, we typically charge 1.25% + VAT. For lettings, it's 10% + VAT of the monthly rent. I'd recommend booking a free valuation where we can discuss all fees in detail.",
    };
  }
  
  if (lowerMessage.includes('mortgage') || lowerMessage.includes('finance') || lowerMessage.includes('loan')) {
    return {
      response: "We work with independent mortgage advisors who can help you find the best rates. Would you like me to arrange for one of our partners to contact you?",
    };
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      response: "Hello! Welcome to Banc. I'm your AI property assistant. How can I help you today? I can help you find properties, arrange viewings, get a valuation, or answer any questions about the buying process.",
    };
  }
  
  if (lowerMessage.includes('area') || lowerMessage.includes('location') || lowerMessage.includes('neighbourhood')) {
    return {
      response: "We specialize in properties across Hertfordshire, including Cuffley, Brookmans Park, Potters Bar, and surrounding areas. These are popular family locations with excellent schools and transport links to London. Which area interests you?",
    };
  }
  
  // Default response
  return {
    response: "Thanks for your message. I can help you find properties, arrange viewings, get a free valuation, or answer questions about the buying process. What would you like to do?",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Parse the search query from the message
    const searchParams = parseSearchQuery(message);
    
    // Try OpenAI if API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...history.slice(-6), // Keep last 6 messages for context
              { role: 'user', content: message },
            ],
            functions: [
              PROPERTY_SEARCH_FUNCTION,
              SCHEDULE_VIEWING_FUNCTION,
              VALUATION_FUNCTION,
            ],
            function_call: 'auto',
            max_tokens: 300,
            temperature: 0.7,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const assistantMessage = data.choices[0].message;
          
          // Handle function calls
          if (assistantMessage.function_call) {
            const funcName = assistantMessage.function_call.name;
            const funcArgs = JSON.parse(assistantMessage.function_call.arguments);
            
            if (funcName === 'searchProperties') {
              // Perform search
              const matching = mockProperties.filter(p => {
                if (funcArgs.bedrooms && p.bedrooms !== funcArgs.bedrooms) return false;
                if (funcArgs.maxPrice && p.price > funcArgs.maxPrice) return false;
                if (funcArgs.location && !p.location.toLowerCase().includes(funcArgs.location.toLowerCase())) return false;
                return true;
              });
              
              return NextResponse.json({
                success: true,
                response: `I found ${matching.length} properties matching your search. Here are the best options:`,
                properties: matching.slice(0, 3),
                action: 'search',
              });
            }
            
            if (funcName === 'scheduleViewing') {
              return NextResponse.json({
                success: true,
                response: "I've noted your viewing request. One of our team will contact you shortly to confirm the appointment.",
                action: 'viewing_scheduled',
                details: funcArgs,
              });
            }
            
            if (funcName === 'requestValuation') {
              return NextResponse.json({
                success: true,
                response: "Thank you for your valuation request. We'll be in touch within 24 hours to arrange your free, no-obligation valuation.",
                action: 'valuation_requested',
                details: funcArgs,
              });
            }
          }
          
          return NextResponse.json({
            success: true,
            response: assistantMessage.content,
            action: 'chat',
          });
        }
      } catch (error) {
        console.error('OpenAI error, falling back to local:', error);
      }
    }
    
    // Fallback to local response generation
    const fallbackResult = generateFallbackResponse(message, searchParams);
    
    return NextResponse.json({
      success: true,
      ...fallbackResult,
      parsedParams: searchParams,
      fallback: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}