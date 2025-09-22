import React, { useState, useEffect } from 'react';
import { Car, DollarSign } from 'lucide-react';
import Button from './common/Button';
import Card from './common/Card';
import { vehicleYears, vehicleMakes, getServiceEstimate } from '../data/vehicleData';

interface VehicleFormProps {
  serviceName: string;
  onEstimateGenerated?: (estimate: any) => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ serviceName, onEstimateGenerated }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [estimate, setEstimate] = useState<any>(null);
  const [showEstimate, setShowEstimate] = useState(false);

  // Get available models for selected make
  const availableModels = selectedMake
    ? vehicleMakes.find(make => make.name === selectedMake)?.models || []
    : [];

  // Reset model when make changes
  useEffect(() => {
    setSelectedModel('');
  }, [selectedMake]);

  const handleSubmit = () => {
    const serviceEstimate = getServiceEstimate(serviceName, selectedMake);
    const vehicleInfo = {
      year: selectedYear || null,
      make: selectedMake || null,
      model: selectedModel || null,
      hasVehicleInfo: !!(selectedYear && selectedMake && selectedModel)
    };

    const fullEstimate = {
      ...serviceEstimate,
      vehicle: vehicleInfo,
      serviceName
    };

    setEstimate(fullEstimate);
    setShowEstimate(true);

    if (onEstimateGenerated) {
      onEstimateGenerated(fullEstimate);
    }
  };

  const getGeneralEstimate = () => {
    const serviceEstimate = getServiceEstimate(serviceName);
    return serviceEstimate;
  };

  return (
    <Card className="p-6 mb-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <Car className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">Vehicle Information</h3>
        </div>
        <p className="text-gray-600">Enter your vehicle details for accurate pricing</p>
      </div>

      {/* Vehicle Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Year Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Year</option>
            {vehicleYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Make Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
          <select
            value={selectedMake}
            onChange={(e) => setSelectedMake(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Make</option>
            {vehicleMakes.map((make) => (
              <option key={make.name} value={make.name}>{make.name}</option>
            ))}
          </select>
        </div>

        {/* Model Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={!selectedMake}
          >
            <option value="">Select Model</option>
            {availableModels.map((model) => (
              <option key={model.name} value={model.name}>{model.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Service Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">Service Summary</h4>
        <div className="flex items-center">
          <span className="text-lg text-gray-700">{serviceName}</span>
          {selectedYear && selectedMake && selectedModel && (
            <span className="ml-3 text-sm text-gray-500">
              for {selectedYear} {selectedMake} {selectedModel}
            </span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center mb-6">
        <Button onClick={handleSubmit} size="lg" className="px-8">
          <DollarSign className="w-5 h-5 mr-2" />
          Get Estimate
        </Button>
      </div>

      {/* Estimate Display */}
      {showEstimate && estimate && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-bold text-center mb-4">Estimated Cost</h4>

          <div className="bg-primary-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">${estimate.parts}</div>
                <div className="text-sm text-gray-600">Parts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">${estimate.labor}</div>
                <div className="text-sm text-gray-600">Labor</div>
              </div>
              <div className="border-l-2 border-primary-200 pl-4">
                <div className="text-3xl font-bold text-primary-700">${estimate.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {/* Vehicle-specific vs General pricing note */}
            <div className="mt-4 text-center">
              {estimate.vehicle.hasVehicleInfo ? (
                <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded">
                  ✓ Price customized for your {estimate.vehicle.year} {estimate.vehicle.make} {estimate.vehicle.model}
                </div>
              ) : (
                <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded">
                  💡 General estimate - select your vehicle for more accurate pricing
                </div>
              )}
            </div>

            {/* Pricing category */}
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {estimate.category} vehicle pricing
              </span>
            </div>
          </div>

          {/* General estimate comparison */}
          {estimate.vehicle.hasVehicleInfo && (
            <div className="mt-4 text-center">
              <details className="text-sm text-gray-600">
                <summary className="cursor-pointer hover:text-primary-600">
                  Compare with general estimate
                </summary>
                <div className="mt-2 text-xs">
                  General estimate: ${getGeneralEstimate().total}
                  (Parts: ${getGeneralEstimate().parts}, Labor: ${getGeneralEstimate().labor})
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default VehicleForm;