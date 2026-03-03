import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import peliculaRoutes from './routes/peliculaRoutes'; // <-- Agregar

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/peliculas', peliculaRoutes); // <-- Agregar

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend del cine funcionando');
});

export default app;