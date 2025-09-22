import OpenAI from 'openai';
import type { ExtractedServiceData, ConfidenceScore, UserSessionData } from '../types/extraction';

// OpenRouter API client configuration
const openrouter = new OpenAI({
  baseURL: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Model configurations
const VISION_MODEL = import.meta.env.VITE_VISION_MODEL || 'meta-llama/llama-3.2-11b-vision-instruct:free';
const TEXT_MODEL = import.meta.env.VITE_TEXT_MODEL || 'deepseek/deepseek-r1:free';

// Rate limiting configuration
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests for free models

// Rate limiting helper
async function rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();

  try {
    return await requestFn();
  } catch (error: any) {
    if (error?.status === 429) {
      console.warn('Rate limit hit, waiting 5 seconds before retry...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      lastRequestTime = Date.now();
      return await requestFn();
    }
    throw error;
  }
}

// Utility function to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create confidence score
function createConfidence(value: number, source: ConfidenceScore['source']): ConfidenceScore {
  return { value: Math.max(0, Math.min(100, value)), source };
}

// Common automotive service corrections and standardizations
const serviceCorrections: { [key: string]: string } = {
  // Common typos
  'oild': 'oil',
  'oile': 'oil',
  'oill': 'oil',
  'brake': 'brake',
  'brakes': 'brake',
  'braek': 'brake',
  'brack': 'brake',
  'tire': 'tire',
  'tyre': 'tire',
  'tires': 'tire',
  'battary': 'battery',
  'battrey': 'battery',
  'batter': 'battery',
  'transmision': 'transmission',
  'transmition': 'transmission',
  'maintnance': 'maintenance',
  'maintanance': 'maintenance',
  'replacment': 'replacement',
  'replacemnt': 'replacement',
  'inspekshun': 'inspection',
  'inspecshun': 'inspection',
  'chekup': 'checkup',
  'checkup': 'check up',
  'airconditioner': 'air conditioner',
  'aircon': 'air conditioning',
  'ac': 'air conditioning'
};

const standardServices: { [key: string]: string } = {
  'oil change': 'Oil Change',
  'oil': 'Oil Change',
  'brake service': 'Brake Service',
  'brake': 'Brake Service',
  'brakes': 'Brake Service',
  'brake pad': 'Brake Pad Replacement',
  'brake pads': 'Brake Pad Replacement',
  'tire rotation': 'Tire Rotation',
  'tire': 'Tire Service',
  'tires': 'Tire Service',
  'battery': 'Battery Replacement',
  'battery replacement': 'Battery Replacement',
  'transmission': 'Transmission Service',
  'air filter': 'Air Filter Replacement',
  'cabin filter': 'Cabin Air Filter Replacement',
  'tune up': 'Tune Up',
  'tuneup': 'Tune Up',
  'inspection': 'Vehicle Inspection',
  'check up': 'Vehicle Inspection',
  'checkup': 'Vehicle Inspection',
  'air conditioning': 'AC Service',
  'ac service': 'AC Service',
  'air conditioner': 'AC Service'
};

// Smart text correction function
function correctAndStandardizeService(input: string): { corrected: string; standardized: string; confidence: number } {
  let corrected = input.toLowerCase().trim();
  let confidence = 100;

  // Apply spelling corrections
  Object.keys(serviceCorrections).forEach(typo => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    if (corrected.match(regex)) {
      corrected = corrected.replace(regex, serviceCorrections[typo]);
      confidence = Math.max(85, confidence - 5); // Slight confidence reduction for corrections
    }
  });

  // Find best matching standard service
  let bestMatch = '';
  let bestScore = 0;

  Object.keys(standardServices).forEach(service => {
    const score = calculateSimilarity(corrected, service);
    if (score > bestScore && score > 0.6) {
      bestMatch = standardServices[service];
      bestScore = score;
    }
  });

  // If no good match found, try to capitalize properly
  if (!bestMatch) {
    bestMatch = corrected
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    confidence = Math.max(60, confidence - 15);
  } else {
    confidence = Math.min(95, confidence + (bestScore * 10));
  }

  return {
    corrected,
    standardized: bestMatch,
    confidence: Math.round(confidence)
  };
}

// Simple similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Enhanced document analysis with comprehensive data extraction
 */
export async function analyzeServiceDocument(
  file: File,
  userContext?: Partial<UserSessionData>
): Promise<ExtractedServiceData> {
  const startTime = performance.now();
  const id = generateId();

  try {
    const imageBase64 = await fileToBase64(file);

    // Create enhanced prompt for comprehensive extraction
    const extractionPrompt = `You are an expert automotive service analyzer. Analyze this document/image and extract ALL relevant information in JSON format.

IMPORTANT: Return a complete JSON object with the following structure. Use null for missing values, never skip fields:

{
  "serviceInfo": {
    "primaryService": "main service being performed (e.g., 'Oil Change', 'Brake Service')",
    "secondaryServices": ["array of additional services mentioned"],
    "category": "service category (Maintenance, Brakes, Engine, Electrical, Transmission, etc.)",
    "urgencyLevel": "low|medium|high|emergency",
    "recommendedAction": "what the customer should do next",
    "confidence": 85
  },
  "vehicleInfo": {
    "year": 2020,
    "make": "Toyota",
    "model": "Camry",
    "vin": "VIN if visible",
    "mileage": 45000,
    "engineType": "4-cylinder, V6, etc.",
    "transmission": "automatic, manual, CVT",
    "color": "vehicle color if mentioned",
    "licensePlate": "plate number if visible",
    "confidence": 90
  },
  "pricing": {
    "partsTotal": 150.00,
    "laborTotal": 200.00,
    "subtotal": 350.00,
    "taxes": 28.00,
    "discounts": 0.00,
    "finalTotal": 378.00,
    "currency": "USD",
    "breakdown": [
      {
        "item": "Oil Filter",
        "quantity": 1,
        "unitPrice": 15.00,
        "total": 15.00,
        "category": "parts"
      },
      {
        "item": "Labor - Oil Change",
        "quantity": 1,
        "unitPrice": 35.00,
        "total": 35.00,
        "category": "labor"
      }
    ],
    "confidence": 95
  },
  "shopInfo": {
    "name": "Shop name",
    "address": "full address",
    "city": "city",
    "state": "state",
    "zipCode": "zip code",
    "phone": "phone number",
    "email": "email if visible",
    "website": "website if visible",
    "technicianName": "technician name if mentioned",
    "shopLicense": "license number if visible",
    "confidence": 80
  },
  "technicalInfo": {
    "diagnosticCodes": ["P0171", "P0174"],
    "partNumbers": ["12345-ABC", "67890-DEF"],
    "serviceIntervals": 5000,
    "warrantyInfo": "warranty details if mentioned",
    "recommendedMaintenance": ["next oil change in 5000 miles", "inspect brakes"],
    "severity": "routine|recommended|needed|critical",
    "confidence": 75
  },
  "timeline": {
    "estimatedCompletionTime": "2-3 hours",
    "scheduledDate": "2025-09-25T10:00:00Z",
    "preferredDate": null,
    "dueDate": null,
    "isUrgent": false,
    "nextServiceDate": "2026-03-25T00:00:00Z",
    "confidence": 70
  },
  "extractedText": "all text found in the document",
  "overallConfidence": 85
}

EXTRACT EVERYTHING you can see. Look for:
- Service orders, estimates, invoices, receipts
- Vehicle identification (VIN, license, make/model/year)
- All pricing details and line items
- Shop information and contact details
- Technical codes, part numbers, recommendations
- Dates, times, appointments
- Any maintenance schedules or intervals
- Diagnostic information
- Warranty details

Be thorough and accurate. If text is unclear, indicate lower confidence scores.`;

    const completion = await rateLimitedRequest(() => openrouter.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: extractionPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${file.type};base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    }));

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from vision model');
    }

    // Parse the AI response
    let parsedData: any;
    try {
      // Clean the response and extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: create structured data from raw response
      parsedData = createFallbackData(response);
    }

    const processingTime = performance.now() - startTime;

    // Build the comprehensive ExtractedServiceData object
    const extractedData: ExtractedServiceData = {
      id,
      timestamp: new Date(),
      source: 'document_upload',

      serviceInfo: {
        primaryService: parsedData.serviceInfo?.primaryService || 'Unknown Service',
        secondaryServices: parsedData.serviceInfo?.secondaryServices || [],
        category: parsedData.serviceInfo?.category || 'General',
        urgencyLevel: parsedData.serviceInfo?.urgencyLevel || 'medium',
        recommendedAction: parsedData.serviceInfo?.recommendedAction || '',
        confidence: createConfidence(parsedData.serviceInfo?.confidence || 50, 'ai_extraction')
      },

      vehicleInfo: {
        year: parsedData.vehicleInfo?.year || undefined,
        make: parsedData.vehicleInfo?.make || undefined,
        model: parsedData.vehicleInfo?.model || undefined,
        vin: parsedData.vehicleInfo?.vin || undefined,
        mileage: parsedData.vehicleInfo?.mileage || undefined,
        engineType: parsedData.vehicleInfo?.engineType || undefined,
        transmission: parsedData.vehicleInfo?.transmission || undefined,
        color: parsedData.vehicleInfo?.color || undefined,
        licensePlate: parsedData.vehicleInfo?.licensePlate || undefined,
        confidence: createConfidence(parsedData.vehicleInfo?.confidence || 40, 'ai_extraction')
      },

      pricing: {
        partsTotal: parsedData.pricing?.partsTotal || undefined,
        laborTotal: parsedData.pricing?.laborTotal || undefined,
        subtotal: parsedData.pricing?.subtotal || undefined,
        taxes: parsedData.pricing?.taxes || undefined,
        discounts: parsedData.pricing?.discounts || undefined,
        finalTotal: parsedData.pricing?.finalTotal || undefined,
        currency: parsedData.pricing?.currency || 'USD',
        breakdown: parsedData.pricing?.breakdown || [],
        confidence: createConfidence(parsedData.pricing?.confidence || 30, 'ai_extraction')
      },

      shopInfo: {
        name: parsedData.shopInfo?.name || undefined,
        address: parsedData.shopInfo?.address || undefined,
        city: parsedData.shopInfo?.city || undefined,
        state: parsedData.shopInfo?.state || undefined,
        zipCode: parsedData.shopInfo?.zipCode || undefined,
        phone: parsedData.shopInfo?.phone || undefined,
        email: parsedData.shopInfo?.email || undefined,
        website: parsedData.shopInfo?.website || undefined,
        technicianName: parsedData.shopInfo?.technicianName || undefined,
        shopLicense: parsedData.shopInfo?.shopLicense || undefined,
        confidence: createConfidence(parsedData.shopInfo?.confidence || 40, 'ai_extraction')
      },

      technicalInfo: {
        diagnosticCodes: parsedData.technicalInfo?.diagnosticCodes || [],
        partNumbers: parsedData.technicalInfo?.partNumbers || [],
        serviceIntervals: parsedData.technicalInfo?.serviceIntervals || undefined,
        warrantyInfo: parsedData.technicalInfo?.warrantyInfo || undefined,
        recommendedMaintenance: parsedData.technicalInfo?.recommendedMaintenance || [],
        severity: parsedData.technicalInfo?.severity || 'routine',
        confidence: createConfidence(parsedData.technicalInfo?.confidence || 35, 'ai_extraction')
      },

      timeline: {
        estimatedCompletionTime: parsedData.timeline?.estimatedCompletionTime || undefined,
        scheduledDate: parsedData.timeline?.scheduledDate ? new Date(parsedData.timeline.scheduledDate) : undefined,
        preferredDate: parsedData.timeline?.preferredDate ? new Date(parsedData.timeline.preferredDate) : undefined,
        dueDate: parsedData.timeline?.dueDate ? new Date(parsedData.timeline.dueDate) : undefined,
        isUrgent: parsedData.timeline?.isUrgent || false,
        nextServiceDate: parsedData.timeline?.nextServiceDate ? new Date(parsedData.timeline.nextServiceDate) : undefined,
        confidence: createConfidence(parsedData.timeline?.confidence || 40, 'ai_extraction')
      },

      rawData: {
        extractedText: parsedData.extractedText || response,
        imageMetadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadTime: new Date()
        },
        aiResponse: response,
        processingTime
      }
    };

    return extractedData;

  } catch (error) {
    console.error('Error analyzing service document:', error);
    const processingTime = performance.now() - startTime;

    // Return error state with basic file info
    return {
      id,
      timestamp: new Date(),
      source: 'document_upload',
      serviceInfo: {
        primaryService: 'Document Analysis Failed',
        secondaryServices: [],
        category: 'Error',
        urgencyLevel: 'medium',
        recommendedAction: 'Please try uploading the document again or enter service information manually.',
        confidence: createConfidence(0, 'ai_extraction')
      },
      vehicleInfo: { confidence: createConfidence(0, 'ai_extraction') },
      pricing: { currency: 'USD', breakdown: [], confidence: createConfidence(0, 'ai_extraction') },
      shopInfo: { confidence: createConfidence(0, 'ai_extraction') },
      technicalInfo: {
        diagnosticCodes: [],
        partNumbers: [],
        recommendedMaintenance: [],
        severity: 'routine',
        confidence: createConfidence(0, 'ai_extraction')
      },
      timeline: { isUrgent: false, confidence: createConfidence(0, 'ai_extraction') },
      rawData: {
        imageMetadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadTime: new Date()
        },
        aiResponse: `Error: ${(error as Error).message}`,
        processingTime
      }
    };
  }
}

