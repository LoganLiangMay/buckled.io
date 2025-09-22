import type {
  ExtractedServiceData,
  VehicleProfile,
  UserSessionData,
  ServiceRecommendation,
  SmartInsights,
  ConfidenceScore
} from '../types/extraction';
import storageManager from './storageManager';

interface VehicleMatch {
  profile: VehicleProfile;
  matchScore: number;
  matchReasons: string[];
}

class SmartContextManager {
  /**
   * Process extracted data and update vehicle profiles and user context
   */
  async processExtractedData(data: ExtractedServiceData): Promise<{
    vehicleProfile?: VehicleProfile;
    updatedSession: UserSessionData;
    recommendations: ServiceRecommendation[];
  }> {
    try {
      // Save the extracted data first
      await storageManager.saveExtractedData(data);

      // Find or create vehicle profile
      const vehicleProfile = await this.findOrCreateVehicleProfile(data);

      // Update user session with new insights
      const updatedSession = await this.updateUserSession(data);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(data, vehicleProfile);

      return {
        vehicleProfile,
        updatedSession,
        recommendations
      };
    } catch (error) {
      console.error('Error processing extracted data:', error);

      // Return minimal response on error
      const currentSession = await storageManager.getUserSession();
      return {
        updatedSession: currentSession || this.createDefaultSession(),
        recommendations: []
      };
    }
  }

  /**
   * Find existing vehicle profile or create new one based on extracted data
   */
  private async findOrCreateVehicleProfile(data: ExtractedServiceData): Promise<VehicleProfile | undefined> {
    if (!this.hasVehicleInfo(data)) return undefined;

    try {
      const existingProfiles = await storageManager.getAllVehicleProfiles();
      const match = this.findBestVehicleMatch(data, existingProfiles);

      if (match && match.matchScore > 0.7) {
        // Update existing profile
        return await this.updateExistingProfile(match.profile, data);
      } else {
        // Create new profile
        return await this.createNewVehicleProfile(data);
      }
    } catch (error) {
      console.error('Error finding/creating vehicle profile:', error);
      return undefined;
    }
  }

  /**
   * Check if extracted data contains vehicle information
   */
  private hasVehicleInfo(data: ExtractedServiceData): boolean {
    const vehicle = data.vehicleInfo;
    return !!(
      vehicle.make ||
      vehicle.model ||
      vehicle.year ||
      vehicle.vin ||
      vehicle.confidence.value > 30
    );
  }

  /**
   * Find the best matching vehicle profile
   */
  private findBestVehicleMatch(data: ExtractedServiceData, profiles: VehicleProfile[]): VehicleMatch | null {
    if (profiles.length === 0) return null;

    const matches: VehicleMatch[] = profiles.map(profile => {
      const score = this.calculateVehicleMatchScore(data.vehicleInfo, profile);
      const reasons = this.getMatchReasons(data.vehicleInfo, profile, score);

      return {
        profile,
        matchScore: score,
        matchReasons: reasons
      };
    });

    // Return best match if score is above threshold
    const bestMatch = matches.reduce((best, current) =>
      current.matchScore > best.matchScore ? current : best
    );

    return bestMatch.matchScore > 0.5 ? bestMatch : null;
  }

