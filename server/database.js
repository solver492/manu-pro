import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('manutentionnaires.db');



// Créer les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    status TEXT DEFAULT 'actif' CHECK(status IN ('actif', 'inactif'))
  );

  CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    handler_count INTEGER NOT NULL,
    shipment_date DATE NOT NULL,
    cost_total REAL GENERATED ALWAYS AS (handler_count * 150.0) STORED,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT
  );
`);

// Insérer des données initiales si les tables sont vides
const siteCount = db.prepare('SELECT COUNT(*) as count FROM sites').get().count;
if (siteCount === 0) {
  const insertSite = db.prepare(`
    INSERT INTO sites (id, name, address, status) 
    VALUES (?, ?, ?, ?)
  `);

  const sites = [
    { id: 'site-1', name: 'Centre Commercial Agdal', address: 'Avenue Mohammed VI, Rabat', status: 'actif' },
    { id: 'site-2', name: 'Usine Textile Casablanca', address: 'Zone Industrielle Ain Sebaa, Casablanca', status: 'actif' },
    { id: 'site-3', name: 'Entrepôt Logistique Tanger', address: 'Port de Tanger Med, Tanger', status: 'actif' },
    { id: 'site-4', name: 'Marché Central Marrakech', address: 'Place Jemaa el-Fna, Marrakech', status: 'actif' },
    { id: 'site-5', name: 'Zone Franche Kénitra', address: 'Atlantic Free Zone, Kénitra', status: 'actif' }
  ];

  sites.forEach(site => insertSite.run(site.id, site.name, site.address, site.status));
}

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, full_name) 
    VALUES (?, ?, ?, ?)
  `);
  
  insertUser.run('user-1', 'admin@example.com', 'password', 'Administrateur');
}

// Préparer les requêtes
const queries = {
  // Sites
  getAllSites: db.prepare('SELECT * FROM sites'),
  getSiteById: db.prepare('SELECT * FROM sites WHERE id = ?'),
  insertSite: db.prepare('INSERT INTO sites (id, name, address, status) VALUES (?, ?, ?, ?)'),
  updateSite: db.prepare(`
    UPDATE sites
    SET name = ?, address = ?, status = ?
    WHERE id = ?
  `),

  // Mettre à jour tous les sites en actif
  updateAllSitesStatus: db.prepare(`
    UPDATE sites
    SET status = 'actif'
    WHERE id = 'IRIS' OR 1=1
  `),

  // Mettre à jour le statut d'un site spécifique
  updateSiteStatus: db.prepare(`
    UPDATE sites
    SET status = ?
    WHERE id = ?
  `),
  deleteSite: db.prepare('DELETE FROM sites WHERE id = ?'),

  // Shipments
  getAllShipments: db.prepare('SELECT * FROM shipments ORDER BY shipment_date DESC'),
  getShipmentsBySite: db.prepare('SELECT * FROM shipments WHERE site_id = ? ORDER BY shipment_date DESC'),
  insertShipment: db.prepare('INSERT INTO shipments (id, site_id, handler_count, shipment_date) VALUES (?, ?, ?, ?)'),
  deleteShipment: db.prepare('DELETE FROM shipments WHERE id = ?'),

  // Users
  getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  insertUser: db.prepare('INSERT INTO users (id, email, password, full_name) VALUES (?, ?, ?, ?)'),

  // Stats queries
  getShipmentsThisMonth: db.prepare(`
    SELECT SUM(handler_count) as total 
    FROM shipments 
    WHERE strftime('%Y-%m', shipment_date) = strftime('%Y-%m', 'now')
  `),
  getShipmentsThisYear: db.prepare(`
    SELECT SUM(handler_count) as total 
    FROM shipments 
    WHERE strftime('%Y', shipment_date) = strftime('%Y', 'now')
  `),
  getMonthlyShipments: db.prepare(`
    SELECT strftime('%m', shipment_date) as month, SUM(handler_count) as count
    FROM shipments 
    WHERE strftime('%Y', shipment_date) = strftime('%Y', 'now')
    GROUP BY strftime('%m', shipment_date)
  `),
  getTopSites: db.prepare(`
    SELECT s.name, SUM(sh.handler_count) as total_handlers
    FROM sites s
    LEFT JOIN shipments sh ON s.id = sh.site_id
    GROUP BY s.id, s.name
    ORDER BY total_handlers DESC
    LIMIT 5
  `),

  // Statistiques spécifiques au site
  getSiteTodayShipments: db.prepare(`
    SELECT SUM(handler_count) as total
    FROM shipments
    WHERE site_id = ? AND date(shipment_date) = date('now')
  `),

  getSiteMonthShipments: db.prepare(`
    SELECT SUM(handler_count) as total
    FROM shipments
    WHERE site_id = ? AND strftime('%Y-%m', shipment_date) = strftime('%Y-%m', 'now')
  `),

  getSiteTotalCost: db.prepare(`
    SELECT SUM(cost_total) as total
    FROM shipments
    WHERE site_id = ?
  `),

  // Historique des 6 derniers mois pour un site
  getSiteMonthlyHistory: db.prepare(`
    WITH months AS (
      SELECT 0 as offset
      UNION ALL SELECT 1
      UNION ALL SELECT 2
      UNION ALL SELECT 3
      UNION ALL SELECT 4
      UNION ALL SELECT 5
    )
    SELECT
      strftime('%m', date('now', '-' || offset || ' months', 'start of month')) as month,
      strftime('%Y', date('now', '-' || offset || ' months', 'start of month')) as year,
      COALESCE(SUM(handler_count), 0) as count
    FROM months m
    LEFT JOIN shipments s ON
      s.site_id = ? AND
      strftime('%Y-%m', s.shipment_date) = strftime('%Y-%m', date('now', '-' || offset || ' months', 'start of month'))
    GROUP BY offset
    ORDER BY year DESC, month DESC
  `)
};

export { db, queries };
