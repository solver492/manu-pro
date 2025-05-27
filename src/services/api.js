
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur réseau');
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Sites
  async getSites() {
    return this.request('/sites');
  }

  async getSite(id) {
    return this.request(`/sites/${id}`);
  }

  async createSite(siteData) {
    return this.request('/sites', {
      method: 'POST',
      body: JSON.stringify(siteData),
    });
  }

  async updateSite(id, siteData) {
    return this.request(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(siteData),
    });
  }

  async deleteSite(id) {
    return this.request(`/sites/${id}`, {
      method: 'DELETE',
    });
  }

  // Shipments
  async getShipments() {
    return this.request('/shipments');
  }

  async getSiteShipments(siteId) {
    return this.request(`/sites/${siteId}/shipments`);
  }

  async createShipment(shipmentData) {
    return this.request('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  }

  // Auth
  async login(email, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Stats
  async getDashboardStats() {
    return this.request('/stats/dashboard');
  }
}

export default new ApiService();
