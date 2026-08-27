const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const XLSX = require('xlsx');
const nodesService = require('../services/nodes.service');

function toRows(nodes) {
  return nodes.map((n) => ({
    Node: n.name,
    Kategori: n.category,
    'Nilai (m3)': n.value,
    Satuan: 'm3/bulan',
    DeviceID: n.deviceId,
    Protokol: n.protocol,
    UpdateTerakhir: n.lastUpdate,
  }));
}

// GET /api/export/csv - full node table as CSV
router.get('/csv', (req, res, next) => {
  try {
    const rows = toRows(nodesService.listNodes());
    const csv = new Parser().parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment(`neraca_air_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// GET /api/export/xlsx - full node table as Excel workbook
router.get('/xlsx', (req, res, next) => {
  try {
    const rows = toRows(nodesService.listNodes());
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Neraca Air');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`neraca_air_${Date.now()}.xlsx`);
    res.send(buf);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
