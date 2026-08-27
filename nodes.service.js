const nodesConfig = require('../data/nodes.config');
const influx = require('../config/influxdb');

// In-memory "latest reading" cache. Populated by /api/ingest, or by baseline
// values until real devices start posting. Swap this for a proper cache
// (Redis) if running multiple backend instances.
const latestReadings = new Map(
  nodesConfig.map((n) => [n.id, { value: n.baseline, timestamp: new Date().toISOString(), source: 'baseline' }])
);

function listNodes() {
  return nodesConfig.map((n) => {
    const latest = latestReadings.get(n.id);
    return { ...n, value: latest.value, lastUpdate: latest.timestamp, source: latest.source };
  });
}

function getNode(id) {
  const cfg = nodesConfig.find((n) => n.id === id);
  if (!cfg) return null;
  const latest = latestReadings.get(id);
  return { ...cfg, value: latest.value, lastUpdate: latest.timestamp, source: latest.source };
}

/** Called by the ingest route whenever a device posts a new reading. */
function recordReading(nodeId, value, meta = {}) {
  const cfg = nodesConfig.find((n) => n.id === nodeId);
  if (!cfg) throw new Error(`Unknown nodeId: ${nodeId}`);
  latestReadings.set(nodeId, {
    value: Number(value),
    timestamp: meta.timestamp || new Date().toISOString(),
    source: meta.protocol || 'device',
  });
  return getNode(nodeId);
}

/** Deterministic mock history generator, used whenever InfluxDB has no data yet. */
function mockHistory(node, months = 6) {
  let seed = [...node.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const now = new Date();
  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const isLast = i === 0;
    const drift = (rnd() - 0.5) * 0.22;
    const value = isLast ? node.value : Math.max(1, Math.round(node.value * (1 + drift)));
    out.push({ time: d.toISOString(), value });
  }
  return out;
}

async function getHistory(nodeId, range) {
  const node = getNode(nodeId);
  if (!node) return null;

  if (influx.enabled) {
    const rows = await influx.queryHistory(nodeId, range);
    if (rows && rows.length) return rows;
  }
  return mockHistory(node);
}

module.exports = { listNodes, getNode, recordReading, getHistory };
