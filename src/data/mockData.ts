import type { Shop, Service, ServiceCategory, Vehicle } from '../types';

export const serviceCategories: ServiceCategory[] = [
  { id: '1', name: 'Maintenance', icon: '🔧' },
  { id: '2', name: 'Brakes', icon: '🛑' },
  { id: '3', name: 'Engine', icon: '⚙️' },
  { id: '4', name: 'Electrical', icon: '⚡' },
  { id: '5', name: 'Tires', icon: '🚗' },
  { id: '6', name: 'Body Work', icon: '🔨' },
];

export const services: Service[] = [
  {
    id: '1',
    name: 'Oil Change',
    category: serviceCategories[0],
    description: 'Standard oil change service with filter replacement',
    estimatedTime: 0.5,
    priceRange: { min: 35, max: 75 },
  },
  {
    id: '2',
    name: 'Brake Pad Replacement',
    category: serviceCategories[1],
    description: 'Replace front or rear brake pads',
    estimatedTime: 1.5,
    priceRange: { min: 150, max: 300 },
  },
  {
    id: '3',
    name: 'Battery Replacement',
    category: serviceCategories[3],
    description: 'Replace car battery with new one',
    estimatedTime: 0.5,
    priceRange: { min: 100, max: 200 },
  },
  {
    id: '4',
    name: 'Tire Rotation',
    category: serviceCategories[4],
    description: 'Rotate tires for even wear',
    estimatedTime: 0.5,
    priceRange: { min: 20, max: 50 },
  },
  {
    id: '5',
    name: 'Engine Diagnostic',
    category: serviceCategories[2],
    description: 'Computer diagnostic to identify engine issues',
    estimatedTime: 1,
    priceRange: { min: 80, max: 150 },
  },
];

export const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Quick Fix Auto',
    address: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    phone: '(555) 123-4567',
    email: 'info@quickfixauto.com',
    website: 'www.quickfixauto.com',
    rating: 4.5,
    reviewCount: 127,
    services: services,
    specialties: ['European Cars', 'Quick Service'],
    serviceRadius: 10,
    hours: {
      monday: { open: '8:00', close: '18:00' },
      tuesday: { open: '8:00', close: '18:00' },
      wednesday: { open: '8:00', close: '18:00' },
      thursday: { open: '8:00', close: '18:00' },
      friday: { open: '8:00', close: '18:00' },
      saturday: { open: '9:00', close: '15:00' },
      sunday: { closed: true, open: '', close: '' },
    },
  },
  {
    id: '2',
    name: 'Elite Automotive',
    address: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90002',
    phone: '(555) 234-5678',
    email: 'service@eliteauto.com',
    rating: 4.8,
    reviewCount: 89,
    services: services,
    specialties: ['Luxury Cars', 'Performance Tuning'],
    serviceRadius: 15,
    hours: {
      monday: { open: '7:30', close: '17:30' },
      tuesday: { open: '7:30', close: '17:30' },
      wednesday: { open: '7:30', close: '17:30' },
      thursday: { open: '7:30', close: '17:30' },
      friday: { open: '7:30', close: '17:30' },
      saturday: { open: '8:00', close: '14:00' },
      sunday: { closed: true, open: '', close: '' },
    },
  },
  {
    id: '3',
    name: 'Family Car Care',
    address: '789 Elm Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90003',
    phone: '(555) 345-6789',
    rating: 4.3,
    reviewCount: 215,
    services: services,
    specialties: ['Family Vehicles', 'Affordable Service'],
    serviceRadius: 20,
    hours: {
      monday: { open: '8:00', close: '19:00' },
      tuesday: { open: '8:00', close: '19:00' },
      wednesday: { open: '8:00', close: '19:00' },
      thursday: { open: '8:00', close: '19:00' },
      friday: { open: '8:00', close: '19:00' },
      saturday: { open: '9:00', close: '17:00' },
      sunday: { open: '10:00', close: '16:00' },
    },
  },
];

export const carMakes = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Mazda',
  'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia'
];

export const carModels: { [key: string]: string[] } = {
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Tacoma'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'Odyssey'],
  'Ford': ['F-150', 'Explorer', 'Mustang', 'Escape', 'Focus', 'Edge'],
  'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Camaro', 'Colorado'],
  'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Maxima', 'Frontier'],
  'Mazda': ['Mazda3', 'CX-5', 'CX-9', 'Mazda6', 'MX-5 Miata', 'CX-30'],
  'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Arteon'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', '7 Series', 'X1'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class', 'A-Class'],
  'Audi': ['A4', 'Q5', 'A6', 'Q7', 'A3', 'Q3'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Palisade'],
  'Kia': ['Forte', 'Optima', 'Sportage', 'Sorento', 'Soul', 'Telluride']
};

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    userId: 'user1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    mileage: 35000,
  },
  {
    id: '2',
    userId: 'user1',
    make: 'Honda',
    model: 'CR-V',
    year: 2019,
    mileage: 42000,
  },
];