/**
 * Enhanced text processing with symptom analysis and intent classification
 */
export async function processServiceText(
  userInput: string,
  userContext?: Partial<UserSessionData>
): Promise<ExtractedServiceData> {
  const startTime = performance.now();
  const id = generateId();

  // First, apply local corrections for immediate improvement (outside try-catch for fallback access)
  const localCorrection = correctAndStandardizeService(userInput);

  try {
    const contextPrompt = userContext ? `
    User Context:
    - Location: ${userContext.location?.city}, ${userContext.location?.state}
    - Preferred budget: $${userContext.preferences?.budgetRange?.min}-$${userContext.preferences?.budgetRange?.max}
    - Service radius: ${userContext.preferences?.serviceRadius} miles
    - Previous services: ${userContext.serviceHistory?.favoriteCategories?.join(', ')}
    ` : '';
    console.log('Local correction applied:', {
      original: userInput,
      corrected: localCorrection.corrected,
      standardized: localCorrection.standardized,
      confidence: localCorrection.confidence
    });

    const analysisPrompt = `You are an expert automotive service advisor with spell-check capabilities. Analyze this user input and extract comprehensive information.

    IMPORTANT: First correct any spelling errors in automotive terms, then provide standardized service names.

    Original User Input: "${userInput}"
    Pre-corrected Input: "${localCorrection.corrected}"
    Suggested Service: "${localCorrection.standardized}"
    ${contextPrompt}

    Common automotive spelling corrections:
    - "oild" → "oil"
    - "braek" → "brake"
    - "battary" → "battery"
    - "tyre" → "tire"
    - "transmision" → "transmission"
    - "maintanance" → "maintenance"

    Standard service names to use:
    - Oil Change, Brake Service, Tire Rotation, Battery Replacement, AC Service, Vehicle Inspection, Tune Up

    Extract and infer information in this JSON format:

    {
      "serviceInfo": {
        "primaryService": "CORRECTED and standardized service name (e.g., 'Oil Change' not 'oild change')",
        "secondaryServices": ["related services that might be needed"],
        "category": "service category",
        "urgencyLevel": "low|medium|high|emergency (based on symptoms)",
        "recommendedAction": "what user should do next",
        "confidence": 85
      },
      "userContext": {
        "symptoms": ["specific symptoms mentioned"],
        "duration": "how long problem exists",
        "frequency": "how often it happens",
        "drivingConditions": ["where/how they drive"],
        "recentServices": ["recently performed services mentioned"],
        "concerns": ["user's main concerns"],
        "budget": {
          "min": 100,
          "max": 500,
          "preferred": 300
        },
        "confidence": 80
      },
      "vehicleInfo": {
        "year": null,
        "make": "if mentioned",
        "model": "if mentioned",
        "mileage": "if mentioned",
        "confidence": 60
      },
      "technicalInfo": {
        "diagnosticCodes": [],
        "severity": "routine|recommended|needed|critical",
        "recommendedMaintenance": ["what should be checked/done"],
        "confidence": 70
      },
      "timeline": {
        "isUrgent": false,
        "estimatedCompletionTime": "estimated service time",
        "confidence": 65
      },
      "overallConfidence": 75
    }

    ANALYZE FOR:
    - Symptoms and their severity
    - Urgency indicators (grinding, squeaking, not starting, etc.)
    - Vehicle information if mentioned
    - Driving patterns and conditions
    - Budget hints or constraints
    - Timeline requirements
    - Safety concerns

    Be thorough in extracting symptoms and understanding urgency.`;

    const completion = await rateLimitedRequest(() => openrouter.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    }));

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from text model');
    }

    // Parse the AI response
    let parsedData: any;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      parsedData = createFallbackTextData(userInput, response);
    }

    const processingTime = performance.now() - startTime;

    // Build comprehensive ExtractedServiceData
    const extractedData: ExtractedServiceData = {
      id,
      timestamp: new Date(),
      source: 'text_input',

      serviceInfo: {
        primaryService: parsedData.serviceInfo?.primaryService || cleanUserInput(userInput),
        secondaryServices: parsedData.serviceInfo?.secondaryServices || [],
        category: parsedData.serviceInfo?.category || 'General',
        urgencyLevel: parsedData.serviceInfo?.urgencyLevel || 'medium',
        recommendedAction: parsedData.serviceInfo?.recommendedAction || 'Get professional diagnosis',
        confidence: createConfidence(parsedData.serviceInfo?.confidence || 60, 'ai_extraction')
      },

      vehicleInfo: {
        year: parsedData.vehicleInfo?.year || undefined,
        make: parsedData.vehicleInfo?.make || undefined,
        model: parsedData.vehicleInfo?.model || undefined,
        mileage: parsedData.vehicleInfo?.mileage || undefined,
        confidence: createConfidence(parsedData.vehicleInfo?.confidence || 20, 'ai_extraction')
      },

      pricing: {
        currency: 'USD',
        breakdown: [],
        confidence: createConfidence(0, 'ai_extraction')
      },

      shopInfo: {
        confidence: createConfidence(0, 'ai_extraction')
      },

      technicalInfo: {
        diagnosticCodes: parsedData.technicalInfo?.diagnosticCodes || [],
        partNumbers: [],
        recommendedMaintenance: parsedData.technicalInfo?.recommendedMaintenance || [],
        severity: parsedData.technicalInfo?.severity || 'routine',
        confidence: createConfidence(parsedData.technicalInfo?.confidence || 50, 'ai_extraction')
      },

      timeline: {
        isUrgent: parsedData.timeline?.isUrgent || false,
        estimatedCompletionTime: parsedData.timeline?.estimatedCompletionTime || undefined,
        confidence: createConfidence(parsedData.timeline?.confidence || 45, 'ai_extraction')
      },

      userContext: {
        symptoms: parsedData.userContext?.symptoms || [],
        duration: parsedData.userContext?.duration || undefined,
        frequency: parsedData.userContext?.frequency || undefined,
        drivingConditions: parsedData.userContext?.drivingConditions || [],
        recentServices: parsedData.userContext?.recentServices || [],
        concerns: parsedData.userContext?.concerns || [],
        budget: parsedData.userContext?.budget || undefined,
        confidence: createConfidence(parsedData.userContext?.confidence || 70, 'ai_extraction')
      },

      rawData: {
        originalText: userInput,
        extractedText: response,
        aiResponse: response,
        processingTime
      }
    };

    return extractedData;

  } catch (error) {
    console.error('Error processing service text:', error);
    const processingTime = performance.now() - startTime;

    // Return corrected data using local processing as fallback
    console.log('Using local correction as fallback due to AI error');
    return {
      id,
      timestamp: new Date(),
      source: 'text_input',
      serviceInfo: {
        primaryService: localCorrection.standardized,
        secondaryServices: [],
        category: 'General',
        urgencyLevel: 'medium',
        recommendedAction: 'Get professional consultation',
        confidence: createConfidence(localCorrection.confidence, 'pattern_match')
      },
      vehicleInfo: { confidence: createConfidence(0, 'ai_extraction') },
      pricing: { currency: 'USD', breakdown: [], confidence: createConfidence(0, 'ai_extraction') },
      shopInfo: { confidence: createConfidence(0, 'ai_extraction') },
      technicalInfo: {
        diagnosticCodes: [],
        partNumbers: [],
        recommendedMaintenance: [],
        severity: 'routine',
        confidence: createConfidence(0, 'ai_extraction')
      },
      timeline: { isUrgent: false, confidence: createConfidence(0, 'ai_extraction') },
      userContext: {
        symptoms: [userInput],
        drivingConditions: [],
        recentServices: [],
        concerns: [],
        confidence: createConfidence(50, 'user_input')
      },
      rawData: {
        originalText: userInput,
        aiResponse: `Error: ${(error as Error).message}`,
        processingTime
      }
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
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
}

function createFallbackData(response: string): any {
  // Create basic structured data from unstructured response
  return {
    serviceInfo: {
      primaryService: extractServiceFromText(response),
      confidence: 30
    },
    extractedText: response,
    overallConfidence: 30
  };
}

function createFallbackTextData(userInput: string, response: string): any {
  return {
    serviceInfo: {
      primaryService: cleanUserInput(userInput),
      confidence: 40
    },
    userContext: {
      symptoms: [userInput],
      confidence: 60
    },
    overallConfidence: 40
  };
}

function extractServiceFromText(text: string): string {
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
  return input
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Test function
export async function testEnhancedConnection(): Promise<boolean> {
  try {
    const completion = await rateLimitedRequest(() => openrouter.chat.completions.create({
      model: TEXT_MODEL,
      messages: [{ role: 'user', content: 'Respond with "Enhanced API connection successful"' }],
      max_tokens: 50
    }));
    return !!completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('Enhanced OpenRouter connection test failed:', error);
    return false;
  }
}