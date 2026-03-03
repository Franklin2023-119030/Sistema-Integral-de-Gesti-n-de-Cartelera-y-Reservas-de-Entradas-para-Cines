import { Router } from 'express';
import { getPeliculas, getPeliculaById } from '../controllers/peliculaController';

const router = Router();

router.get('/', getPeliculas);
router.get('/:id', getPeliculaById);

export default router;