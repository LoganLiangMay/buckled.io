import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car, Plus, Search, MapPin, DollarSign, Clock, ChevronRight, Paperclip, ArrowRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { services, carMakes } from '../data/mockData';
import { processServiceText, analyzeServiceDocument } from '../services/enhancedOpenRouter';
import { smartContextManager } from '../services/smartContext';
import storageManager from '../services/storageManager';
import ServiceDataViewer from '../components/ServiceDataViewer';
import VehicleForm from '../components/VehicleForm';
import type { Service } from '../types';
import logoImage from '../assets/logo.png';

const CustomerApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedDataId, setExtractedDataId] = useState<string | null>(null);
  const [showDataViewer, setShowDataViewer] = useState(false);

  // Get service and dataId from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const serviceParam = urlParams.get('service');
    const dataId = urlParams.get('dataId');

    if (serviceParam) {
      setSearchQuery(serviceParam);
      // Auto-select matching service
      const matchingService = services.find(s =>
        s.name.toLowerCase().includes(serviceParam.toLowerCase())
      );
      if (matchingService) {
        setSelectedService(matchingService);
      }
    }

    if (dataId) {
      setExtractedDataId(dataId);
      setShowDataViewer(true);
    }
  }, [location.search]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSearchQuery(service.name);
  };

  // Validate zip code (basic US zip code validation)
  const isValidZipCode = (zip: string): boolean => {
    const zipPattern = /^\d{5}(-\d{4})?$/;
    return zipPattern.test(zip.trim());
  };

  const handleFindShops = () => {
    if (!zipCode.trim()) {
      alert('Please enter a ZIP code');
      return;
    }

    if (!isValidZipCode(zipCode)) {
      alert('Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');
      return;
    }

    // Navigate to shops page with zip code and service
    const params = new URLSearchParams();
    params.append('zip', zipCode.trim());
    if (selectedService) {
      params.append('service', selectedService.name);
    }
    navigate(`/shops?${params.toString()}`);
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 min-h-screen bg-gray-50">
        <div className="flex max-w-7xl mx-auto">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-16 p-4">
            <div className="space-y-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={logoImage} alt="Buckled Logo" className="w-10 h-10" />
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-600" />
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-600" />
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4">
            {/* Top Section - Service Search */}
            <Card className="mb-8 bg-white">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Which service do you need?</h1>
                {isProcessing && (
                  <p className="text-sm text-blue-600 mb-2">
                    🤖 AI is analyzing your request...
                  </p>
                )}
                <div className="max-w-2xl mx-auto relative">
                  <Input
                    placeholder="Search or attach the quote..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 py-4 text-lg"
                    icon={<Search className="w-5 h-5 text-gray-400" />}
                  />
                  <label className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-600 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
                        if (!allowedTypes.includes(file.type)) {
                          alert('Please upload an image (JPEG, PNG, WebP) or PDF file.');
                          return;
                        }

                        setIsProcessing(true);
                        try {
                          // Get user context for enhanced processing
                          const userSession = await storageManager.getUserSession();

                          // Use enhanced AI to analyze the uploaded document
                          const extractedData = await analyzeServiceDocument(file, userSession || undefined);

                          if (extractedData.serviceInfo.primaryService &&
                              extractedData.serviceInfo.primaryService !== 'Document Analysis Failed') {

                            // Process the data through smart context manager
                            const processedResult = await smartContextManager.processExtractedData(extractedData);

                            // Update UI with extracted service
                            setSearchQuery(extractedData.serviceInfo.primaryService);
                            setExtractedDataId(extractedData.id);
                            setShowDataViewer(true);

                            // Try to find matching service
                            const matchingService = services.find(s =>
                              s.name.toLowerCase().includes(extractedData.serviceInfo.primaryService.toLowerCase())
                            );
                            if (matchingService) {
                              setSelectedService(matchingService);
                            }

                            console.log('Enhanced document analysis completed:', {
                              fileName: file.name,
                              extractedService: extractedData.serviceInfo.primaryService,
                              confidence: extractedData.serviceInfo.confidence.value,
                              vehicleInfo: extractedData.vehicleInfo,
                              pricing: extractedData.pricing.finalTotal || extractedData.pricing.subtotal,
                              recommendations: processedResult.recommendations.length
                            });
                          } else {
                            alert('Could not extract service information from the document. Please try typing your service need instead.');
                          }
                        } catch (error) {
                          console.error('Error analyzing document:', error);
                          alert('Error analyzing document. Please try again or type your service need.');
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      className="hidden"
                      disabled={isProcessing}
                    />
                    <Paperclip className="w-5 h-5" />
                  </label>
                </div>

                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={() => {
                      setSearchQuery('Battery Replacement');
                      const batteryService = services.find(s => s.name.includes('Battery'));
                      if (batteryService) setSelectedService(batteryService);
                    }}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
                  >
                    Battery
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('Oil Change');
                      const oilService = services.find(s => s.name.includes('Oil'));
                      if (oilService) setSelectedService(oilService);
                    }}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
                  >
                    Oil
                  </button>
                  <button className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition">
                    Other
                  </button>
                  <Button
                    size="sm"
                    className="px-6"
                    disabled={isProcessing}
                    onClick={async () => {
                      if (!searchQuery.trim()) return;

                      setIsProcessing(true);
                      try {
                        // Get user context for enhanced processing
                        const userSession = await storageManager.getUserSession();

                        // Use enhanced AI to process and analyze the service text
                        const extractedData = await processServiceText(searchQuery, userSession || undefined);

                        // Process the data through smart context manager
                        const processedResult = await smartContextManager.processExtractedData(extractedData);

                        // Update search query with the processed service name
                        const serviceParam = extractedData.serviceInfo.primaryService;
                        setSearchQuery(serviceParam);
                        setExtractedDataId(extractedData.id);
                        setShowDataViewer(true);

                        // Try to find matching service
                        const matchingService = services.find(s =>
                          s.name.toLowerCase().includes(serviceParam.toLowerCase())
                        );
                        if (matchingService) {
                          setSelectedService(matchingService);
                        }

                        console.log('Enhanced text processing completed:', {
                          originalInput: searchQuery,
                          processedService: serviceParam,
                          confidence: extractedData.serviceInfo.confidence.value,
                          recommendations: processedResult.recommendations.length
                        });
                      } catch (error) {
                        console.error('Error processing service text:', error);
                        // Fallback to original search logic
                        const matchingService = services.find(s =>
                          s.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        if (matchingService) setSelectedService(matchingService);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                  >
                    {isProcessing ? 'Processing...' : 'Search'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Vehicle Information Form */}
            {searchQuery && (
              <VehicleForm
                serviceName={searchQuery}
                onEstimateGenerated={(estimate) => {
                  console.log('Cost estimate generated:', estimate);
                }}
              />
            )}

            {/* Enhanced Service Data Viewer */}
            {showDataViewer && extractedDataId && (
              <Card className="mb-8">
                <ServiceDataViewer
                  dataId={extractedDataId}
                  onClose={() => setShowDataViewer(false)}
                />
              </Card>
            )}

            {/* Service Details Section */}
            {selectedService && (
              <Card className="mb-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedService.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <select className="input-field">
                      <option>Year</option>
                      {Array.from({ length: 30 }, (_, i) => 2025 - i).map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <select className="input-field">
                      <option>Make</option>
                      {carMakes.map((make) => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                    <select className="input-field">
                      <option>Model</option>
                    </select>
                  </div>
                  <Button size="lg" className="px-8">Submit</Button>
                </div>

                {/* Price Display */}
                <div className="mt-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white text-center">
                  <h3 className="text-4xl font-bold mb-2">
                    ${selectedService.priceRange.min}-${selectedService.priceRange.max}
                  </h3>
                  <p className="text-lg text-purple-100 mb-4">Parts & Labor</p>
                  <p className="text-purple-100 mb-6">
                    For {selectedService.name.toLowerCase()}, you're looking at about $15-25 for labor and parts cost varies by vehicle.
                  </p>
                  <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                    View More
                  </Button>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Estimated Price</h4>
                    <p className="text-sm text-gray-600">Costs ${selectedService.priceRange.min}-${selectedService.priceRange.max}</p>
                    <div className="mt-3 px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm inline-block">
                      ${selectedService.priceRange.min}-${selectedService.priceRange.max}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Car className="w-6 h-6 text-red-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">How to replace</h4>
                    <p className="text-sm text-gray-600">{selectedService.description}</p>
                    <div className="mt-3 px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm inline-block">
                      Easy Start
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">How they diagnose</h4>
                    <p className="text-sm text-gray-600">Professional inspection and testing</p>
                    <div className="mt-3 px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm inline-block">
                      Test Required
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">How long it takes</h4>
                    <p className="text-sm text-gray-600">Takes {selectedService.estimatedTime} hours</p>
                    <div className="mt-3 px-4 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm inline-block">
                      {selectedService.estimatedTime}h work
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Professional help</h4>
                    <p className="text-sm text-gray-600">Expert technician assistance</p>
                    <div className="mt-3 px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm inline-block">
                      Pro Service
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <div className="flex justify-center gap-4">
                    <Button variant="outline">Learn More</Button>
                    <Button className="bg-gradient-brand">Find a Trusted Shop</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Bottom Section - Shop Finder */}
            <Card className="mb-8 bg-gradient-brand text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">Find A Trusted Shop Near You</h2>
                  <p className="text-white/90 mb-6">Browse our network of trusted partners and get quotes on your repair today.</p>
                  <div className="flex max-w-md">
                    <Input
                      placeholder="Enter ZIP Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleFindShops();
                        }
                      }}
                    />
                    <Button
                      variant="secondary"
                      className="ml-3 bg-white text-primary-600"
                      onClick={handleFindShops}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-48 h-32 bg-white/10 rounded-lg flex items-center justify-center">
                    <Car className="w-16 h-16 text-white/50" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Timeline Section */}
            <Card>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Your Car's Future Timeline</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-red-100 p-6 rounded-xl text-center">
                  <h3 className="font-bold text-red-700 mb-2">Battery Replacement</h3>
                  <p className="text-2xl font-bold text-red-600 mb-1">$75-200</p>
                  <p className="text-sm text-red-600">within one week</p>
                </div>
                <div className="bg-purple-100 p-6 rounded-xl text-center">
                  <h3 className="font-bold text-purple-700 mb-2">Tire Rotation</h3>
                  <p className="text-2xl font-bold text-purple-600 mb-1">$30-60</p>
                  <p className="text-sm text-purple-600">within one month</p>
                </div>
                <div className="bg-green-100 p-6 rounded-xl text-center">
                  <h3 className="font-bold text-green-700 mb-2">Cabin Air Filter</h3>
                  <p className="text-2xl font-bold text-green-600 mb-1">$50-120</p>
                  <p className="text-sm text-green-600">within your year</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-100 p-6 rounded-xl text-center">
                  <h3 className="font-bold text-purple-700 mb-2">Oil Change Service</h3>
                  <p className="text-2xl font-bold text-purple-600 mb-1">$60-120</p>
                  <p className="text-sm text-purple-600">within next month</p>
                </div>
                <div className="bg-green-100 p-6 rounded-xl text-center">
                  <h3 className="font-bold text-green-700 mb-2">Air Filter Replacement</h3>
                  <p className="text-2xl font-bold text-green-600 mb-1">$40-80</p>
                  <p className="text-sm text-green-600">within next month</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CustomerApp;