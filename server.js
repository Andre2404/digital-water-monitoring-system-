require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const nodesRoutes = require('./routes/nodes.routes');
const ingestRoutes = require('./routes/ingest.routes');
const exportRoutes = require('./routes/export.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'aquaflow-hmi-backend' }));

app.use('/api/nodes', nodesRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/export', exportRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

app.listen(PORT, () => {
  console.log(`AquaFlow HMI backend listening on http://localhost:${PORT}`);
  console.log(`  GET  /api/nodes            - list all meter nodes`);
  console.log(`  GET  /api/nodes/:id        - node detail`);
  console.log(`  GET  /api/nodes/:id/history - time series for charts`);
  console.log(`  POST /api/ingest           - IoT/RS485 gateway pushes a reading here`);
  console.log(`  GET  /api/export/csv|xlsx  - server-side export`);
});
