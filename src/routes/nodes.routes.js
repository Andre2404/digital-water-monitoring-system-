const express = require('express');
const router = express.Router();
const nodesService = require('../services/nodes.service');

// GET /api/nodes - all meter nodes with latest values
router.get('/', (req, res) => {
  res.json({ data: nodesService.listNodes(), count: nodesService.listNodes().length });
});

// GET /api/nodes/:id - single node detail
router.get('/:id', (req, res) => {
  const node = nodesService.getNode(req.params.id);
  if (!node) return res.status(404).json({ error: `Node "${req.params.id}" not found` });
  res.json({ data: node });
});

// GET /api/nodes/:id/history?range=-180d - time series for charting
router.get('/:id/history', async (req, res, next) => {
  try {
    const range = req.query.range || '-180d';
    const history = await nodesService.getHistory(req.params.id, range);
    if (!history) return res.status(404).json({ error: `Node "${req.params.id}" not found` });
    res.json({ data: history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
