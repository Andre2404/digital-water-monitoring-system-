const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const {
  INFLUX_URL,
  INFLUX_TOKEN,
  INFLUX_ORG,
  INFLUX_BUCKET,
  INFLUX_MEASUREMENT = 'flow_reading',
  INFLUX_ENABLED = 'false',
} = process.env;

const enabled = String(INFLUX_ENABLED).toLowerCase() === 'true';

let writeApi = null;
let queryApi = null;
let client = null;

if (enabled) {
  client = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
  writeApi = client.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ms');
  queryApi = client.getQueryApi(INFLUX_ORG);
  console.log(`[influx] enabled -> ${INFLUX_URL} org=${INFLUX_ORG} bucket=${INFLUX_BUCKET}`);
} else {
  console.log('[influx] disabled (INFLUX_ENABLED=false) - API is running on in-memory mock data');
}

/**
 * Write a single flow-meter reading to InfluxDB.
 * @param {{nodeId:string, deviceId:string, value:number, unit?:string, protocol?:string, timestamp?:Date}} reading
 */
async function writeReading(reading) {
  if (!enabled) return { skipped: true, reason: 'influx disabled' };

  const point = new Point(INFLUX_MEASUREMENT)
    .tag('node_id', reading.nodeId)
    .tag('device_id', reading.deviceId || 'unknown')
    .tag('protocol', reading.protocol || 'unknown')
    .floatField('value', Number(reading.value))
    .timestamp(reading.timestamp ? new Date(reading.timestamp) : new Date());

  writeApi.writePoint(point);
  await writeApi.flush();
  return { skipped: false };
}

/**
 * Fetch a time series for a given node over a Flux-style range (e.g. "-30d").
 * Returns [{time, value}]
 */
async function queryHistory(nodeId, range = '-180d') {
  if (!enabled) return null; // caller should fall back to mock data

  const flux = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "${INFLUX_MEASUREMENT}")
      |> filter(fn: (r) => r.node_id == "${nodeId}")
      |> filter(fn: (r) => r._field == "value")
      |> aggregateWindow(every: 1mo, fn: sum, createEmpty: false)
      |> sort(columns: ["_time"])
  `;

  const rows = [];
  await new Promise((resolve, reject) => {
    queryApi.queryRows(flux, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        rows.push({ time: o._time, value: o._value });
      },
      error: reject,
      complete: resolve,
    });
  });
  return rows;
}

module.exports = { enabled, writeReading, queryHistory };
