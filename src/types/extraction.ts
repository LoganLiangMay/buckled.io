// Enhanced data extraction types for automotive service information

export interface ConfidenceScore {
  value: number; // 0-100
  source: 'ai_extraction' | 'user_input' | 'manual_correction' | 'pattern_match';
}

// Comprehensive service data extracted from documents or user input
export interface ExtractedServiceData {
  id: string;
  timestamp: Date;
  source: 'document_upload' | 'text_input' | 'manual_entry';

  // Core service information
  serviceInfo: {
    primaryService: string;
    secondaryServices: string[];
    category: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    recommendedAction: string;
    confidence: ConfidenceScore;
  };

  // Vehicle details
  vehicleInfo: {
    year?: number;
    make?: string;
    model?: string;
    vin?: string;
    mileage?: number;
    engineType?: string;
    transmission?: string;
    color?: string;
    licensePlate?: string;
    confidence: ConfidenceScore;
  };

  // Pricing breakdown
  pricing: {
    partsTotal?: number;
    laborTotal?: number;
    subtotal?: number;
    taxes?: number;
    discounts?: number;
    finalTotal?: number;
    currency: string;
    breakdown: Array<{
      item: string;
      quantity?: number;
      unitPrice?: number;
      total: number;
      category: 'parts' | 'labor' | 'fee' | 'tax' | 'discount';
    }>;
    confidence: ConfidenceScore;
  };

  // Shop/Service provider information
  shopInfo: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    technicianName?: string;
    shopLicense?: string;
    confidence: ConfidenceScore;
  };

  // Technical details
  technicalInfo: {
    diagnosticCodes: string[];
    partNumbers: string[];
    serviceIntervals?: number; // in miles or months
    warrantyInfo?: string;
    recommendedMaintenance: string[];
    severity: 'routine' | 'recommended' | 'needed' | 'critical';
    confidence: ConfidenceScore;
  };

  // Timeline and scheduling
  timeline: {
    estimatedCompletionTime?: string; // e.g., "2-3 hours"
    scheduledDate?: Date;
    preferredDate?: Date;
    dueDate?: Date;
    isUrgent: boolean;
    nextServiceDate?: Date;
    confidence: ConfidenceScore;
  };

  // User symptoms and context (for text input)
  userContext?: {
    symptoms: string[];
    duration?: string;
    frequency?: string;
    drivingConditions: string[];
    recentServices: string[];
    concerns: string[];
    budget?: {
      min?: number;
      max?: number;
      preferred?: number;
    };
    confidence: ConfidenceScore;
  };

  // Raw data preservation
  rawData: {
    originalText?: string;
    extractedText?: string;
    imageMetadata?: {
      fileName: string;
      fileSize: number;
      mimeType: string;
      uploadTime: Date;
    };
    aiResponse: string;
    processingTime: number;
  };
}

// User session and preference data
export interface UserSessionData {
  sessionId: string;
  createdAt: Date;
  lastActive: Date;

  // User preferences
  preferences: {
    preferredShops: string[];
    budgetRange: { min: number; max: number };
    serviceRadius: number; // miles
    preferredBrands: string[];
    communicationMethod: 'email' | 'phone' | 'text';
    urgencyPreference: 'cost' | 'quality' | 'speed';
  };

  // Location context
  location: {
    zipCode?: string;
    city?: string;
    state?: string;
    coordinates?: { lat: number; lng: number };
    lastUpdated: Date;
  };

  // Service history summary
  serviceHistory: {
    totalServices: number;
    lastServiceDate?: Date;
    favoriteCategories: string[];
    averageSpending: number;
    frequentShops: string[];
  };
}

// Comprehensive vehicle profile built from extractions
export interface VehicleProfile {
  id: string;
  createdAt: Date;
  lastUpdated: Date;

  // Vehicle identification
  identity: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    vin?: string;
    licensePlate?: string;
    color?: string;
    nickname?: string; // user-given name
    confidence: ConfidenceScore;
  };

  // Technical specifications
  specifications: {
    engineType?: string;
    engineSize?: string;
    transmission?: string;
    drivetrain?: string;
    fuelType?: string;
    mileage?: number;
    lastMileageUpdate: Date;
    confidence: ConfidenceScore;
  };

  // Service history
  serviceHistory: Array<{
    date: Date;
    service: string;
    mileage?: number;
    shopName?: string;
    cost?: number;
    extractedDataId: string; // Reference to ExtractedServiceData
  }>;

  // Maintenance predictions
  maintenanceSchedule: Array<{
    service: string;
    dueAt: 'mileage' | 'time' | 'condition';
    dueMileage?: number;
    dueDate?: Date;
    priority: 'low' | 'medium' | 'high';
    estimatedCost?: { min: number; max: number };
    lastPerformed?: Date;
  }>;

  // Known issues and patterns
  knownIssues: Array<{
    issue: string;
    firstReported: Date;
    lastReported: Date;
    frequency: number;
    resolved: boolean;
    cost?: number;
  }>;

  // User notes and custom data
  userNotes: string;
  tags: string[];
  isActive: boolean;
}

// Storage interfaces for local persistence
export interface StorageManager {
  // Service data operations
  saveExtractedData(data: ExtractedServiceData): Promise<void>;
  getExtractedData(id: string): Promise<ExtractedServiceData | null>;
  getAllExtractedData(): Promise<ExtractedServiceData[]>;
  deleteExtractedData(id: string): Promise<void>;

  // User session operations
  saveUserSession(session: UserSessionData): Promise<void>;
  getUserSession(): Promise<UserSessionData | null>;
  updateUserPreferences(preferences: Partial<UserSessionData['preferences']>): Promise<void>;

  // Vehicle profile operations
  saveVehicleProfile(profile: VehicleProfile): Promise<void>;
  getVehicleProfile(id: string): Promise<VehicleProfile | null>;
  getAllVehicleProfiles(): Promise<VehicleProfile[]>;
  updateVehicleProfile(id: string, updates: Partial<VehicleProfile>): Promise<void>;
  deleteVehicleProfile(id: string): Promise<void>;

  // Search and analytics
  searchExtractedData(query: string): Promise<ExtractedServiceData[]>;
  getServiceStats(): Promise<{
    totalServices: number;
    totalSpent: number;
    averageServiceCost: number;
    topServices: Array<{ service: string; count: number }>;
    topShops: Array<{ shop: string; count: number }>;
  }>;

  // Data management
  exportAllData(): Promise<string>; // JSON export
  importData(jsonData: string): Promise<void>;
  clearAllData(): Promise<void>;
}

// Analysis and recommendation types
export interface ServiceRecommendation {
  service: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedCost: { min: number; max: number };
  dueBy?: Date;
  dueMileage?: number;
  confidence: number;
  sources: string[]; // What data led to this recommendation
}

export interface SmartInsights {
  vehicleId: string;
  generatedAt: Date;

  // Upcoming maintenance
  upcomingServices: ServiceRecommendation[];

  // Cost analysis
  costTrends: {
    averageMonthlySpend: number;
    costByCategory: Array<{ category: string; total: number; percentage: number }>;
    savingsOpportunities: string[];
  };

  // Pattern recognition
  patterns: {
    preferredShops: string[];
    commonServices: string[];
    seasonalPatterns: Array<{ season: string; services: string[] }>;
    costPatterns: string[];
  };

  // Alerts and warnings
  alerts: Array<{
    type: 'maintenance_due' | 'price_alert' | 'pattern_detected' | 'urgent_service';
    message: string;
    severity: 'info' | 'warning' | 'error';
    actionRequired: boolean;
  }>;
}