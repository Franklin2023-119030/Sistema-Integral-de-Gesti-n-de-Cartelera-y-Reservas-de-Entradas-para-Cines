import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import peliculaRoutes from './routes/peliculaRoutes'; // <-- Agregar
import funcionRoutes from './routes/funcionRoutes'; // <-- Importar

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/peliculas', peliculaRoutes); // <-- Agregar
app.use('/api/funciones', funcionRoutes); // <-- Agregar

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend del cine funcionando');
});

export default app;