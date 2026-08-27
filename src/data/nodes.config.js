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
 *
 * PLC metadata:
 *   plcIp    - IP address of the PLC / RTU gateway
 *   plcDb    - Data Block identifier (e.g. DB10)
 *   plcOffset - Register offset (e.g. DBD4)
 */
module.exports = [
  { id: 'wtp_giic',         name: 'WTP Kawasan GIIC',                    category: 'pemakaian', lane: 1, deviceId: 'FM-WTP-01', protocol: 'modbus-rtu', modbusAddress: 1,  baseline: 540,  plcIp: '192.168.1.10', plcDb: 'DB10', plcOffset: 'DBD0' },
  { id: 'reject_osmotron',  name: 'Reject Osmotron',                     category: 'reject',    lane: 2, deviceId: 'FM-OSM-RJ', protocol: 'modbus-rtu', modbusAddress: 2,  baseline: 313,  plcIp: '192.168.1.11', plcDb: 'DB10', plcOffset: 'DBD4' },
  { id: 'osmotron',         name: 'Osmotron',                            category: 'manual',    lane: 2, deviceId: 'MANUAL-01', protocol: 'manual',     modbusAddress: null, baseline: 802, plcIp: null, plcDb: null, plcOffset: null },
  { id: 'kebutuhan_pabrik', name: 'Kebutuhan Pabrik',                    category: 'manual',    lane: 2, deviceId: 'MANUAL-02', protocol: 'manual',     modbusAddress: null, baseline: 629, plcIp: null, plcDb: null, plcOffset: null },
  { id: 'loopo_pw',         name: 'Loopo PW',                            category: 'manual',    lane: 2, deviceId: 'MANUAL-03', protocol: 'manual',     modbusAddress: null, baseline: 490, plcIp: null, plcDb: null, plcOffset: null },
  { id: 'air_mancur',       name: 'Air Mancur',                          category: 'pemakaian', lane: 3, deviceId: 'FM-AMC-01', protocol: 'rs485',      modbusAddress: 3,  baseline: 50,   plcIp: '192.168.1.12', plcDb: 'DB11', plcOffset: 'DBD0' },
  { id: 'taman',            name: 'Taman, Air Mancur, Pos Jaga',         category: 'pemakaian', lane: 3, deviceId: 'FM-TMN-01', protocol: 'rs485',      modbusAddress: 4,  baseline: 223,  plcIp: '192.168.1.12', plcDb: 'DB11', plcOffset: 'DBD4' },
  { id: 'boiler',           name: 'Boiler',                              category: 'pemakaian', lane: 3, deviceId: 'FM-BLR-01', protocol: 'modbus-rtu', modbusAddress: 5,  baseline: 170,  plcIp: '192.168.1.13', plcDb: 'DB12', plcOffset: 'DBD0' },
  { id: 'domestik',         name: 'Domestik Karyawan',                   category: 'pemakaian', lane: 3, deviceId: 'FM-DOM-01', protocol: 'modbus-rtu', modbusAddress: 6,  baseline: 344,  plcIp: '192.168.1.13', plcDb: 'DB12', plcOffset: 'DBD4' },
  { id: 'inlet_pretreat',   name: 'Inlet Pretreatment',                  category: 'pemakaian', lane: 1, deviceId: 'FM-IPT-01', protocol: 'modbus-rtu', modbusAddress: 7,  baseline: 1183, plcIp: '192.168.1.14', plcDb: 'DB13', plcOffset: 'DBD0' },
  { id: 'outlet_pretreat',  name: 'Outlet Pretreatment',                 category: 'pemakaian', lane: 1, deviceId: 'FM-OPT-01', protocol: 'modbus-rtu', modbusAddress: 8,  baseline: 1070, plcIp: '192.168.1.14', plcDb: 'DB13', plcOffset: 'DBD4' },
  { id: 'softwater',        name: 'Softwater',                           category: 'pemakaian', lane: 1, deviceId: 'FM-SW-01',  protocol: 'modbus-rtu', modbusAddress: 9,  baseline: 268,  plcIp: '192.168.1.15', plcDb: 'DB14', plcOffset: 'DBD0' },
  { id: 'lantai1',          name: 'Lantai 1',                            category: 'manual',    lane: 4, deviceId: 'MANUAL-04', protocol: 'manual',     modbusAddress: null, baseline: 219, plcIp: null, plcDb: null, plcOffset: null },
  { id: 'lantai2',          name: 'Lantai 2',                            category: 'manual',    lane: 4, deviceId: 'MANUAL-05', protocol: 'manual',     modbusAddress: null, baseline: 53,  plcIp: null, plcDb: null, plcOffset: null },
  { id: 'lantai34',         name: 'Lantai 3,4',                          category: 'pemakaian', lane: 4, deviceId: 'FM-L34-01', protocol: 'rs485',      modbusAddress: 10, baseline: 24,   plcIp: '192.168.1.16', plcDb: 'DB15', plcOffset: 'DBD0' },
  { id: 'workshop',         name: 'Workshop, Koperasi',                  category: 'pemakaian', lane: 4, deviceId: 'FM-WKS-01', protocol: 'rs485',      modbusAddress: 11, baseline: 48,   plcIp: '192.168.1.16', plcDb: 'DB15', plcOffset: 'DBD4' },
  { id: 'washing_lab',      name: 'Washing, Janitor, Produksi & Lab',    category: 'manual',    lane: 5, deviceId: 'MANUAL-06', protocol: 'manual',     modbusAddress: null, baseline: 259, plcIp: null, plcDb: null, plcOffset: null },
  { id: 'mesin_cip',        name: 'Mesin CIP',                           category: 'pemakaian', lane: 5, deviceId: 'FM-CIP-01', protocol: 'modbus-rtu', modbusAddress: 12, baseline: 231,  plcIp: '192.168.1.17', plcDb: 'DB16', plcOffset: 'DBD0' },
  { id: 'chiller',          name: 'Chiller',                             category: 'pemakaian', lane: 5, deviceId: 'FM-CHL-01', protocol: 'modbus-rtu', modbusAddress: 13, baseline: 21,   plcIp: '192.168.1.17', plcDb: 'DB16', plcOffset: 'DBD4' },
  { id: 'hot_water',        name: 'Hot Water',                           category: 'pemakaian', lane: 5, deviceId: 'FM-HTW-01', protocol: 'modbus-rtu', modbusAddress: 14, baseline: 27,   plcIp: '192.168.1.18', plcDb: 'DB17', plcOffset: 'DBD0' },
  { id: 'washing_lt1',      name: 'Washing, Janitor, & Produksi Lt.1',   category: 'manual',    lane: 5, deviceId: 'MANUAL-07', protocol: 'manual',     modbusAddress: null, baseline: 187, plcIp: null, plcDb: null, plcOffset: null },
  { id: 'lab_lt2',          name: 'Lab Lt.2',                            category: 'pemakaian', lane: 5, deviceId: 'FM-LAB-01', protocol: 'rs485',      modbusAddress: 15, baseline: 32,   plcIp: '192.168.1.18', plcDb: 'DB17', plcOffset: 'DBD4' },
  { id: 'inlet_wwtp',       name: 'Inlet WWTP',                          category: 'limbah',    lane: 6, deviceId: 'FM-IWW-01', protocol: 'modbus-rtu', modbusAddress: 16, baseline: 1084, plcIp: '192.168.1.20', plcDb: 'DB20', plcOffset: 'DBD0' },
  { id: 'outlet_wwtp',      name: 'Outlet WWTP',                         category: 'limbah',    lane: 6, deviceId: 'FM-OWW-01', protocol: 'modbus-rtu', modbusAddress: 17, baseline: 1084, plcIp: '192.168.1.20', plcDb: 'DB20', plcOffset: 'DBD4' },
  { id: 'wwtp_zona_a',      name: 'WWTP GIIC Zona A',                    category: 'buangan',   lane: 6, deviceId: 'FM-ZNA-01', protocol: 'rs485',      modbusAddress: 18, baseline: 1084, plcIp: '192.168.1.21', plcDb: 'DB21', plcOffset: 'DBD0' },
];
