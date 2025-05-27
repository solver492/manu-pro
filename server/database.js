
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('manutentionnaires.db');

// Créer les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive'))
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
    ['site-1', 'Centre Commercial Agdal', 'Avenue Mohammed VI, Rabat', 'active'],
    ['site-2', 'Usine Textile Casablanca', 'Zone Industrielle Ain Sebaa, Casablanca', 'active'],
    ['site-3', 'Entrepôt Logistique Tanger', 'Port de Tanger Med, Tanger', 'active'],
    ['site-4', 'Marché Central Marrakech', 'Place Jemaa el-Fna, Marrakech', 'active'],
    ['site-5', 'Zone Franche Kénitra', 'Atlantic Free Zone, Kénitra', 'active']
  ];

  sites.forEach(site => insertSite.run(...site));
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
export const queries = {
  // Sites
  getAllSites: db.prepare('SELECT * FROM sites WHERE status = ?'),
  getSiteById: db.prepare('SELECT * FROM sites WHERE id = ?'),
  insertSite: db.prepare('INSERT INTO sites (id, name, address, status) VALUES (?, ?, ?, ?)'),
  updateSite: db.prepare('UPDATE sites SET name = ?, address = ?, status = ? WHERE id = ?'),
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
  `)
};

export default db;