  /**
   * Calculate match score between vehicle info and profile
   */
  private calculateVehicleMatchScore(vehicleInfo: ExtractedServiceData['vehicleInfo'], profile: VehicleProfile): number {
    let score = 0;
    let factors = 0;

    // VIN match (highest priority)
    if (vehicleInfo.vin && profile.identity.vin) {
      factors += 1;
      score += vehicleInfo.vin === profile.identity.vin ? 1.0 : 0;
    }

    // Make match
    if (vehicleInfo.make && profile.identity.make) {
      factors += 1;
      score += vehicleInfo.make.toLowerCase() === profile.identity.make.toLowerCase() ? 0.8 : 0;
    }

    // Model match
    if (vehicleInfo.model && profile.identity.model) {
      factors += 1;
      score += vehicleInfo.model.toLowerCase() === profile.identity.model.toLowerCase() ? 0.8 : 0;
    }

    // Year match (with tolerance)
    if (vehicleInfo.year && profile.identity.year) {
      factors += 1;
      const yearDiff = Math.abs(vehicleInfo.year - profile.identity.year);
      score += yearDiff === 0 ? 0.6 : yearDiff <= 1 ? 0.4 : 0;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Get reasons for vehicle match
   */
  private getMatchReasons(vehicleInfo: ExtractedServiceData['vehicleInfo'], profile: VehicleProfile, score: number): string[] {
    const reasons: string[] = [];

    if (vehicleInfo.vin && profile.identity.vin && vehicleInfo.vin === profile.identity.vin) {
      reasons.push('VIN match');
    }

    if (vehicleInfo.make && profile.identity.make &&
        vehicleInfo.make.toLowerCase() === profile.identity.make.toLowerCase()) {
      reasons.push('Make match');
    }

    if (vehicleInfo.model && profile.identity.model &&
        vehicleInfo.model.toLowerCase() === profile.identity.model.toLowerCase()) {
      reasons.push('Model match');
    }

    if (vehicleInfo.year && profile.identity.year) {
      const yearDiff = Math.abs(vehicleInfo.year - profile.identity.year);
      if (yearDiff === 0) reasons.push('Exact year match');
      else if (yearDiff <= 1) reasons.push('Similar year');
    }

    return reasons;
  }

  /**
   * Update existing vehicle profile with new data
   */
  private async updateExistingProfile(profile: VehicleProfile, data: ExtractedServiceData): Promise<VehicleProfile> {
    const updates: Partial<VehicleProfile> = {
      lastUpdated: new Date()
    };

    // Update specifications if we have better data
    if (data.vehicleInfo.mileage && data.vehicleInfo.confidence.value > 50) {
      updates.specifications = {
        ...profile.specifications,
        mileage: data.vehicleInfo.mileage,
        lastMileageUpdate: new Date(),
        confidence: this.mergeConfidence(
          profile.specifications.confidence,
          data.vehicleInfo.confidence
        )
      };
    }

    // Add service history entry
    const serviceEntry = {
      date: data.timestamp,
      service: data.serviceInfo.primaryService,
      mileage: data.vehicleInfo.mileage,
      shopName: data.shopInfo.name,
      cost: data.pricing.finalTotal || data.pricing.subtotal,
      extractedDataId: data.id
    };

    updates.serviceHistory = [...profile.serviceHistory, serviceEntry];

    // Update maintenance schedule based on new service
    updates.maintenanceSchedule = this.updateMaintenanceSchedule(
      profile.maintenanceSchedule,
      data
    );

    await storageManager.updateVehicleProfile(profile.id, updates);
    return await storageManager.getVehicleProfile(profile.id) || profile;
  }

  /**
   * Create new vehicle profile from extracted data
   */
  private async createNewVehicleProfile(data: ExtractedServiceData): Promise<VehicleProfile> {
    const profileId = `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const profile: VehicleProfile = {
      id: profileId,
      createdAt: new Date(),
      lastUpdated: new Date(),

      identity: {
        year: data.vehicleInfo.year,
        make: data.vehicleInfo.make,
        model: data.vehicleInfo.model,
        vin: data.vehicleInfo.vin,
        licensePlate: data.vehicleInfo.licensePlate,
        color: data.vehicleInfo.color,
        confidence: data.vehicleInfo.confidence
      },

      specifications: {
        engineType: data.vehicleInfo.engineType,
        transmission: data.vehicleInfo.transmission,
        mileage: data.vehicleInfo.mileage,
        lastMileageUpdate: new Date(),
        confidence: data.vehicleInfo.confidence
      },

      serviceHistory: [{
        date: data.timestamp,
        service: data.serviceInfo.primaryService,
        mileage: data.vehicleInfo.mileage,
        shopName: data.shopInfo.name,
        cost: data.pricing.finalTotal || data.pricing.subtotal,
        extractedDataId: data.id
      }],

      maintenanceSchedule: this.generateInitialMaintenanceSchedule(data),

      knownIssues: [],
      userNotes: '',
      tags: [data.serviceInfo.category],
      isActive: true
    };

    await storageManager.saveVehicleProfile(profile);
    return profile;
  }

  /**
   * Update user session with insights from new data
   */
  private async updateUserSession(data: ExtractedServiceData): Promise<UserSessionData> {
    const currentSession = await storageManager.getUserSession();
    if (!currentSession) return this.createDefaultSession();

    const updates: Partial<UserSessionData> = {
      lastActive: new Date()
    };

    // Update service history summary
    const allData = await storageManager.getAllExtractedData();
    const costs = allData
      .map(d => d.pricing.finalTotal || d.pricing.subtotal || 0)
      .filter(cost => cost > 0);

    updates.serviceHistory = {
      totalServices: allData.length,
      lastServiceDate: data.timestamp,
      favoriteCategories: this.calculateFavoriteCategories(allData),
      averageSpending: costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0,
      frequentShops: this.calculateFrequentShops(allData)
    };

    // Update location if we have shop info
    if (data.shopInfo.city && data.shopInfo.state && data.shopInfo.zipCode) {
      updates.location = {
        ...currentSession.location,
        city: data.shopInfo.city,
        state: data.shopInfo.state,
        zipCode: data.shopInfo.zipCode,
        lastUpdated: new Date()
      };
    }

    // Update preferences based on patterns
    if (data.pricing.finalTotal || data.pricing.subtotal) {
      const cost = data.pricing.finalTotal || data.pricing.subtotal || 0;
      const currentBudget = currentSession.preferences.budgetRange;

      updates.preferences = {
        ...currentSession.preferences,
        budgetRange: {
          min: Math.min(currentBudget.min, cost * 0.8),
          max: Math.max(currentBudget.max, cost * 1.2)
        }
      };
    }

    const updatedSession = { ...currentSession, ...updates };
    await storageManager.saveUserSession(updatedSession);
    return updatedSession;
  }

  /**
   * Generate service recommendations based on data and context
   */
  private async generateRecommendations(
    data: ExtractedServiceData,
    vehicleProfile?: VehicleProfile
  ): Promise<ServiceRecommendation[]> {
    const recommendations: ServiceRecommendation[] = [];

    try {
      // Recommendations from technical info
      if (data.technicalInfo.recommendedMaintenance.length > 0) {
        data.technicalInfo.recommendedMaintenance.forEach(maintenance => {
          recommendations.push({
            service: maintenance,
            reason: 'Recommended by service technician',
            urgency: this.mapSeverityToUrgency(data.technicalInfo.severity),
            estimatedCost: this.estimateServiceCost(maintenance),
            confidence: data.technicalInfo.confidence.value,
            sources: [`Technical recommendation from ${data.shopInfo.name || 'service provider'}`]
          });
        });
      }

      // Mileage-based recommendations
      if (vehicleProfile && vehicleProfile.specifications.mileage) {
        const mileageRecommendations = this.getMileageBasedRecommendations(vehicleProfile);
        recommendations.push(...mileageRecommendations);
      }

      // Urgency-based recommendations
      if (data.serviceInfo.urgencyLevel === 'high' || data.serviceInfo.urgencyLevel === 'emergency') {
        recommendations.push({
          service: data.serviceInfo.primaryService,
          reason: 'Urgent service required based on symptoms',
          urgency: data.serviceInfo.urgencyLevel as 'high',
          estimatedCost: {
            min: data.pricing.finalTotal ? data.pricing.finalTotal * 0.8 : 100,
            max: data.pricing.finalTotal ? data.pricing.finalTotal * 1.2 : 500
          },
          confidence: data.serviceInfo.confidence.value,
          sources: ['User symptoms and service analysis']
        });
      }

      // Pattern-based recommendations
      const patternRecommendations = await this.getPatternBasedRecommendations(data);
      recommendations.push(...patternRecommendations);

      return recommendations
        .sort((a, b) => {
          // Sort by urgency first, then confidence
          const urgencyOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
          if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
            return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
          }
          return b.confidence - a.confidence;
        })
        .slice(0, 5); // Return top 5 recommendations

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Generate smart insights for a vehicle
   */
  async generateSmartInsights(vehicleId: string): Promise<SmartInsights | null> {
    try {
      const [vehicleProfile, allData, userSession] = await Promise.all([
        storageManager.getVehicleProfile(vehicleId),
        storageManager.getAllExtractedData(),
        storageManager.getUserSession()
      ]);

      if (!vehicleProfile) return null;

      // Filter data for this vehicle
      const vehicleData = allData.filter(data =>
        this.isDataForVehicle(data, vehicleProfile)
      );

      const insights: SmartInsights = {
        vehicleId,
        generatedAt: new Date(),

        upcomingServices: await this.getUpcomingServices(vehicleProfile),

        costTrends: this.analyzeCostTrends(vehicleData),

        patterns: this.detectPatterns(vehicleData, userSession),

        alerts: this.generateAlerts(vehicleProfile, vehicleData)
      };

      return insights;
    } catch (error) {
      console.error('Error generating smart insights:', error);
      return null;
    }
  }

  // ============== HELPER METHODS ==============

  private createDefaultSession(): UserSessionData {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      sessionId,
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        preferredShops: [],
        budgetRange: { min: 50, max: 1000 },
        serviceRadius: 25,
        preferredBrands: [],
        communicationMethod: 'email',
        urgencyPreference: 'quality'
      },
      location: {
        lastUpdated: new Date()
      },
      serviceHistory: {
        totalServices: 0,
        favoriteCategories: [],
        averageSpending: 0,
        frequentShops: []
      }
    };
  }

  private mergeConfidence(existing: ConfidenceScore, newData: ConfidenceScore): ConfidenceScore {
    // Weighted average based on source reliability
    const weights = {
      ai_extraction: 0.7,
      user_input: 0.8,
      manual_correction: 1.0,
      pattern_match: 0.5
    };

    const existingWeight = weights[existing.source] || 0.5;
    const newWeight = weights[newData.source] || 0.5;

    const totalWeight = existingWeight + newWeight;
    const mergedValue = (existing.value * existingWeight + newData.value * newWeight) / totalWeight;

    return {
      value: Math.round(mergedValue),
      source: newData.source === 'manual_correction' ? 'manual_correction' : 'ai_extraction'
    };
  }

  private updateMaintenanceSchedule(
    currentSchedule: VehicleProfile['maintenanceSchedule'],
    data: ExtractedServiceData
  ): VehicleProfile['maintenanceSchedule'] {
    const updatedSchedule = [...currentSchedule];

    // Mark service as performed if it matches
    const servicePerformed = data.serviceInfo.primaryService.toLowerCase();
    updatedSchedule.forEach(item => {
      if (item.service.toLowerCase().includes(servicePerformed)) {
        item.lastPerformed = data.timestamp;
      }
    });

    return updatedSchedule;
  }

  private generateInitialMaintenanceSchedule(data: ExtractedServiceData): VehicleProfile['maintenanceSchedule'] {
    const schedule: VehicleProfile['maintenanceSchedule'] = [];
    const currentMileage = data.vehicleInfo.mileage || 0;

    // Common maintenance items
    const maintenanceItems = [
      { service: 'Oil Change', interval: 5000, priority: 'medium' as const },
      { service: 'Tire Rotation', interval: 7500, priority: 'low' as const },
      { service: 'Air Filter', interval: 15000, priority: 'low' as const },
      { service: 'Brake Inspection', interval: 20000, priority: 'medium' as const },
      { service: 'Transmission Service', interval: 50000, priority: 'high' as const }
    ];

    maintenanceItems.forEach(item => {
      schedule.push({
        service: item.service,
        dueAt: 'mileage',
        dueMileage: currentMileage + item.interval,
        priority: item.priority,
        estimatedCost: this.estimateServiceCost(item.service),
        lastPerformed: data.serviceInfo.primaryService === item.service ? data.timestamp : undefined
      });
    });

    return schedule;
  }

  private calculateFavoriteCategories(allData: ExtractedServiceData[]): string[] {
    const categoryCounts: { [key: string]: number } = {};

    allData.forEach(data => {
      categoryCounts[data.serviceInfo.category] = (categoryCounts[data.serviceInfo.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  private calculateFrequentShops(allData: ExtractedServiceData[]): string[] {
    const shopCounts: { [key: string]: number } = {};

    allData.forEach(data => {
      if (data.shopInfo.name) {
        shopCounts[data.shopInfo.name] = (shopCounts[data.shopInfo.name] || 0) + 1;
      }
    });

    return Object.entries(shopCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([shop]) => shop);
  }

  private mapSeverityToUrgency(severity: string): ServiceRecommendation['urgency'] {
    switch (severity) {
      case 'critical': return 'high';
      case 'needed': return 'medium';
      case 'recommended': return 'low';
      default: return 'low';
    }
  }

  private estimateServiceCost(serviceName: string): { min: number; max: number } {
    const estimates: { [key: string]: { min: number; max: number } } = {
      'oil change': { min: 30, max: 80 },
      'brake': { min: 150, max: 400 },
      'tire': { min: 100, max: 300 },
      'battery': { min: 100, max: 200 },
      'transmission': { min: 200, max: 800 },
      'engine': { min: 300, max: 1500 },
      'air filter': { min: 20, max: 60 },
      'alignment': { min: 80, max: 150 }
    };

    const serviceLower = serviceName.toLowerCase();
    for (const [key, cost] of Object.entries(estimates)) {
      if (serviceLower.includes(key)) {
        return cost;
      }
    }

    return { min: 50, max: 300 }; // Default estimate
  }

  private getMileageBasedRecommendations(profile: VehicleProfile): ServiceRecommendation[] {
    const recommendations: ServiceRecommendation[] = [];
    const currentMileage = profile.specifications.mileage || 0;

    profile.maintenanceSchedule.forEach(item => {
      if (item.dueAt === 'mileage' && item.dueMileage) {
        const mileageUntilDue = item.dueMileage - currentMileage;

        if (mileageUntilDue <= 1000 && mileageUntilDue > 0) {
          recommendations.push({
            service: item.service,
            reason: `Due in ${mileageUntilDue} miles`,
            urgency: mileageUntilDue <= 500 ? 'medium' : 'low',
            estimatedCost: item.estimatedCost || this.estimateServiceCost(item.service),
            dueMileage: item.dueMileage,
            confidence: 85,
            sources: ['Maintenance schedule']
          });
        }
      }
    });

    return recommendations;
  }

  private async getPatternBasedRecommendations(data: ExtractedServiceData): Promise<ServiceRecommendation[]> {
    // Get similar services from history to identify patterns
    const allData = await storageManager.getAllExtractedData();
    const recommendations: ServiceRecommendation[] = [];

    // If user frequently gets certain services together, recommend them
    const relatedServices = this.findRelatedServices(data.serviceInfo.primaryService, allData);

    relatedServices.forEach(service => {
      recommendations.push({
        service,
        reason: 'Often performed together with this service',
        urgency: 'low',
        estimatedCost: this.estimateServiceCost(service),
        confidence: 60,
        sources: ['Service pattern analysis']
      });
    });

    return recommendations;
  }

  private findRelatedServices(primaryService: string, allData: ExtractedServiceData[]): string[] {
    // Find services that commonly occur together
    const relatedMap: { [key: string]: number } = {};

    allData.forEach(data => {
      if (data.serviceInfo.primaryService === primaryService) {
        data.serviceInfo.secondaryServices.forEach(secondary => {
          relatedMap[secondary] = (relatedMap[secondary] || 0) + 1;
        });
      }
    });

    return Object.entries(relatedMap)
      .filter(([, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([service]) => service);
  }

  private isDataForVehicle(data: ExtractedServiceData, profile: VehicleProfile): boolean {
    const match = this.calculateVehicleMatchScore(data.vehicleInfo, profile);
    return match > 0.5;
  }

  private async getUpcomingServices(profile: VehicleProfile): Promise<ServiceRecommendation[]> {
    const upcoming: ServiceRecommendation[] = [];
    const currentMileage = profile.specifications.mileage || 0;
    const currentDate = new Date();

    profile.maintenanceSchedule.forEach(item => {
      let isDue = false;
      let reason = '';

      if (item.dueAt === 'mileage' && item.dueMileage) {
        const mileageUntilDue = item.dueMileage - currentMileage;
        if (mileageUntilDue <= 2000) {
          isDue = true;
          reason = mileageUntilDue <= 0 ? 'Overdue' : `Due in ${mileageUntilDue} miles`;
        }
      } else if (item.dueAt === 'time' && item.dueDate) {
        const daysUntilDue = Math.ceil((item.dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 30) {
          isDue = true;
          reason = daysUntilDue <= 0 ? 'Overdue' : `Due in ${daysUntilDue} days`;
        }
      }

      if (isDue) {
        upcoming.push({
          service: item.service,
          reason,
          urgency: item.priority as ServiceRecommendation['urgency'],
          estimatedCost: item.estimatedCost || this.estimateServiceCost(item.service),
          dueBy: item.dueDate,
          dueMileage: item.dueMileage,
          confidence: 90,
          sources: ['Maintenance schedule']
        });
      }
    });

    return upcoming.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  private analyzeCostTrends(vehicleData: ExtractedServiceData[]): SmartInsights['costTrends'] {
    const costsWithValues = vehicleData
      .map(d => ({ cost: d.pricing.finalTotal || d.pricing.subtotal || 0, category: d.serviceInfo.category }))
      .filter(item => item.cost > 0);

    const totalSpent = costsWithValues.reduce((sum, item) => sum + item.cost, 0);
    const averageMonthlySpend = totalSpent / Math.max(1, vehicleData.length);

    // Category breakdown
    const categoryTotals: { [key: string]: number } = {};
    costsWithValues.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.cost;
    });

    const costByCategory = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total,
        percentage: Math.round((total / totalSpent) * 100)
      }))
      .sort((a, b) => b.total - a.total);

    return {
      averageMonthlySpend,
      costByCategory,
      savingsOpportunities: this.identifySavingsOpportunities(vehicleData)
    };
  }

  private identifySavingsOpportunities(vehicleData: ExtractedServiceData[]): string[] {
    const opportunities: string[] = [];

    // Check for expensive services that could be done together
    const expensiveServices = vehicleData
      .filter(d => (d.pricing.finalTotal || 0) > 200)
      .map(d => d.serviceInfo.primaryService);

    if (expensiveServices.length > 2) {
      opportunities.push('Consider bundling services to save on labor costs');
    }

    // Check for frequent shop changes
    const shops = new Set(vehicleData.map(d => d.shopInfo.name).filter(Boolean));
    if (shops.size > 3) {
      opportunities.push('Using fewer shops may lead to loyalty discounts');
    }

    return opportunities;
  }

  private detectPatterns(vehicleData: ExtractedServiceData[], userSession: UserSessionData | null): SmartInsights['patterns'] {
    const preferredShops = vehicleData
      .map(d => d.shopInfo.name)
      .filter(Boolean)
      .reduce((acc, shop) => {
        acc[shop] = (acc[shop] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    const commonServices = vehicleData
      .map(d => d.serviceInfo.primaryService)
      .reduce((acc, service) => {
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    return {
      preferredShops: Object.entries(preferredShops)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([shop]) => shop),
      commonServices: Object.entries(commonServices)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([service]) => service),
      seasonalPatterns: [], // Could be enhanced with date analysis
      costPatterns: this.identifyCostPatterns(vehicleData)
    };
  }

  private identifyCostPatterns(vehicleData: ExtractedServiceData[]): string[] {
    const patterns: string[] = [];

    const costs = vehicleData
      .map(d => d.pricing.finalTotal || d.pricing.subtotal || 0)
      .filter(cost => cost > 0);

    if (costs.length > 0) {
      const average = costs.reduce((a, b) => a + b, 0) / costs.length;
      const expensive = costs.filter(cost => cost > average * 1.5).length;

      if (expensive / costs.length > 0.3) {
        patterns.push('Tends to require expensive repairs');
      }

      if (costs.every(cost => cost < 200)) {
        patterns.push('Mostly routine maintenance');
      }
    }

    return patterns;
  }

  private generateAlerts(profile: VehicleProfile, vehicleData: ExtractedServiceData[]): SmartInsights['alerts'] {
    const alerts: SmartInsights['alerts'] = [];

    // Check for overdue maintenance
    const currentMileage = profile.specifications.mileage || 0;
    const overdueItems = profile.maintenanceSchedule.filter(item =>
      item.dueAt === 'mileage' &&
      item.dueMileage &&
      currentMileage > item.dueMileage
    );

    if (overdueItems.length > 0) {
      alerts.push({
        type: 'maintenance_due',
        message: `${overdueItems.length} maintenance item(s) overdue`,
        severity: 'warning',
        actionRequired: true
      });
    }

    // Check for urgent services
    const urgentServices = vehicleData.filter(d =>
      d.serviceInfo.urgencyLevel === 'high' ||
      d.serviceInfo.urgencyLevel === 'emergency'
    );

    if (urgentServices.length > 0) {
      alerts.push({
        type: 'urgent_service',
        message: 'Urgent service required based on recent analysis',
        severity: 'error',
        actionRequired: true
      });
    }

    return alerts;
  }
}

// Create and export singleton instance
export const smartContextManager = new SmartContextManager();
export default smartContextManager;