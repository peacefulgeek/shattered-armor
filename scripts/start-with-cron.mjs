/**
 * Render start script with cron-like scheduling for gated article publishing
 * Runs the Express server and checks daily for articles that should be published
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start the main server
const server = spawn('node', [path.join(__dirname, '..', 'dist', 'index.js')], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.kill('SIGINT');
});

console.log('Shattered Armor server started with article scheduling active');
