
const { spawn } = require('child_process');

console.log('🚀 Démarrage du serveur backend...');

const backend = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

backend.on('error', (err) => {
  console.error('❌ Erreur de démarrage du backend:', err);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`🔴 Backend fermé avec le code ${code}`);
  if (code !== 0) {
    console.error('❌ Le backend s\'est fermé de manière inattendue');
    process.exit(1);
  }
});

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('🛑 Arrêt du backend...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du backend...');
  backend.kill('SIGTERM');
  process.exit(0);
});
