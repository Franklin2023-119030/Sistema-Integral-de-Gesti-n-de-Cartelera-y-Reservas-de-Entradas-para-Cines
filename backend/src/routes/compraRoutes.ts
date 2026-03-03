import { Router } from 'express';
import { crearCompra, getComprasByUsuario } from '../controllers/compraController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Protegemos las rutas con autenticación
router.post('/', authenticate, crearCompra);
router.get('/usuario/:usuarioId', authenticate, getComprasByUsuario);

export default router;