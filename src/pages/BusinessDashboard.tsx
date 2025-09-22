import React, { useState } from 'react';
import {
  Car,
  DollarSign,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import type { Quote, ServiceRequest } from '../types';

const BusinessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'requests'>('overview');

  // Mock data for dashboard
  const stats = {
    totalQuotes: 45,
    pendingQuotes: 12,
    approvedQuotes: 28,
    rejectedQuotes: 5,
    totalRevenue: 15250,
    newCustomers: 18,
  };

  const mockQuotes: Quote[] = [
    {
      id: '1',
      customerId: 'cust1',
      shopId: 'shop1',
      vehicleId: 'veh1',
      serviceId: 'serv1',
      status: 'pending',
      estimatedCost: {
        parts: 150,
        labor: 200,
        total: 350,
      },
      notes: 'Front brake pads and rotors replacement',
      createdAt: new Date('2025-09-20'),
      updatedAt: new Date('2025-09-20'),
    },
    {
      id: '2',
      customerId: 'cust2',
      shopId: 'shop1',
      vehicleId: 'veh2',
      serviceId: 'serv2',
      status: 'approved',
      estimatedCost: {
        parts: 45,
        labor: 35,
        total: 80,
      },
      notes: 'Standard oil change',
      createdAt: new Date('2025-09-19'),
      updatedAt: new Date('2025-09-20'),
    },
  ];

  const mockRequests: ServiceRequest[] = [
    {
      id: '1',
      customerId: 'cust3',
      vehicleId: 'veh3',
      serviceId: 'serv3',
      description: 'AC not cooling properly',
      preferredDate: new Date('2025-09-25'),
      location: {
        zipCode: '90001',
        radius: 10,
      },
      quotes: [],
      status: 'open',
      createdAt: new Date('2025-09-21'),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'open':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 min-h-screen bg-gray-50">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your shop overview.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Quotes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Quotes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingQuotes}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newCustomers}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-6 mb-8 border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`pb-3 px-1 border-b-2 transition ${
                activeTab === 'quotes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Quotes ({mockQuotes.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-3 px-1 border-b-2 transition ${
                activeTab === 'requests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Service Requests ({mockRequests.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Quote Status Distribution</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span>Approved</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">{stats.approvedQuotes}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(stats.approvedQuotes / stats.totalQuotes) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">{stats.pendingQuotes}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(stats.pendingQuotes / stats.totalQuotes) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span>Rejected</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">{stats.rejectedQuotes}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(stats.rejectedQuotes / stats.totalQuotes) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="p-2 bg-green-50 rounded-lg mr-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quote #2 Approved</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New Service Request</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                      <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quote #1 Pending Review</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="space-y-4">
              {mockQuotes.map((quote) => (
                <Card key={quote.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold mr-3">Quote #{quote.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{quote.notes}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {quote.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-gray-900">${quote.estimatedCost.total}</div>
                      <div className="text-sm text-gray-500">
                        Parts: ${quote.estimatedCost.parts} | Labor: ${quote.estimatedCost.labor}
                      </div>
                      {quote.status === 'pending' && (
                        <div className="mt-3 flex space-x-2">
                          <Button variant="primary" size="sm">Approve</Button>
                          <Button variant="outline" size="sm">Modify</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {mockRequests.map((request) => (
                <Card key={request.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold mr-3">Request #{request.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{request.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          ZIP: {request.location.zipCode}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Preferred: {request.preferredDate?.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Button variant="primary" size="sm">Send Quote</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default BusinessDashboard;