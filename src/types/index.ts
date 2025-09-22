// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  type: 'customer' | 'mechanic';
  createdAt: Date;
}

export interface Customer extends User {
  type: 'customer';
  vehicles: Vehicle[];
}

export interface Mechanic extends User {
  type: 'mechanic';
  shopId: string;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage?: number;
}

// Base Types
export interface PriceRange {
  min: number;
  max: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Part {
  id: string;
  name: string;
  brand?: string;
  priceRange: PriceRange;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  estimatedTime: number; // in hours
  priceRange: PriceRange;
  commonParts?: Part[];
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

// Shop Types
export interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  services: Service[];
  specialties: string[];
  serviceRadius: number;
  hours: BusinessHours;
}

// Quote Types
export interface Quote {
  id: string;
  customerId: string;
  shopId: string;
  vehicleId: string;
  serviceId: string;
  status: 'pending' | 'sent' | 'approved' | 'rejected' | 'completed';
  estimatedCost: {
    parts: number;
    labor: number;
    total: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface ServiceRequest {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceId: string;
  description: string;
  preferredDate?: Date;
  location: {
    zipCode: string;
    radius: number;
  };
  quotes: Quote[];
  status: 'open' | 'quoted' | 'booked' | 'completed' | 'cancelled';
  createdAt: Date;
}