export interface VehicleModel {
  name: string;
  popularity: number;
}

export interface VehicleMake {
  name: string;
  models: VehicleModel[];
}

export const vehicleYears = Array.from({ length: 30 }, (_, i) => 2025 - i);

export const vehicleMakes: VehicleMake[] = [
  {
    name: "Toyota",
    models: [
      { name: "Camry", popularity: 95 },
      { name: "Corolla", popularity: 92 },
      { name: "RAV4", popularity: 90 },
      { name: "Highlander", popularity: 85 },
      { name: "Prius", popularity: 82 },
      { name: "Tacoma", popularity: 80 },
      { name: "Sienna", popularity: 75 },
      { name: "4Runner", popularity: 72 },
      { name: "Avalon", popularity: 68 },
      { name: "Tundra", popularity: 65 }
    ]
  },
  {
    name: "Honda",
    models: [
      { name: "Civic", popularity: 94 },
      { name: "Accord", popularity: 91 },
      { name: "CR-V", popularity: 88 },
      { name: "Pilot", popularity: 83 },
      { name: "Odyssey", popularity: 78 },
      { name: "HR-V", popularity: 75 },
      { name: "Passport", popularity: 72 },
      { name: "Ridgeline", popularity: 68 },
      { name: "Insight", popularity: 65 },
      { name: "Fit", popularity: 62 }
    ]
  },
  {
    name: "Ford",
    models: [
      { name: "F-150", popularity: 96 },
      { name: "Escape", popularity: 87 },
      { name: "Explorer", popularity: 84 },
      { name: "Focus", popularity: 79 },
      { name: "Mustang", popularity: 76 },
      { name: "Fusion", popularity: 73 },
      { name: "Edge", popularity: 70 },
      { name: "Expedition", popularity: 67 },
      { name: "Ranger", popularity: 64 },
      { name: "Bronco", popularity: 61 }
    ]
  },
  {
    name: "Chevrolet",
    models: [
      { name: "Silverado", popularity: 93 },
      { name: "Equinox", popularity: 86 },
      { name: "Malibu", popularity: 81 },
      { name: "Traverse", popularity: 78 },
      { name: "Tahoe", popularity: 75 },
      { name: "Cruze", popularity: 72 },
      { name: "Suburban", popularity: 69 },
      { name: "Colorado", popularity: 66 },
      { name: "Impala", popularity: 63 },
      { name: "Blazer", popularity: 60 }
    ]
  },
  {
    name: "Nissan",
    models: [
      { name: "Altima", popularity: 89 },
      { name: "Rogue", popularity: 86 },
      { name: "Sentra", popularity: 81 },
      { name: "Pathfinder", popularity: 76 },
      { name: "Versa", popularity: 73 },
      { name: "Murano", popularity: 70 },
      { name: "Frontier", popularity: 67 },
      { name: "Armada", popularity: 64 },
      { name: "Maxima", popularity: 61 },
      { name: "Kicks", popularity: 58 }
    ]
  },
  {
    name: "BMW",
    models: [
      { name: "3 Series", popularity: 91 },
      { name: "X3", popularity: 87 },
      { name: "5 Series", popularity: 83 },
      { name: "X5", popularity: 79 },
      { name: "X1", popularity: 75 },
      { name: "7 Series", popularity: 71 },
      { name: "X7", popularity: 67 },
      { name: "2 Series", popularity: 63 },
      { name: "4 Series", popularity: 59 },
      { name: "8 Series", popularity: 55 }
    ]
  },
  {
    name: "Mercedes-Benz",
    models: [
      { name: "C-Class", popularity: 89 },
      { name: "GLE", popularity: 85 },
      { name: "E-Class", popularity: 81 },
      { name: "GLC", popularity: 77 },
      { name: "S-Class", popularity: 73 },
      { name: "GLA", popularity: 69 },
      { name: "GLB", popularity: 65 },
      { name: "GLS", popularity: 61 },
      { name: "A-Class", popularity: 57 },
      { name: "CLA", popularity: 53 }
    ]
  },
  {
    name: "Audi",
    models: [
      { name: "A4", popularity: 87 },
      { name: "Q5", popularity: 83 },
      { name: "A3", popularity: 78 },
      { name: "Q7", popularity: 74 },
      { name: "A6", popularity: 70 },
      { name: "Q3", popularity: 66 },
      { name: "A8", popularity: 62 },
      { name: "Q8", popularity: 58 },
      { name: "A5", popularity: 54 },
      { name: "TT", popularity: 50 }
    ]
  },
  {
    name: "Hyundai",
    models: [
      { name: "Elantra", popularity: 88 },
      { name: "Tucson", popularity: 84 },
      { name: "Santa Fe", popularity: 79 },
      { name: "Sonata", popularity: 75 },
      { name: "Accent", popularity: 71 },
      { name: "Palisade", popularity: 67 },
      { name: "Kona", popularity: 63 },
      { name: "Venue", popularity: 59 },
      { name: "Genesis", popularity: 55 },
      { name: "Veloster", popularity: 51 }
    ]
  },
  {
    name: "Kia",
    models: [
      { name: "Forte", popularity: 86 },
      { name: "Sportage", popularity: 82 },
      { name: "Sorento", popularity: 77 },
      { name: "Optima", popularity: 73 },
      { name: "Soul", popularity: 69 },
      { name: "Telluride", popularity: 65 },
      { name: "Rio", popularity: 61 },
      { name: "Niro", popularity: 57 },
      { name: "Stinger", popularity: 53 },
      { name: "Seltos", popularity: 49 }
    ]
  }
];

