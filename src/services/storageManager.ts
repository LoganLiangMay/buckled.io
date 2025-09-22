import type {
  ExtractedServiceData,
  UserSessionData,
  VehicleProfile,
  StorageManager as IStorageManager
} from '../types/extraction';

// IndexedDB configuration
const DB_NAME = 'BuckledServiceData';
const DB_VERSION = 1;

// Store names
const STORES = {
  EXTRACTED_DATA: 'extractedData',
  VEHICLE_PROFILES: 'vehicleProfiles',
  USER_SESSION: 'userSession'
} as const;

class StorageManager implements IStorageManager {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    if (this.isInitialized && this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create extracted data store
        if (!db.objectStoreNames.contains(STORES.EXTRACTED_DATA)) {
          const extractedStore = db.createObjectStore(STORES.EXTRACTED_DATA, { keyPath: 'id' });
          extractedStore.createIndex('timestamp', 'timestamp', { unique: false });
          extractedStore.createIndex('source', 'source', { unique: false });
          extractedStore.createIndex('primaryService', 'serviceInfo.primaryService', { unique: false });
          extractedStore.createIndex('category', 'serviceInfo.category', { unique: false });
          extractedStore.createIndex('vehicleMake', 'vehicleInfo.make', { unique: false });
        }

        // Create vehicle profiles store
        if (!db.objectStoreNames.contains(STORES.VEHICLE_PROFILES)) {
          const vehicleStore = db.createObjectStore(STORES.VEHICLE_PROFILES, { keyPath: 'id' });
          vehicleStore.createIndex('make', 'identity.make', { unique: false });
          vehicleStore.createIndex('model', 'identity.model', { unique: false });
          vehicleStore.createIndex('year', 'identity.year', { unique: false });
          vehicleStore.createIndex('vin', 'identity.vin', { unique: false });
          vehicleStore.createIndex('isActive', 'isActive', { unique: false });
        }

        // Create user session store
        if (!db.objectStoreNames.contains(STORES.USER_SESSION)) {
          db.createObjectStore(STORES.USER_SESSION, { keyPath: 'sessionId' });
        }
      };
    });
  }

  /**
   * Get a transaction for a store
   */
  private async getTransaction(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // ============== EXTRACTED DATA OPERATIONS ==============

  async saveExtractedData(data: ExtractedServiceData): Promise<void> {
    try {
      const store = await this.getTransaction(STORES.EXTRACTED_DATA, 'readwrite');

      return new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => {
          console.log('Extracted data saved successfully:', data.id);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving extracted data:', error);
      throw error;
    }
  }

  async getExtractedData(id: string): Promise<ExtractedServiceData | null> {
    try {
      const store = await this.getTransaction(STORES.EXTRACTED_DATA);

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting extracted data:', error);
      return null;
    }
  }

  async getAllExtractedData(): Promise<ExtractedServiceData[]> {
    try {
      const store = await this.getTransaction(STORES.EXTRACTED_DATA);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          // Sort by timestamp (newest first)
          const results = request.result.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all extracted data:', error);
      return [];
    }
  }

  async deleteExtractedData(id: string): Promise<void> {
    try {
      const store = await this.getTransaction(STORES.EXTRACTED_DATA, 'readwrite');

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          console.log('Extracted data deleted:', id);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting extracted data:', error);
      throw error;
    }
  }

  // ============== USER SESSION OPERATIONS ==============

  async saveUserSession(session: UserSessionData): Promise<void> {
    try {
      const store = await this.getTransaction(STORES.USER_SESSION, 'readwrite');

      return new Promise((resolve, reject) => {
        const request = store.put(session);
        request.onsuccess = () => {
          console.log('User session saved successfully');
          // Also save to localStorage for quick access
          localStorage.setItem('buckled_user_preferences', JSON.stringify(session.preferences));
          localStorage.setItem('buckled_user_location', JSON.stringify(session.location));
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving user session:', error);
      throw error;
    }
  }

  async getUserSession(): Promise<UserSessionData | null> {
    try {
      const store = await this.getTransaction(STORES.USER_SESSION);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const sessions = request.result;
          if (sessions.length === 0) {
            // Create default session if none exists
            const defaultSession = this.createDefaultUserSession();
            resolve(defaultSession);
          } else {
            // Return the most recent session
            const latestSession = sessions.sort((a, b) =>
              new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
            )[0];
            resolve(latestSession);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting user session:', error);
      return this.createDefaultUserSession();
    }
  }

  async updateUserPreferences(preferences: Partial<UserSessionData['preferences']>): Promise<void> {
    try {
      const currentSession = await this.getUserSession();
      if (!currentSession) return;

      const updatedSession: UserSessionData = {
        ...currentSession,
        preferences: { ...currentSession.preferences, ...preferences },
        lastActive: new Date()
      };

      await this.saveUserSession(updatedSession);
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  // ============== VEHICLE PROFILE OPERATIONS ==============

  async saveVehicleProfile(profile: VehicleProfile): Promise<void> {
    try {
      const store = await this.getTransaction(STORES.VEHICLE_PROFILES, 'readwrite');

      return new Promise((resolve, reject) => {
        const request = store.put(profile);
        request.onsuccess = () => {
          console.log('Vehicle profile saved successfully:', profile.id);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving vehicle profile:', error);
      throw error;
    }
  }

  async getVehicleProfile(id: string): Promise<VehicleProfile | null> {
    try {
      const store = await this.getTransaction(STORES.VEHICLE_PROFILES);

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting vehicle profile:', error);
      return null;
    }
  }

  async getAllVehicleProfiles(): Promise<VehicleProfile[]> {
    try {
      const store = await this.getTransaction(STORES.VEHICLE_PROFILES);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          // Filter active profiles and sort by last updated
          const results = request.result
            .filter(profile => profile.isActive)
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all vehicle profiles:', error);
      return [];
    }
  }

  async updateVehicleProfile(id: string, updates: Partial<VehicleProfile>): Promise<void> {
    try {
      const existingProfile = await this.getVehicleProfile(id);
      if (!existingProfile) throw new Error('Vehicle profile not found');

      const updatedProfile: VehicleProfile = {
        ...existingProfile,
        ...updates,
        lastUpdated: new Date()
      };

      await this.saveVehicleProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating vehicle profile:', error);
      throw error;
    }
  }

  async deleteVehicleProfile(id: string): Promise<void> {
    try {
      // Soft delete by setting isActive to false
      await this.updateVehicleProfile(id, { isActive: false });
    } catch (error) {
      console.error('Error deleting vehicle profile:', error);
      throw error;
    }
  }

  // ============== SEARCH AND ANALYTICS ==============

  async searchExtractedData(query: string): Promise<ExtractedServiceData[]> {
    try {
      const allData = await this.getAllExtractedData();
      const lowerQuery = query.toLowerCase();

      return allData.filter(data => {
        const searchableFields = [
          data.serviceInfo.primaryService,
          data.serviceInfo.category,
          data.vehicleInfo.make,
          data.vehicleInfo.model,
          data.shopInfo.name,
          data.rawData.originalText,
          data.rawData.extractedText,
          ...(data.serviceInfo.secondaryServices || []),
          ...(data.userContext?.symptoms || []),
          ...(data.technicalInfo.recommendedMaintenance || [])
        ];

        return searchableFields.some(field =>
          field && field.toLowerCase().includes(lowerQuery)
        );
      });
    } catch (error) {
      console.error('Error searching extracted data:', error);
      return [];
    }
  }

  async getServiceStats(): Promise<{
    totalServices: number;
    totalSpent: number;
    averageServiceCost: number;
    topServices: Array<{ service: string; count: number }>;
    topShops: Array<{ shop: string; count: number }>;
  }> {
    try {
      const allData = await this.getAllExtractedData();

      const totalServices = allData.length;
      const costsWithValues = allData
        .map(d => d.pricing.finalTotal || d.pricing.subtotal || 0)
        .filter(cost => cost > 0);

      const totalSpent = costsWithValues.reduce((sum, cost) => sum + cost, 0);
      const averageServiceCost = costsWithValues.length > 0 ? totalSpent / costsWithValues.length : 0;

      // Count services
      const serviceCounts: { [key: string]: number } = {};
      const shopCounts: { [key: string]: number } = {};

      allData.forEach(data => {
        const service = data.serviceInfo.primaryService;
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;

        const shop = data.shopInfo.name;
        if (shop) {
          shopCounts[shop] = (shopCounts[shop] || 0) + 1;
        }
      });

      const topServices = Object.entries(serviceCounts)
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topShops = Object.entries(shopCounts)
        .map(([shop, count]) => ({ shop, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalServices,
        totalSpent,
        averageServiceCost,
        topServices,
        topShops
      };
    } catch (error) {
      console.error('Error calculating service stats:', error);
      return {
        totalServices: 0,
        totalSpent: 0,
        averageServiceCost: 0,
        topServices: [],
        topShops: []
      };
    }
  }

  // ============== DATA MANAGEMENT ==============

  async exportAllData(): Promise<string> {
    try {
      const extractedData = await this.getAllExtractedData();
      const vehicleProfiles = await this.getAllVehicleProfiles();
      const userSession = await this.getUserSession();

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        extractedData,
        vehicleProfiles,
        userSession
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);

      // Import extracted data
      if (importData.extractedData && Array.isArray(importData.extractedData)) {
        for (const data of importData.extractedData) {
          await this.saveExtractedData(data);
        }
      }

      // Import vehicle profiles
      if (importData.vehicleProfiles && Array.isArray(importData.vehicleProfiles)) {
        for (const profile of importData.vehicleProfiles) {
          await this.saveVehicleProfile(profile);
        }
      }

      // Import user session
      if (importData.userSession) {
        await this.saveUserSession(importData.userSession);
      }

      console.log('Data import completed successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await this.initDB();
      if (!this.db) throw new Error('Database not initialized');

      // Clear IndexedDB
      const transaction = this.db.transaction([
        STORES.EXTRACTED_DATA,
        STORES.VEHICLE_PROFILES,
        STORES.USER_SESSION
      ], 'readwrite');

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.EXTRACTED_DATA).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.VEHICLE_PROFILES).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.USER_SESSION).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ]);

      // Clear localStorage
      localStorage.removeItem('buckled_user_preferences');
      localStorage.removeItem('buckled_user_location');

      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // ============== HELPER METHODS ==============

  private createDefaultUserSession(): UserSessionData {
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

  /**
   * Get quick stats for dashboard
   */
  async getQuickStats(): Promise<{
    recentServices: number;
    totalVehicles: number;
    pendingActions: number;
  }> {
    try {
      const [extractedData, vehicleProfiles] = await Promise.all([
        this.getAllExtractedData(),
        this.getAllVehicleProfiles()
      ]);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentServices = extractedData.filter(
        data => new Date(data.timestamp) > thirtyDaysAgo
      ).length;

      const pendingActions = extractedData.filter(
        data => data.serviceInfo.urgencyLevel === 'high' ||
               data.serviceInfo.urgencyLevel === 'emergency' ||
               data.timeline.isUrgent
      ).length;

      return {
        recentServices,
        totalVehicles: vehicleProfiles.length,
        pendingActions
      };
    } catch (error) {
      console.error('Error getting quick stats:', error);
      return { recentServices: 0, totalVehicles: 0, pendingActions: 0 };
    }
  }
}

// Create and export singleton instance
export const storageManager = new StorageManager();
export default storageManager;