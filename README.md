# AquaFlow HMI — Backend

Backend API untuk dashboard Neraca Air Utilitas. Menyediakan data node/meter ke
frontend, menerima data dari perangkat IoT/RS485, dan menjembatani ke InfluxDB.

## Arsitektur singkat

```
[Flow meter RS485/Modbus] --> src/integrations/rs485-reader.js --> POST /api/ingest
[MQTT bridge / gateway IoT lain] ------------------------------> POST /api/ingest
                                                                       |
                                                                       v
                                                     src/services/nodes.service.js
                                                          |                    |
                                                          v                    v
                                                 in-memory cache      InfluxDB (opsional)
                                                          |                    |
                                                          v                    v
                                                GET /api/nodes*        GET /api/nodes/:id/history
                                                          |
                                                          v
                                                     Frontend HMI
```

Backend bisa langsung dipakai tanpa InfluxDB (data terakhir disimpan in-memory,
riwayat memakai mock generator deterministik) — cocok untuk development atau
demo sebelum server InfluxDB tersedia. Saat `INFLUX_ENABLED=true`, setiap
reading otomatis ditulis ke InfluxDB dan grafik riwayat membaca langsung dari
sana.

## Menjalankan

```bash
cp .env.example .env
npm install
npm run dev          # start API di http://localhost:4000
```

## Endpoint utama

| Method | Path                     | Keterangan                                   |
|--------|--------------------------|-----------------------------------------------|
| GET    | `/api/nodes`             | Semua node meter + nilai terakhir            |
| GET    | `/api/nodes/:id`         | Detail satu node                              |
| GET    | `/api/nodes/:id/history` | Time series untuk grafik (`?range=-180d`)     |
| POST   | `/api/ingest`            | Perangkat IoT/RS485 kirim satu reading        |
| POST   | `/api/ingest/batch`      | Kirim banyak reading sekaligus                |
| GET    | `/api/export/csv`        | Export seluruh node sebagai CSV               |
| GET    | `/api/export/xlsx`       | Export seluruh node sebagai Excel             |

Contoh payload `POST /api/ingest`:

```json
{
  "nodeId": "osmotron",
  "deviceId": "FM-OSM-01",
  "value": 802.4,
  "unit": "m3",
  "protocol": "modbus-rtu",
  "timestamp": "2026-08-07T09:15:00Z"
}
```

## Integrasi RS485 / Modbus RTU

`src/integrations/rs485-reader.js` adalah contoh worker yang:
1. Membuka koneksi ke RS485 (via USB-RS485 converter) menggunakan `modbus-serial`.
2. Polling tiap meter sesuai `modbusAddress` di `src/data/nodes.config.js`.
3. Mem-parsing register (default: float 32-bit dari 2 holding register — **sesuaikan
   dengan datasheet flow meter yang dipakai**, karena tiap merk beda).
4. POST hasil pembacaan ke `/api/ingest`.

Jalankan sebagai proses terpisah di mesin yang terhubung fisik ke bus RS485:

```bash
npm run rs485:reader
```

Untuk gateway berbasis MQTT (bukan RS485 langsung), buat bridge kecil yang
subscribe ke topic broker lalu forward payload-nya ke `/api/ingest` dengan
format yang sama.

## Integrasi InfluxDB

1. Set `INFLUX_ENABLED=true` di `.env`.
2. Isi `INFLUX_URL`, `INFLUX_TOKEN`, `INFLUX_ORG`, `INFLUX_BUCKET`.
3. Restart backend — setiap `POST /api/ingest` otomatis menulis Point ke
   measurement `flow_reading` dengan tag `node_id`, `device_id`, `protocol`.
4. `GET /api/nodes/:id/history` otomatis query Flux dan agregasi bulanan.

## Keamanan

`POST /api/ingest` bisa dikunci dengan shared-secret header `x-api-key`
(set `INGEST_API_KEY` di `.env`). Untuk produksi, disarankan menaruh backend
ini di belakang reverse proxy (nginx) dengan TLS, dan RS485 worker berjalan
di jaringan OT terpisah yang hanya boleh reach endpoint ingest.

## Struktur folder

```
src/
  server.js                  entry point Express
  data/nodes.config.js       master data node (source of truth)
  config/influxdb.js         client + write/query helper InfluxDB
  services/nodes.service.js  cache nilai terakhir + fallback mock history
  routes/nodes.routes.js     GET /api/nodes...
  routes/ingest.routes.js    POST /api/ingest...
  routes/export.routes.js    GET /api/export/csv|xlsx
  integrations/rs485-reader.js  contoh worker Modbus RTU
```
