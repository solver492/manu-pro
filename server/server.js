import express from 'express';
import cors from 'cors';
import { db, queries } from './database.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS complète pour Replit
app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (ex: Postman) et les domaines Replit
    if (!origin) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('.replit.dev')) {
      return callback(null, true);
    }
    return callback(null, true); // Permettre tous les origins pour le développement
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur backend fonctionnel' });
});

// Routes pour les sites
app.get('/api/sites', (req, res) => {
  try {
    const sites = queries.getAllSites.all();
    // Forcer le statut actif pour tous les sites
    const activeSites = sites.map(site => ({
      ...site,
      status: 'actif'
    }));
    console.log('Sites envoyés:', sites);
    res.json(activeSites || []);
  } catch (error) {
    console.error('Erreur lors de la récupération des sites:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sites/:id', (req, res) => {
  try {
    const site = queries.getSiteById.get(req.params.id);
    if (!site) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }

    // Récupérer les statistiques du site
    const todayStats = queries.getSiteTodayShipments.get(req.params.id);
    const monthStats = queries.getSiteMonthShipments.get(req.params.id);
    const totalCost = queries.getSiteTotalCost.get(req.params.id);
    const monthlyHistory = queries.getSiteMonthlyHistory.all(req.params.id);
    console.log('Historique mensuel:', monthlyHistory);

    res.json({
      ...site,
      status: 'actif',
      stats: {
        handlersToday: todayStats?.total || 0,
        handlersMonth: monthStats?.total || 0,
        totalCost: totalCost?.total || 0,
        monthlyHistory: monthlyHistory.map(m => ({
          month: new Date(2000, m.month - 1).toLocaleString('fr-FR', { month: 'short' }),
          year: m.year,
          count: m.count
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sites', (req, res) => {
  try {
    const { name, address, status = 'active' } = req.body;
    const id = uuidv4();
    queries.insertSite.run(id, name, address, status);
    res.status(201).json({ id, name, address, status });
  } catch (error) {
    console.error('Erreur lors de la création du site:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/sites/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, status } = req.body;
    const result = queries.updateSite.run(name, address, status, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }
    res.json({ id, name, address, status });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du site:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/sites/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = queries.deleteSite.run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du site:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les envois
app.get('/api/shipments', (req, res) => {
  try {
    const shipments = queries.getAllShipments.all();
    res.json({ data: shipments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sites/:id/shipments', (req, res) => {
  try {
    const shipments = queries.getShipmentsBySite.all(req.params.id);
    res.json({ data: shipments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/shipments', (req, res) => {
  try {
    const { siteId, handlerCount, shipmentDate } = req.body;
    const id = uuidv4();
    queries.insertShipment.run(id, siteId, handlerCount, shipmentDate);
    res.status(201).json({ id, siteId, handlerCount, shipmentDate });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route d'authentification
app.post('/api/login', (req, res) => {
  try {
    console.log('Tentative de connexion:', req.body);
    const { email, password } = req.body;
    const user = queries.getUserByEmail.get(email);
    console.log('Utilisateur trouvé:', user);
    
    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    if (user.password !== password) {
      console.log('Mot de passe incorrect');
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    console.log('Connexion réussie');
    res.json({ 
      message: 'Connexion réussie', 
      user: { id: user.id, email: user.email, fullName: user.full_name } 
    });
  } catch (error) {
    console.error('Erreur de login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les statistiques
app.get('/api/stats/dashboard', (req, res) => {
  try {
    console.log('Récupération des statistiques dashboard...');
    
    const thisMonth = queries.getShipmentsThisMonth.get()?.total || 0;
    const thisYear = queries.getShipmentsThisYear.get()?.total || 0;
    const monthlyData = queries.getMonthlyShipments.all();
    const topSites = queries.getTopSites.all();

    console.log('Stats calculées:', {
      thisMonth,
      thisYear,
      monthlyData: monthlyData.length,
      topSites: topSites.length
    });

    const result = {
      totalHandlersMonth: thisMonth,
      totalRevenueMonth: thisMonth * 150,
      totalHandlersYear: thisYear,
      totalRevenueYear: thisYear * 150,
      monthlySends: monthlyData || [],
      topClients: topSites || []
    };

    console.log('Réponse dashboard stats:', result);
    res.json(result);
  } catch (error) {
    console.error('Erreur stats dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/detailed', (req, res) => {
  try {
    const sites = queries.getAllSites.all();
    const allShipments = queries.getAllShipments.all();
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    const siteStats = sites.map(site => {
      const siteShipments = allShipments.filter(s => s.site_id === site.id);
      
      let handlersThisMonth = 0;
      let handlersThisYear = 0;
      
      siteShipments.forEach(shipment => {
        const shipDate = new Date(shipment.shipment_date);
        if (shipDate.getFullYear() === currentYear) {
          handlersThisYear += shipment.handler_count;
          if (shipDate.getMonth() === currentMonth) {
            handlersThisMonth += shipment.handler_count;
          }
        }
      });
      
      return {
        id: site.id,
        name: site.name,
        handlersThisMonth,
        handlersThisYear,
        revenueGenerated: handlersThisYear * 150
      };
    });
    
    res.json({ siteStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour tous les sites en actif
// Mettre à jour le statut d'un site spécifique
app.post('/api/sites/:id/status', (req, res) => {
  console.log('Mise à jour du statut pour le site:', req.params.id);
  console.log('Nouveau statut:', req.body);
  try {
    const { status } = req.body;
    queries.updateSiteStatus.run(status, req.params.id);
    res.json({ success: true, message: 'Statut du site mis à jour' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du statut' });
  }
});

app.post('/api/sites/update-all-status', (req, res) => {
  try {
    queries.updateAllSitesStatus.run();
    res.json({ success: true, message: 'Tous les sites ont été mis à jour en actif' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des sites:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour des sites' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur backend démarré sur http://0.0.0.0:${PORT}`);
  console.log(`📡 API accessible sur: http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Frontend accessible sur: http://0.0.0.0:5173`);
}).on('error', (err) => {
  console.error('❌ Erreur serveur:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} déjà utilisé`);
  }
});