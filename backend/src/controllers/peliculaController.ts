import { Request, Response } from 'express';
import { findMany, findOne } from '../utils/fileStorage';

interface Pelicula {
  id: number;
  titulo: string;
  duracion: number;
  directores: string;
  actores: string;
  fechaLanzamiento: string;
  fechaFinCartelera: string;
  sinopsis: string;
  clasificacion: string;
  posterUrl: string;
}

// Obtener todas las películas (solo las que están en cartelera)
export const getPeliculas = async (req: Request, res: Response) => {
  try {
    const peliculas = await findMany<Pelicula>('peliculas');
    // Filtrar las que aún están en cartelera (fechaFinCartelera >= hoy)
    // const hoy = new Date().toISOString().split('T')[0];
    // const enCartelera = peliculas.filter(p => p.fechaFinCartelera >= hoy);
    //res.json(enCartelera);
    res.json(peliculas); //devuelve todas sin filtrar
  } catch (error) {
    console.error('Error al obtener películas:', error);
    res.status(500).json({ error: 'Error al obtener películas' });
  }
};

// Obtener una película por ID
export const getPeliculaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const pelicula = await findOne<Pelicula>('peliculas', p => p.id === Number(id));
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    res.json(pelicula);
  } catch (error) {
    console.error('Error al obtener película:', error);
    res.status(500).json({ error: 'Error al obtener película' });
  }
};