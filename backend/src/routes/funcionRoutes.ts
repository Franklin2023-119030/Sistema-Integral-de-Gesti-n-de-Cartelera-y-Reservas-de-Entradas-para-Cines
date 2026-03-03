import { Router } from 'express';
import { getFuncionesByPelicula, getAsientosByFuncion } from '../controllers/funcionController';

const router = Router();

router.get('/pelicula/:peliculaId', getFuncionesByPelicula);
router.get('/:funcionId/asientos', getAsientosByFuncion);

export default router;