/**
 * Master list of meter nodes taken from "Neraca Meteran Air" diagram.
 * This is the single source of truth the frontend's NODES array mirrors.
 *
 * category:
 *   pemakaian - Pemakaian Air (blue)
 *   reject    - Reject Air (green)
 *   limbah    - Limbah Cair ke WWTP (orange)
 *   buangan   - Buangan Langsung ke Kawasan (teal)
 *   manual    - Perhitungan Manual, no live meter yet (yellow)
 *
 * protocol: "modbus-rtu" | "rs485" | "manual" | "mqtt"
 * baseline: last known manual/reference value (m3/bulan), used as mock
 *           fallback whenever InfluxDB has no data yet for that node.
 */
module.exports = [
  { id: 'wtp_giic',         name: 'WTP Kawasan GIIC',                    category: 'pemakaian', lane: 1, deviceId: 'FM-WTP-01', protocol: 'modbus-rtu', modbusAddress: 1,  baseline: 540 },
  { id: 'reject_osmotron',  name: 'Reject Osmotron',                     category: 'reject',    lane: 2, deviceId: 'FM-OSM-RJ', protocol: 'modbus-rtu', modbusAddress: 2,  baseline: 313 },
  { id: 'osmotron',         name: 'Osmotron',                            category: 'manual',    lane: 2, deviceId: 'MANUAL-01', protocol: 'manual',     modbusAddress: null, baseline: 802 },
  { id: 'kebutuhan_pabrik', name: 'Kebutuhan Pabrik',                    category: 'manual',    lane: 2, deviceId: 'MANUAL-02', protocol: 'manual',     modbusAddress: null, baseline: 629 },
  { id: 'loopo_pw',         name: 'Loopo PW',                            category: 'manual',    lane: 2, deviceId: 'MANUAL-03', protocol: 'manual',     modbusAddress: null, baseline: 490 },
  { id: 'air_mancur',       name: 'Air Mancur',                          category: 'pemakaian', lane: 3, deviceId: 'FM-AMC-01', protocol: 'rs485',      modbusAddress: 3,  baseline: 50 },
  { id: 'taman',            name: 'Taman, Air Mancur, Pos Jaga',         category: 'pemakaian', lane: 3, deviceId: 'FM-TMN-01', protocol: 'rs485',      modbusAddress: 4,  baseline: 223 },
  { id: 'boiler',           name: 'Boiler',                              category: 'pemakaian', lane: 3, deviceId: 'FM-BLR-01', protocol: 'modbus-rtu', modbusAddress: 5,  baseline: 170 },
  { id: 'domestik',         name: 'Domestik Karyawan',                   category: 'pemakaian', lane: 3, deviceId: 'FM-DOM-01', protocol: 'modbus-rtu', modbusAddress: 6,  baseline: 344 },
  { id: 'inlet_pretreat',   name: 'Inlet Pretreatment',                  category: 'pemakaian', lane: 1, deviceId: 'FM-IPT-01', protocol: 'modbus-rtu', modbusAddress: 7,  baseline: 1183 },
  { id: 'outlet_pretreat',  name: 'Outlet Pretreatment',                 category: 'pemakaian', lane: 1, deviceId: 'FM-OPT-01', protocol: 'modbus-rtu', modbusAddress: 8,  baseline: 1070 },
  { id: 'softwater',        name: 'Softwater',                           category: 'pemakaian', lane: 1, deviceId: 'FM-SW-01',  protocol: 'modbus-rtu', modbusAddress: 9,  baseline: 268 },
  { id: 'lantai1',          name: 'Lantai 1',                            category: 'manual',    lane: 4, deviceId: 'MANUAL-04', protocol: 'manual',     modbusAddress: null, baseline: 219 },
  { id: 'lantai2',          name: 'Lantai 2',                            category: 'manual',    lane: 4, deviceId: 'MANUAL-05', protocol: 'manual',     modbusAddress: null, baseline: 53 },
  { id: 'lantai34',         name: 'Lantai 3,4',                          category: 'pemakaian', lane: 4, deviceId: 'FM-L34-01', protocol: 'rs485',      modbusAddress: 10, baseline: 24 },
  { id: 'workshop',         name: 'Workshop, Koperasi',                  category: 'pemakaian', lane: 4, deviceId: 'FM-WKS-01', protocol: 'rs485',      modbusAddress: 11, baseline: 48 },
  { id: 'washing_lab',      name: 'Washing, Janitor, Produksi & Lab',    category: 'manual',    lane: 5, deviceId: 'MANUAL-06', protocol: 'manual',     modbusAddress: null, baseline: 259 },
  { id: 'mesin_cip',        name: 'Mesin CIP',                           category: 'pemakaian', lane: 5, deviceId: 'FM-CIP-01', protocol: 'modbus-rtu', modbusAddress: 12, baseline: 231 },
  { id: 'chiller',          name: 'Chiller',                             category: 'pemakaian', lane: 5, deviceId: 'FM-CHL-01', protocol: 'modbus-rtu', modbusAddress: 13, baseline: 21 },
  { id: 'hot_water',        name: 'Hot Water',                           category: 'pemakaian', lane: 5, deviceId: 'FM-HTW-01', protocol: 'modbus-rtu', modbusAddress: 14, baseline: 27 },
  { id: 'washing_lt1',      name: 'Washing, Janitor, & Produksi Lt.1',   category: 'manual',    lane: 5, deviceId: 'MANUAL-07', protocol: 'manual',     modbusAddress: null, baseline: 187 },
  { id: 'lab_lt2',          name: 'Lab Lt.2',                            category: 'pemakaian', lane: 5, deviceId: 'FM-LAB-01', protocol: 'rs485',      modbusAddress: 15, baseline: 32 },
  { id: 'inlet_wwtp',       name: 'Inlet WWTP',                          category: 'limbah',    lane: 6, deviceId: 'FM-IWW-01', protocol: 'modbus-rtu', modbusAddress: 16, baseline: 1084 },
  { id: 'outlet_wwtp',      name: 'Outlet WWTP',                         category: 'limbah',    lane: 6, deviceId: 'FM-OWW-01', protocol: 'modbus-rtu', modbusAddress: 17, baseline: 1084 },
  { id: 'wwtp_zona_a',      name: 'WWTP GIIC Zona A',                    category: 'buangan',   lane: 6, deviceId: 'FM-ZNA-01', protocol: 'rs485',      modbusAddress: 18, baseline: 1084 },
];
