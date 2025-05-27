import express from 'express';
import cors from 'cors';
import { queries } from './database.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || (process.env.REPL_SLUG ? 5000 : 3001);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur backend fonctionnel' });
});

// Routes pour les sites
app.get('/api/sites', (req, res) => {
  try {
    const sites = queries.getAllSites.all('active');
    res.json({ data: sites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sites/:id', (req, res) => {
  try {
    const site = queries.getSiteById.get(req.params.id);
    if (!site) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }
    res.json(site);
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
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/sites/:id', (req, res) => {
  try {
    const { name, address, status } = req.body;
    const result = queries.updateSite.run(name, address, status, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }
    res.json({ id: req.params.id, name, address, status });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/sites/:id', (req, res) => {
  try {
    const result = queries.deleteSite.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }
    res.json({ message: 'Site supprimé avec succès' });
  } catch (error) {
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
    const { email, password } = req.body;
    const user = queries.getUserByEmail.get(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    res.json({ 
      message: 'Connexion réussie', 
      user: { id: user.id, email: user.email, fullName: user.full_name } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les statistiques
app.get('/api/stats/dashboard', (req, res) => {
  try {
    const thisMonth = queries.getShipmentsThisMonth.get()?.total || 0;
    const thisYear = queries.getShipmentsThisYear.get()?.total || 0;
    const monthlyData = queries.getMonthlyShipments.all();
    const topSites = queries.getTopSites.all();

    res.json({
      totalHandlersMonth: thisMonth,
      totalRevenueMonth: thisMonth * 150,
      totalHandlersYear: thisYear,
      totalRevenueYear: thisYear * 150,
      monthlySends: monthlyData,
      topClients: topSites
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur backend démarré sur http://0.0.0.0:${PORT}`);
  console.log(`API accessible sur: http://0.0.0.0:${PORT}/api`);
}).on('error', (err) => {
  console.error('Erreur serveur:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} déjà utilisé`);
  }
});