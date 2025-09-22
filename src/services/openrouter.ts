import OpenAI from 'openai';

// OpenRouter API client configuration
const openrouter = new OpenAI({
  baseURL: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Model configurations
const VISION_MODEL = import.meta.env.VITE_VISION_MODEL || 'anthropic/claude-3.5-sonnet';
const TEXT_MODEL = import.meta.env.VITE_TEXT_MODEL || 'anthropic/claude-3-haiku';

export interface ServiceExtractionResult {
  serviceName: string;
  confidence: number;
  extractedInfo?: {
    vehicleInfo?: string;
    serviceDetails?: string;
    priceEstimate?: string;
    additionalNotes?: string;
  };
}

export interface ServiceSummaryResult {
  cleanServiceName: string;
  category: string;
  confidence: number;
}

/**
 * Analyzes uploaded images/PDFs to extract service information
 * Uses vision-capable model for document/image analysis
 */
export async function analyzeServiceDocument(
  imageUrl: string | File,
  mimeType?: string
): Promise<ServiceExtractionResult> {
  try {
    let imageBase64 = '';

    if (imageUrl instanceof File) {
      // Convert File to base64
      imageBase64 = await fileToBase64(imageUrl);
      mimeType = imageUrl.type;
    } else {
      // Assume it's already a base64 string or URL
      imageBase64 = imageUrl;
    }

    const completion = await openrouter.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this automotive service document/quote/estimate and extract the following information:

              1. Main service being requested (e.g., "Oil Change", "Brake Repair", "Battery Replacement")
              2. Vehicle information if visible (make, model, year)
              3. Service details and description
              4. Price estimate if visible
              5. Any additional relevant notes

              Please provide a confidence score (0-100) for the service identification.

              Return the information in JSON format like this:
              {
                "serviceName": "extracted service name",
                "confidence": 85,
                "extractedInfo": {
                  "vehicleInfo": "vehicle details if found",
                  "serviceDetails": "description of service",
                  "priceEstimate": "price if found",
                  "additionalNotes": "any other relevant info"
                }
              }`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from vision model');
    }

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(response);
      return {
        serviceName: parsed.serviceName || 'Unknown Service',
        confidence: parsed.confidence || 0,
        extractedInfo: parsed.extractedInfo || {}
      };
    } catch (parseError) {
      // Fallback: extract service name from text response
      return {
        serviceName: extractServiceFromText(response),
        confidence: 50,
        extractedInfo: {
          additionalNotes: response
        }
      };
    }
  } catch (error) {
    console.error('Error analyzing service document:', error);
    return {
      serviceName: 'Service Analysis Failed',
      confidence: 0,
      extractedInfo: {
        additionalNotes: 'Failed to analyze document. Please try again or enter service manually.'
      }
    };
  }
}

/**
 * Processes user text input to identify and clean up service names
 * Uses fast text model for quick processing
 */
export async function processServiceText(userInput: string): Promise<ServiceSummaryResult> {
  try {
    const completion = await openrouter.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'user',
          content: `Analyze this user input about a car service need and provide a clean, standardized service name:

Input: "${userInput}"

Common automotive services include:
- Oil Change
- Brake Repair/Service
- Battery Replacement
- Tire Rotation
- Engine Diagnostic
- Transmission Service
- Air Filter Replacement
- Cabin Air Filter
- Spark Plug Replacement
- Coolant Service
- Power Steering Service
- Wheel Alignment
- Exhaust Repair
- AC Service/Repair

Please respond with JSON in this format:
{
  "cleanServiceName": "standardized service name",
  "category": "service category (Maintenance, Brakes, Engine, Electrical, etc.)",
  "confidence": 85
}

Provide a confidence score (0-100) based on how clearly the service can be identified.`
        }
      ],
      max_tokens: 200,
      temperature: 0.1
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from text model');
    }

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(response);
      return {
        cleanServiceName: parsed.cleanServiceName || userInput,
        category: parsed.category || 'General',
        confidence: parsed.confidence || 0
      };
    } catch (parseError) {
      // Fallback: return cleaned up input
      return {
        cleanServiceName: cleanUserInput(userInput),
        category: 'General',
        confidence: 30
      };
    }
  } catch (error) {
    console.error('Error processing service text:', error);
    return {
      cleanServiceName: cleanUserInput(userInput),
      category: 'General',
      confidence: 0
    };
  }
}

// Helper functions
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

function extractServiceFromText(text: string): string {
  // Simple extraction logic for fallback
  const commonServices = [
    'oil change', 'brake', 'battery', 'tire', 'engine', 'transmission',
    'air filter', 'spark plug', 'coolant', 'alignment', 'exhaust', 'ac'
  ];

  const lowerText = text.toLowerCase();
  for (const service of commonServices) {
    if (lowerText.includes(service)) {
      return service.charAt(0).toUpperCase() + service.slice(1);
    }
  }

  return 'General Service';
}

function cleanUserInput(input: string): string {
  // Basic cleanup of user input
  return input
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Test function to verify API connection
export async function testOpenRouterConnection(): Promise<boolean> {
  try {
    const completion = await openrouter.chat.completions.create({
      model: TEXT_MODEL,
      messages: [{ role: 'user', content: 'Hello, please respond with "API connection successful"' }],
      max_tokens: 50
    });

    return !!completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('OpenRouter connection test failed:', error);
    return false;
  }
}