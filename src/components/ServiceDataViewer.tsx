import React, { useState, useEffect } from 'react';
import {
  Car,
  FileText,
  DollarSign,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  Download,
  Trash2,
  TrendingUp
} from 'lucide-react';
import Card from './common/Card';
import Button from './common/Button';
import type { ExtractedServiceData, VehicleProfile, ServiceRecommendation } from '../types/extraction';
import storageManager from '../services/storageManager';
import { smartContextManager } from '../services/smartContext';

interface ServiceDataViewerProps {
  dataId?: string;
  onClose?: () => void;
}

const ServiceDataViewer: React.FC<ServiceDataViewerProps> = ({ dataId, onClose }) => {
  const [extractedData, setExtractedData] = useState<ExtractedServiceData | null>(null);
  const [vehicleProfile, setVehicleProfile] = useState<VehicleProfile | null>(null);
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'vehicle' | 'recommendations'>('overview');

  useEffect(() => {
    if (dataId) {
      loadServiceData(dataId);
    }
  }, [dataId]);

  const loadServiceData = async (id: string) => {
    try {
      setLoading(true);

      const data = await storageManager.getExtractedData(id);
      if (!data) {
        console.error('Service data not found:', id);
        return;
      }

      setExtractedData(data);

      // Try to find associated vehicle profile
      const profiles = await storageManager.getAllVehicleProfiles();
      const matchingProfile = profiles.find(profile =>
        profile.serviceHistory.some(service => service.extractedDataId === id)
      );

      if (matchingProfile) {
        setVehicleProfile(matchingProfile);

        // Generate recommendations for this vehicle
        const insights = await smartContextManager.generateSmartInsights(matchingProfile.id);
        if (insights) {
          setRecommendations(insights.upcomingServices);
        }
      }

    } catch (error) {
      console.error('Error loading service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const formatCurrency = (amount?: number): string => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleExportData = async () => {
    if (!extractedData) return;

    try {
      const exportData = {
        extractedData,
        vehicleProfile,
        recommendations,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `service-data-${extractedData.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleDeleteData = async () => {
    if (!extractedData) return;

    if (confirm('Are you sure you want to delete this service data? This action cannot be undone.')) {
      try {
        await storageManager.deleteExtractedData(extractedData.id);
        if (onClose) onClose();
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Error deleting data. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading service data...</span>
        </div>
      </Card>
    );
  }

  if (!extractedData) {
    return (
      <Card className="max-w-4xl mx-auto">
        <div className="text-center p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Service Data Not Found</h3>
          <p className="text-gray-600">The requested service data could not be found.</p>
          {onClose && (
            <Button onClick={onClose} className="mt-4">Go Back</Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{extractedData.serviceInfo.primaryService}</h1>
            <p className="text-gray-600 mt-1">
              {extractedData.source === 'document_upload' ? 'Document Analysis' : 'Text Analysis'} •{' '}
              {extractedData.timestamp.toLocaleDateString()} at{' '}
              {extractedData.timestamp.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(extractedData.serviceInfo.urgencyLevel)}`}>
              {extractedData.serviceInfo.urgencyLevel.charAt(0).toUpperCase() + extractedData.serviceInfo.urgencyLevel.slice(1)}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(extractedData.serviceInfo.confidence.value)}`}>
              {extractedData.serviceInfo.confidence.value}% confidence
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center space-x-3">
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleDeleteData} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          )}
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: Eye },
            { key: 'details', label: 'Details', icon: FileText },
            { key: 'vehicle', label: 'Vehicle', icon: Car },
            { key: 'recommendations', label: 'Recommendations', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Information */}
          <Card>
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold">Service Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Primary Service</label>
                <p className="text-gray-900">{extractedData.serviceInfo.primaryService}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-gray-900">{extractedData.serviceInfo.category}</p>
              </div>
              {extractedData.serviceInfo.secondaryServices.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Additional Services</label>
                  <p className="text-gray-900">{extractedData.serviceInfo.secondaryServices.join(', ')}</p>
                </div>
              )}
              {extractedData.serviceInfo.recommendedAction && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Recommended Action</label>
                  <p className="text-gray-900">{extractedData.serviceInfo.recommendedAction}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Pricing Information */}
          <Card>
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Pricing</h3>
            </div>
            <div className="space-y-3">
              {extractedData.pricing.finalTotal && (
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(extractedData.pricing.finalTotal)}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {extractedData.pricing.partsTotal && (
                  <div>
                    <label className="text-gray-500">Parts</label>
                    <p className="font-medium">{formatCurrency(extractedData.pricing.partsTotal)}</p>
                  </div>
                )}
                {extractedData.pricing.laborTotal && (
                  <div>
                    <label className="text-gray-500">Labor</label>
                    <p className="font-medium">{formatCurrency(extractedData.pricing.laborTotal)}</p>
                  </div>
                )}
                {extractedData.pricing.taxes && (
                  <div>
                    <label className="text-gray-500">Taxes</label>
                    <p className="font-medium">{formatCurrency(extractedData.pricing.taxes)}</p>
                  </div>
                )}
                {extractedData.pricing.discounts && (
                  <div>
                    <label className="text-gray-500">Discounts</label>
                    <p className="font-medium text-green-600">-{formatCurrency(extractedData.pricing.discounts)}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Shop Information */}
          {extractedData.shopInfo.name && (
            <Card>
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold">Shop Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Shop Name</label>
                  <p className="text-gray-900">{extractedData.shopInfo.name}</p>
                </div>
                {extractedData.shopInfo.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">
                      {extractedData.shopInfo.address}
                      {extractedData.shopInfo.city && `, ${extractedData.shopInfo.city}`}
                      {extractedData.shopInfo.state && `, ${extractedData.shopInfo.state}`}
                      {extractedData.shopInfo.zipCode && ` ${extractedData.shopInfo.zipCode}`}
                    </p>
                  </div>
                )}
                {extractedData.shopInfo.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{extractedData.shopInfo.phone}</p>
                  </div>
                )}
                {extractedData.shopInfo.technicianName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Technician</label>
                    <p className="text-gray-900">{extractedData.shopInfo.technicianName}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Timeline */}
          {(extractedData.timeline.estimatedCompletionTime || extractedData.timeline.scheduledDate) && (
            <Card>
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold">Timeline</h3>
              </div>
              <div className="space-y-3">
                {extractedData.timeline.estimatedCompletionTime && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimated Time</label>
                    <p className="text-gray-900">{extractedData.timeline.estimatedCompletionTime}</p>
                  </div>
                )}
                {extractedData.timeline.scheduledDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                    <p className="text-gray-900">
                      {extractedData.timeline.scheduledDate.toLocaleDateString()} at{' '}
                      {extractedData.timeline.scheduledDate.toLocaleTimeString()}
                    </p>
                  </div>
                )}
                {extractedData.timeline.isUrgent && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Urgent Service Required</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Technical Information */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {extractedData.technicalInfo.diagnosticCodes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Diagnostic Codes</label>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.technicalInfo.diagnosticCodes.map((code, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.technicalInfo.partNumbers.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Part Numbers</label>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.technicalInfo.partNumbers.map((part, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {extractedData.technicalInfo.recommendedMaintenance.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Recommended Maintenance</label>
                <ul className="space-y-2">
                  {extractedData.technicalInfo.recommendedMaintenance.map((maintenance, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-900">{maintenance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Pricing Breakdown */}
          {extractedData.pricing.breakdown.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Pricing Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Total</th>
                      <th className="text-left py-2 pl-4">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.pricing.breakdown.map((item, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="py-2">{item.item}</td>
                        <td className="text-right py-2">{item.quantity || 1}</td>
                        <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right py-2 font-medium">{formatCurrency(item.total)}</td>
                        <td className="py-2 pl-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            item.category === 'parts' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'labor' ? 'bg-green-100 text-green-800' :
                            item.category === 'tax' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Raw Data */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Raw Data</h3>
            <div className="space-y-4">
              {extractedData.rawData.originalText && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Original Input</label>
                  <div className="bg-gray-50 p-3 rounded text-sm">{extractedData.rawData.originalText}</div>
                </div>
              )}

              {extractedData.rawData.extractedText && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Extracted Text</label>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {extractedData.rawData.extractedText}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-500">Processing Time</label>
                  <p className="font-medium">{Math.round(extractedData.rawData.processingTime)}ms</p>
                </div>
                <div>
                  <label className="text-gray-500">Source</label>
                  <p className="font-medium capitalize">{extractedData.source.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'vehicle' && vehicleProfile && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Vehicle Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Vehicle Identity</h4>
              <div className="space-y-2 text-sm">
                {vehicleProfile.identity.year && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Year:</span>
                    <span>{vehicleProfile.identity.year}</span>
                  </div>
                )}
                {vehicleProfile.identity.make && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Make:</span>
                    <span>{vehicleProfile.identity.make}</span>
                  </div>
                )}
                {vehicleProfile.identity.model && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Model:</span>
                    <span>{vehicleProfile.identity.model}</span>
                  </div>
                )}
                {vehicleProfile.identity.vin && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">VIN:</span>
                    <span className="font-mono text-xs">{vehicleProfile.identity.vin}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Specifications</h4>
              <div className="space-y-2 text-sm">
                {vehicleProfile.specifications.mileage && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mileage:</span>
                    <span>{vehicleProfile.specifications.mileage.toLocaleString()} miles</span>
                  </div>
                )}
                {vehicleProfile.specifications.engineType && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Engine:</span>
                    <span>{vehicleProfile.specifications.engineType}</span>
                  </div>
                )}
                {vehicleProfile.specifications.transmission && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transmission:</span>
                    <span>{vehicleProfile.specifications.transmission}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {vehicleProfile.serviceHistory.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Service History</h4>
              <div className="space-y-2">
                {vehicleProfile.serviceHistory.slice(0, 5).map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{service.service}</p>
                      <p className="text-sm text-gray-500">
                        {service.date.toLocaleDateString()}
                        {service.shopName && ` • ${service.shopName}`}
                      </p>
                    </div>
                    {service.cost && (
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(service.cost)}</p>
                        {service.mileage && (
                          <p className="text-sm text-gray-500">{service.mileage.toLocaleString()} mi</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <Card key={index}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold text-gray-900">{rec.service}</h4>
                      <span className={`ml-3 px-2 py-1 text-xs rounded ${getUrgencyColor(rec.urgency)}`}>
                        {rec.urgency}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{rec.reason}</p>
                    <div className="text-sm text-gray-500">
                      <p>Estimated cost: {formatCurrency(rec.estimatedCost.min)} - {formatCurrency(rec.estimatedCost.max)}</p>
                      {rec.dueMileage && <p>Due at: {rec.dueMileage.toLocaleString()} miles</p>}
                      {rec.dueBy && <p>Due by: {rec.dueBy.toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded ${getConfidenceColor(rec.confidence)}`}>
                    {rec.confidence}% confidence
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h3>
                <p className="text-gray-600">
                  We'll provide personalized recommendations as we learn more about your vehicle and service patterns.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceDataViewer;