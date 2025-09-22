import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Upload, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Container from '../common/Container';
import { processServiceText, analyzeServiceDocument } from '../../services/enhancedOpenRouter';
import { smartContextManager } from '../../services/smartContext';
import storageManager from '../../services/storageManager';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [carIssue, setCarIssue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleJoinWaitlist = () => {
    console.log('Joining waitlist:', email);
  };

  const handleGetQuote = async () => {
    if (carIssue.trim()) {
      setIsProcessing(true);
      try {
        // Get user context for enhanced processing
        const userSession = await storageManager.getUserSession();

        // Use enhanced AI to process and analyze the service text
        const extractedData = await processServiceText(carIssue, userSession || undefined);

        // Process the data through smart context manager
        const processedResult = await smartContextManager.processExtractedData(extractedData);

        // Navigate to app with the processed service name
        const serviceParam = extractedData.serviceInfo.primaryService;
        navigate(`/app?service=${encodeURIComponent(serviceParam)}&dataId=${extractedData.id}`);

        // Log success for debugging
        console.log('Enhanced text processing completed:', {
          originalInput: carIssue,
          processedService: serviceParam,
          confidence: extractedData.serviceInfo.confidence.value,
          recommendations: processedResult.recommendations.length
        });

      } catch (error) {
        console.error('Error processing service text:', error);
        // Fallback to original text if AI processing fails
        navigate(`/app?service=${encodeURIComponent(carIssue)}`);
      } finally {
        setIsProcessing(false);
      }
    } else {
      navigate('/app');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image or PDF
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
        setCarIssue(extractedData.serviceInfo.primaryService);

        // Auto-navigate to app with comprehensive data
        navigate(`/app?service=${encodeURIComponent(extractedData.serviceInfo.primaryService)}&dataId=${extractedData.id}`);

        // Log success for debugging
        console.log('Enhanced document analysis completed:', {
          fileName: file.name,
          extractedService: extractedData.serviceInfo.primaryService,
          confidence: extractedData.serviceInfo.confidence.value,
          vehicleInfo: extractedData.vehicleInfo,
          pricing: extractedData.pricing.finalTotal || extractedData.pricing.subtotal,
          recommendations: processedResult.recommendations.length,
          vehicleProfile: processedResult.vehicleProfile ? 'Created/Updated' : 'None'
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
  };

  return (
    <section className="pt-24 pb-16 overflow-hidden relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-soft opacity-30 -z-10" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-4">
                AI-Powered Fair Pricing
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Know your car's{' '}
                <span className="gradient-text">fair price</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Stop getting overcharged at mechanic shops. Our AI analyzes your repair quotes against thousands of
                repair manuals and pricing data to ensure you get fair, transparent pricing every time.
              </p>
            </div>

            {/* Waitlist Form */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Join Our Waitlist</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleJoinWaitlist} size="md">
                  Join Waitlist
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Get early access and 50% off your first quote analysis!
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold text-primary-600">$450+</div>
                <div className="text-sm text-gray-600">Avg. Savings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">10k+</div>
                <div className="text-sm text-gray-600">Users Helped</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">98%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Interactive Tool */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:pl-12"
          >
            <div className="bg-gradient-brand rounded-2xl shadow-2xl p-8 text-white relative">
              <div className="absolute top-4 left-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💬</span>
                </div>
              </div>

              <div className="text-center mb-6 pt-4">
                <h2 className="text-2xl font-bold mb-2">
                  Which service do you need?
                </h2>
                {isProcessing && (
                  <p className="text-sm text-white/70 mb-2">
                    🤖 AI is analyzing your request...
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Search or attach the quote..."
                    value={carIssue}
                    onChange={(e) => setCarIssue(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70 pr-12"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleGetQuote();
                      }
                    }}
                  />
                  <label className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isProcessing}
                    />
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.586 10.461l-10.05 10.075c-.453.453-1.186.453-1.639 0l-6.083-6.083c-.453-.453-.453-1.186 0-1.639L10.896 5.733c.453-.453 1.186-.453 1.639 0l2.121 2.121 5.659-5.659c.453-.453 1.186-.453 1.639 0 .453.453.453 1.186 0 1.639l-5.659 5.659 2.121 2.121 4.241-4.241c.453-.453 1.186-.453 1.639 0 .453.453.453 1.186 0 1.639z"/>
                    </svg>
                  </label>
                </div>

                {carIssue && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-white/90 mb-2">Suggestions:</div>
                    <div className="flex flex-wrap gap-2">
                      {['Battery Replacement', 'Oil Change', 'Brake Service', 'Tire Rotation', 'AC Service']
                        .filter(service => service.toLowerCase().includes(carIssue.toLowerCase()))
                        .map((service) => (
                        <button
                          key={service}
                          onClick={() => {
                            setCarIssue(service);
                            handleGetQuote();
                          }}
                          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition"
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;