// Service pricing data based on vehicle type and service
export interface ServicePricing {
  service: string;
  economyCars: { parts: number; labor: number; total: number };
  midRangeCars: { parts: number; labor: number; total: number };
  luxuryCars: { parts: number; labor: number; total: number };
  general: { parts: number; labor: number; total: number };
}

export const servicePricing: ServicePricing[] = [
  {
    service: "Oil Change",
    economyCars: { parts: 35, labor: 25, total: 60 },
    midRangeCars: { parts: 45, labor: 30, total: 75 },
    luxuryCars: { parts: 85, labor: 45, total: 130 },
    general: { parts: 40, labor: 30, total: 70 }
  },
  {
    service: "Brake Service",
    economyCars: { parts: 150, labor: 100, total: 250 },
    midRangeCars: { parts: 220, labor: 120, total: 340 },
    luxuryCars: { parts: 350, labor: 150, total: 500 },
    general: { parts: 200, labor: 120, total: 320 }
  },
  {
    service: "Brake Pad Replacement",
    economyCars: { parts: 80, labor: 70, total: 150 },
    midRangeCars: { parts: 120, labor: 85, total: 205 },
    luxuryCars: { parts: 200, labor: 100, total: 300 },
    general: { parts: 100, labor: 80, total: 180 }
  },
  {
    service: "Battery Replacement",
    economyCars: { parts: 120, labor: 20, total: 140 },
    midRangeCars: { parts: 150, labor: 25, total: 175 },
    luxuryCars: { parts: 250, labor: 35, total: 285 },
    general: { parts: 140, labor: 25, total: 165 }
  },
  {
    service: "Tire Service",
    economyCars: { parts: 300, labor: 40, total: 340 },
    midRangeCars: { parts: 450, labor: 50, total: 500 },
    luxuryCars: { parts: 800, labor: 60, total: 860 },
    general: { parts: 400, labor: 50, total: 450 }
  },
  {
    service: "Tire Rotation",
    economyCars: { parts: 0, labor: 25, total: 25 },
    midRangeCars: { parts: 0, labor: 30, total: 30 },
    luxuryCars: { parts: 0, labor: 40, total: 40 },
    general: { parts: 0, labor: 30, total: 30 }
  },
  {
    service: "AC Service",
    economyCars: { parts: 80, labor: 60, total: 140 },
    midRangeCars: { parts: 120, labor: 80, total: 200 },
    luxuryCars: { parts: 200, labor: 120, total: 320 },
    general: { parts: 100, labor: 80, total: 180 }
  },
  {
    service: "Transmission Service",
    economyCars: { parts: 150, labor: 120, total: 270 },
    midRangeCars: { parts: 200, labor: 150, total: 350 },
    luxuryCars: { parts: 350, labor: 200, total: 550 },
    general: { parts: 180, labor: 140, total: 320 }
  },
  {
    service: "Air Filter Replacement",
    economyCars: { parts: 15, labor: 20, total: 35 },
    midRangeCars: { parts: 25, labor: 25, total: 50 },
    luxuryCars: { parts: 45, labor: 30, total: 75 },
    general: { parts: 20, labor: 25, total: 45 }
  },
  {
    service: "Tune Up",
    economyCars: { parts: 120, labor: 80, total: 200 },
    midRangeCars: { parts: 180, labor: 100, total: 280 },
    luxuryCars: { parts: 300, labor: 150, total: 450 },
    general: { parts: 150, labor: 100, total: 250 }
  },
  {
    service: "Vehicle Inspection",
    economyCars: { parts: 0, labor: 50, total: 50 },
    midRangeCars: { parts: 0, labor: 60, total: 60 },
    luxuryCars: { parts: 0, labor: 80, total: 80 },
    general: { parts: 0, labor: 60, total: 60 }
  }
];

export function getVehicleCategory(make: string): 'economy' | 'midRange' | 'luxury' {
  const luxuryMakes = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Acura', 'Infiniti', 'Cadillac', 'Lincoln'];
  const economyMakes = ['Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Chevrolet', 'Ford'];

  if (luxuryMakes.includes(make)) return 'luxury';
  if (economyMakes.includes(make)) return 'economy';
  return 'midRange';
}

export function getServiceEstimate(serviceName: string, make?: string): {
  parts: number;
  labor: number;
  total: number;
  category: string;
} {
  const service = servicePricing.find(s =>
    s.service.toLowerCase() === serviceName.toLowerCase() ||
    serviceName.toLowerCase().includes(s.service.toLowerCase())
  );

  if (!service) {
    return { parts: 50, labor: 80, total: 130, category: 'general' };
  }

  if (!make) {
    return { ...service.general, category: 'general' };
  }

  const category = getVehicleCategory(make);
  switch (category) {
    case 'economy':
      return { ...service.economyCars, category: 'economy' };
    case 'luxury':
      return { ...service.luxuryCars, category: 'luxury' };
    default:
      return { ...service.midRangeCars, category: 'mid-range' };
  }
}