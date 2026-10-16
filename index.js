const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// --- API ENDPOINTS ---

// Database & System Status
app.get('/api/status', async (req, res) => {
  try {
    const status = db.getStatus();
    const all = await db.getAllOrders();
    const stats = {
      total: all.length,
      inWorkshop: all.filter(o => o.stage < 6).length,
      inDiagnostic: all.filter(o => o.stage === 1).length,
      inRepair: all.filter(o => o.stage === 3).length,
      ready: all.filter(o => o.stage === 5).length,
      delivered: all.filter(o => o.stage === 6).length,
      totalBudget: all.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    };
    res.json({ success: true, db: status, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configure & Test Supabase credentials
app.post('/api/config-supabase', async (req, res) => {
  const { supabaseUrl, supabaseKey } = req.body;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(400).json({ success: false, message: 'Se requiere URL y clave Anon de Supabase' });
  }

  const cleanUrl = (supabaseUrl || '').trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  const cleanKey = (supabaseKey || '').trim();

  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    if (envContent.includes('SUPABASE_URL=')) {
      envContent = envContent.replace(/SUPABASE_URL=.*/g, `SUPABASE_URL=${cleanUrl}`);
    } else {
      envContent += `\nSUPABASE_URL=${cleanUrl}`;
    }

    if (envContent.includes('SUPABASE_KEY=')) {
      envContent = envContent.replace(/SUPABASE_KEY=.*/g, `SUPABASE_KEY=${cleanKey}`);
    } else {
      envContent += `\nSUPABASE_KEY=${cleanKey}`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    // Update in process.env
    process.env.SUPABASE_URL = cleanUrl;
    process.env.SUPABASE_KEY = cleanKey;

    // Re-init Supabase in DB manager
    db.initSupabase();
    const testResult = await db.testSupabaseConnection();

    res.json({
      success: true,
      tested: testResult,
      status: db.getStatus(),
      message: testResult.ok
        ? '¡Conexión exitosa a Supabase Cloud!'
        : `Credenciales guardadas, pero Supabase respondió: ${testResult.error}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all orders (with search & stage filtering)
app.get('/api/orders', async (req, res) => {
  try {
    const search = req.query.search || '';
    const stage = req.query.stage !== undefined && req.query.stage !== '' ? parseInt(req.query.stage, 10) : undefined;
    const orders = await db.getAllOrders({ search, stage });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Public Client Tracking Portal (Search by plate or order id)
app.get('/api/track/:term', async (req, res) => {
  try {
    const term = req.params.term;
    const order = await db.getOrderByPlateOrId(term);
    if (!order) {
      return res.status(404).json({ success: false, message: 'No se encontró ningún vehículo con esa placa u orden.' });
    }
    // Return sanitized public vehicle tracking view
    res.json({
      success: true,
      tracking: {
        id: order.id,
        vehicle: `${order.vehicle_brand} ${order.vehicle_model} (${order.vehicle_year || 'Año N/D'})`,
        plate: order.plate,
        owner: order.owner_name,
        color: order.vehicle_color,
        km: order.km,
        fuel: order.fuel_level,
        issue: order.issue,
        technical_diagnosis: order.technical_diagnosis,
        stage: order.stage,
        mechanic_name: order.mechanic_name,
        parts: order.parts,
        total_amount: order.total_amount,
        currency: order.currency,
        updated_at: order.updated_at || order.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden de trabajo no encontrada' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { owner_name, plate, vehicle_model, issue } = req.body;
    if (!owner_name || !plate) {
      return res.status(400).json({ success: false, message: 'Nombre del dueño y placa son obligatorios' });
    }
    const newOrder = await db.createOrder(req.body);
    res.status(201).json({ success: true, order: newOrder, message: 'Orden de trabajo creada con éxito' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update order
app.put('/api/orders/:id', async (req, res) => {
  try {
    const updated = await db.updateOrder(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }
    res.json({ success: true, order: updated, message: 'Orden actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const deleted = await db.deleteOrder(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }
    res.json({ success: true, message: 'Orden eliminada satisfactoriamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset demo data
app.post('/api/reset-demo', async (req, res) => {
  try {
    await db.resetDemo();
    const orders = await db.getAllOrders();
    res.json({ success: true, message: 'Base de datos restaurada con datos demo iniciales', count: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export CSV
app.get('/api/export/csv', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    const headers = ['ID', 'Placa', 'Vehiculo', 'Cliente', 'Telefono', 'Falla', 'Estado', 'Total', 'Fecha'];
    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${o.plate}"`,
      `"${o.vehicle_brand} ${o.vehicle_model}"`,
      `"${o.owner_name}"`,
      `"${o.owner_phone}"`,
      `"${(o.issue || '').replace(/"/g, '""')}"`,
      `"${o.stage}"`,
      `"${o.total_amount}"`,
      `"${o.created_at}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_fluxo_garage.csv"');
    res.send('\uFEFF' + csvContent);
  } catch (error) {
    res.status(500).send('Error exportando CSV');
  }
});

// Fallback to index.html
app.use((req, res) => {
  const rootIndex = path.join(__dirname, 'index.html');
  if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server locally if not inside Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 FLUXO GARAGE - Servidor Taller Mecánico Activo`);
    console.log(`📍 URL Local: http://localhost:${PORT}`);
    console.log(`🗄️ Modo Base de Datos: ${db.getStatus().provider.toUpperCase()}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
