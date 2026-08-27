const express = require('express');
const router = express.Router();
const nodesService = require('../services/nodes.service');
const influx = require('../config/influxdb');

/**
 * Shared-secret check for devices/gateways posting readings.
 * Set INGEST_API_KEY in .env; gateway sends header x-api-key.
 */
function checkApiKey(req, res, next) {
  const expected = process.env.INGEST_API_KEY;
  if (!expected) return next(); // no key configured -> open (dev mode only)
  const provided = req.header('x-api-key');
  if (provided !== expected) return res.status(401).json({ error: 'Invalid or missing x-api-key' });
  next();
}

/**
 * POST /api/ingest
 * Body: { nodeId, deviceId, value, unit, protocol, timestamp }
 * Called by:
 *  - src/integrations/rs485-reader.js  (Modbus RTU over RS485)
 *  - an MQTT bridge subscribing to flow-meter topics
 *  - any other IoT gateway that can speak HTTP/JSON
 */
router.post('/', checkApiKey, async (req, res, next) => {
  try {
    const { nodeId, value, deviceId, protocol, timestamp, unit } = req.body || {};

    if (!nodeId || value === undefined || value === null) {
      return res.status(400).json({ error: 'nodeId and value are required' });
    }
    if (Number.isNaN(Number(value))) {
      return res.status(400).json({ error: 'value must be numeric' });
    }

    const updated = nodesService.recordReading(nodeId, value, { deviceId, protocol, timestamp });

    await influx.writeReading({ nodeId, deviceId, value, unit, protocol, timestamp });

    res.status(201).json({ data: updated });
  } catch (err) {
    if (err.message?.startsWith('Unknown nodeId')) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

/** POST /api/ingest/batch - array of readings, e.g. a gateway flushing a buffer */
router.post('/batch', checkApiKey, async (req, res, next) => {
  try {
    const readings = req.body?.readings;
    if (!Array.isArray(readings) || !readings.length) {
      return res.status(400).json({ error: 'readings must be a non-empty array' });
    }
    const results = [];
    for (const r of readings) {
      const updated = nodesService.recordReading(r.nodeId, r.value, {
        deviceId: r.deviceId,
        protocol: r.protocol,
        timestamp: r.timestamp,
      });
      await influx.writeReading(r);
      results.push(updated);
    }
    res.status(201).json({ data: results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
