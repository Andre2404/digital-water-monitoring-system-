/**
 * RS485 / Modbus RTU flow-meter reader.
 *
 * Run standalone (separate process from the API server) on the machine
 * physically connected to the RS485 bus / USB-RS485 converter:
 *
 *   npm run rs485:reader
 *
 * It polls every meter defined in nodes.config.js that has protocol
 * "modbus-rtu" or "rs485" and a modbusAddress, then POSTs each reading to
 * the backend's /api/ingest endpoint. Swap the `readMeter()` body with your
 * actual flow-meter's register map (this varies by brand - Omron, Itron,
 * Kamstrup, etc. All expose a holding/input register that returns the
 * cumulative or instantaneous flow, refer to the meter's datasheet).
 */
require('dotenv').config();
const ModbusRTU = require('modbus-serial');
const cron = require('node-cron');
const nodes = require('../data/nodes.config').filter(
  (n) => n.protocol === 'modbus-rtu' || n.protocol === 'rs485'
);

const {
  RS485_SERIAL_PORT = '/dev/ttyUSB0',
  RS485_BAUD_RATE = 9600,
  RS485_POLL_INTERVAL_MS = 30000,
  INGEST_URL = 'http://localhost:4000/api/ingest',
  INGEST_API_KEY,
} = process.env;

const client = new ModbusRTU();

async function connect() {
  await client.connectRTUBuffered(RS485_SERIAL_PORT, { baudRate: Number(RS485_BAUD_RATE) });
  console.log(`[rs485] connected on ${RS485_SERIAL_PORT} @ ${RS485_BAUD_RATE} baud`);
}

/**
 * Read a single meter over Modbus RTU.
 * TODO: replace the register/address/length below with your flow meter's
 * actual register map. This example assumes a 32-bit float cumulative
 * total stored across 2 holding registers, a very common layout.
 */
async function readMeter(node) {
  client.setID(node.modbusAddress);
  const REGISTER_START = 0; // <- set to your meter's register address
  const REGISTER_LENGTH = 2; // <- 2 registers = 1 x 32-bit float

  const result = await client.readHoldingRegisters(REGISTER_START, REGISTER_LENGTH);
  const buf = Buffer.alloc(4);
  buf.writeUInt16BE(result.data[0], 0);
  buf.writeUInt16BE(result.data[1], 2);
  const value = buf.readFloatBE(0);
  return value;
}

async function pushReading(node, value) {
  const res = await fetch(INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(INGEST_API_KEY ? { 'x-api-key': INGEST_API_KEY } : {}),
    },
    body: JSON.stringify({
      nodeId: node.id,
      deviceId: node.deviceId,
      value,
      unit: 'm3',
      protocol: node.protocol,
      timestamp: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    console.error(`[rs485] ingest failed for ${node.id}: ${res.status} ${await res.text()}`);
  }
}

async function pollAll() {
  for (const node of nodes) {
    try {
      const value = await readMeter(node);
      await pushReading(node, value);
      console.log(`[rs485] ${node.name} (${node.deviceId}) = ${value.toFixed(2)} m3`);
    } catch (err) {
      console.error(`[rs485] failed to read ${node.name} (addr ${node.modbusAddress}):`, err.message);
    }
  }
}

async function main() {
  await connect();
  // Poll immediately, then on the configured interval.
  await pollAll();
  const seconds = Math.max(5, Math.round(Number(RS485_POLL_INTERVAL_MS) / 1000));
  cron.schedule(`*/${seconds} * * * * *`, pollAll);
  console.log(`[rs485] polling ${nodes.length} meters every ${seconds}s`);
}

main().catch((err) => {
  console.error('[rs485] fatal error', err);
  process.exit(1);
});
