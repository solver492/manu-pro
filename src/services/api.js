
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  
  // Pour Replit, utiliser l'URL avec le port backend
  const hostname = window.location.hostname;
  if (hostname.includes('.replit.dev')) {
    return `${window.location.protocol}//${hostname.replace('-00-', '-01-')}:5000/api`;
  }
  
  return `${window.location.protocol}//${hostname}:5000/api`;
};

const API_BASE_URL = getApiBaseUrl();

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
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `Erreur HTTP ${response.status}` };
        }
        throw new Error(errorData.error || `Erreur réseau: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message || error);
      throw error;
    }
  }

  // Sites
  async getSites() {
    const response = await this.request('/sites');
    return Array.isArray(response) ? response : [];
  }

  async getSite(id) {
    return this.request(`/sites/${id}`);
  }

  async createSite(siteData) {
    return this.request('/sites', {
      method: 'POST',
      body: JSON.stringify(siteData)
    });
  }

  async updateSite(id, siteData) {
    return this.request(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(siteData)
    });
  }

  async deleteSite(id) {
    return this.request(`/sites/${id}`, {
      method: 'DELETE'
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
