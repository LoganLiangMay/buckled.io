import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Phone, Globe, ArrowLeft, Filter, SortAsc } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

interface Shop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: number;
  address: string;
  phone: string;
  website?: string;
  specialties: string[];
  priceRange: '$' | '$$' | '$$$';
  hours: string;
  certifications: string[];
  image: string;
}

const ShopRecommendations: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [zipCode, setZipCode] = useState('');
  const [service, setService] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [filterByPrice, setFilterByPrice] = useState<string>('all');

  // Get parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const zipParam = urlParams.get('zip');
    const serviceParam = urlParams.get('service');

    if (zipParam) setZipCode(zipParam);
    if (serviceParam) setService(serviceParam);
  }, [location.search]);

  // Mock shop data - in real app, this would come from an API
  const shops: Shop[] = [
    {
      id: '1',
      name: 'Auto Car Plus',
      rating: 4.8,
      reviewCount: 342,
      distance: 0.8,
      address: '123 Main Street, ' + zipCode,
      phone: '(555) 123-4567',
      website: 'www.autocarplus.com',
      specialties: ['Oil Change', 'Brake Service', 'Engine Repair'],
      priceRange: '$$',
      hours: 'Mon-Fri 8AM-6PM, Sat 9AM-5PM',
      certifications: ['ASE Certified', 'AAA Approved'],
      image: '/api/placeholder/400/200'
    },
    {
      id: '2',
      name: 'Quick Fix Auto',
      rating: 4.6,
      reviewCount: 189,
      distance: 1.2,
      address: '456 Oak Avenue, ' + zipCode,
      phone: '(555) 987-6543',
      specialties: ['Quick Service', 'Tire Service', 'Battery Replacement'],
      priceRange: '$',
      hours: 'Mon-Sat 7AM-8PM, Sun 9AM-5PM',
      certifications: ['ASE Certified'],
      image: '/api/placeholder/400/200'
    },
    {
      id: '3',
      name: 'Premium Auto Care',
      rating: 4.9,
      reviewCount: 267,
      distance: 2.1,
      address: '789 Pine Street, ' + zipCode,
      phone: '(555) 456-7890',
      website: 'www.premiumautocare.com',
      specialties: ['Luxury Vehicles', 'Engine Diagnostics', 'Transmission'],
      priceRange: '$$$',
      hours: 'Mon-Fri 8AM-7PM, Sat 9AM-4PM',
      certifications: ['ASE Master Certified', 'BMW Certified', 'Mercedes Specialist'],
      image: '/api/placeholder/400/200'
    },
    {
      id: '4',
      name: 'Budget Auto Repair',
      rating: 4.3,
      reviewCount: 156,
      distance: 1.7,
      address: '321 Elm Drive, ' + zipCode,
      phone: '(555) 234-5678',
      specialties: ['Budget Repairs', 'Used Parts', 'Basic Maintenance'],
      priceRange: '$',
      hours: 'Mon-Fri 8AM-6PM',
      certifications: ['State Licensed'],
      image: '/api/placeholder/400/200'
    },
    {
      id: '5',
      name: 'Express Lube & More',
      rating: 4.5,
      reviewCount: 298,
      distance: 0.6,
      address: '654 Cedar Lane, ' + zipCode,
      phone: '(555) 345-6789',
      specialties: ['Oil Change', 'Fluid Services', 'Quick Inspections'],
      priceRange: '$',
      hours: 'Mon-Sun 7AM-9PM',
      certifications: ['Valvoline Certified', 'Mobil 1 Partner'],
      image: '/api/placeholder/400/200'
    },
    {
      id: '6',
      name: 'AutoTech Solutions',
      rating: 4.7,
      reviewCount: 223,
      distance: 3.2,
      address: '987 Maple Court, ' + zipCode,
      phone: '(555) 567-8901',
      website: 'www.autotechsolutions.com',
      specialties: ['Modern Diagnostics', 'Hybrid Vehicles', 'Electronics'],
      priceRange: '$$',
      hours: 'Mon-Fri 8AM-6PM, Sat 10AM-3PM',
      certifications: ['ASE Certified', 'Hybrid Specialist', 'Tesla Approved'],
      image: '/api/placeholder/400/200'
    }
  ];

  // Filter and sort shops
  const filteredAndSortedShops = shops
    .filter(shop => {
      if (filterByPrice === 'all') return true;
      return shop.priceRange === filterByPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          const priceOrder = { '$': 1, '$$': 2, '$$$': 3 };
          return priceOrder[a.priceRange] - priceOrder[b.priceRange];
        case 'distance':
        default:
          return a.distance - b.distance;
      }
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getPriceDisplay = (priceRange: string) => {
    const prices = { '$': 'Budget', '$$': 'Moderate', '$$$': 'Premium' };
    return prices[priceRange as keyof typeof prices] || priceRange;
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Trusted Shops Near {zipCode}
            </h1>
            {service && (
              <p className="text-xl text-gray-600">
                Showing results for "{service}"
              </p>
            )}
            <p className="text-gray-500 mt-2">
              {filteredAndSortedShops.length} shops found
            </p>
          </div>

          {/* Filters and Sort */}
          <Card className="mb-6 p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Filters:</span>
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={filterByPrice}
                  onChange={(e) => setFilterByPrice(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Price Ranges</option>
                  <option value="$">Budget ($)</option>
                  <option value="$$">Moderate ($$)</option>
                  <option value="$$$">Premium ($$$)</option>
                </select>

                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="distance">Sort by Distance</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="price">Sort by Price</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Shop Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedShops.map((shop) => (
              <Card key={shop.id} className="p-6 text-center">
                {/* Shop Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{shop.name}</h3>

                {/* Distance */}
                <div className="flex items-center justify-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="font-medium">{shop.distance} mi away</span>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex">{renderStars(shop.rating)}</div>
                  <span className="font-medium">{shop.rating}</span>
                  <span className="text-gray-500">({shop.reviewCount})</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    size="md"
                    className="w-full"
                    onClick={() => {
                      // Navigate to quote request (you can customize this)
                      alert(`Request quote from ${shop.name}`);
                    }}
                  >
                    Request A Quote
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={() => window.open(`tel:${shop.phone}`, '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredAndSortedShops.length === 0 && (
            <Card className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium mb-2">No shops found</h3>
                <p>Try adjusting your filters or search criteria.</p>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ShopRecommendations;