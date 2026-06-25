const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Permite que el frontend se comunique con el backend
app.use(cors());
app.use(express.json());

// Configuración de la conexión a Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Requerido para conexiones externas seguras
});

// Ruta para Obtener todas las notas (GET)
app.get('/api/notas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notas ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las notas de la base de datos' });
  }
});

// Ruta para Crear una nueva nota (POST)
app.post('/api/notas', async (req, res) => {
  const { autor, contenido } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO notas (autor, contenido) VALUES ($1, $2) RETURNING *',
      [autor, contenido]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la nota' });
  }
});
// ==========================================
// RUTA 3: BORRAR UNA NOTA (DELETE)
// ==========================================
app.delete('/api/notas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM notas WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'La nota no existe' });
    }
    
    res.json({ message: 'Nota eliminada con éxito', nota: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo eliminar la nota' });
  }
});

// ==========================================
// RUTA 4: ACTUALIZAR UNA NOTA (PUT)
// ==========================================
app.put('/api/notas/:id', async (req, res) => {
  const { id } = req.params;
  const { autor, contenido } = req.body;
  try {
    const result = await pool.query(
      'UPDATE notas SET autor = $1, contenido = $2 WHERE id = $3 RETURNING *',
      [autor, contenido, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'La nota no existe' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo actualizar la nota' });
  }
});

app.listen(port, () => {
  console.log(`Servidor API corriendo con éxito en el puerto ${port}`);
});
