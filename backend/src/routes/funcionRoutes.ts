import { Router } from 'express';
import { getFuncionesByPelicula, getAllFunciones } from '../controllers/funcionController';

const router = Router();

router.get('/pelicula/:peliculaId', getFuncionesByPelicula);
router.get('/', getAllFunciones); // opcional

export default router;