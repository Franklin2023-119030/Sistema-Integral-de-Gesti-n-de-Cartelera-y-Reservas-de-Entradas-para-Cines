import { Request, Response } from 'express';
import { findMany, findOne } from '../utils/fileStorage';

interface Funcion {
  id: number;
  peliculaId: number;
  salaId: number;
  fechaHora: string;
  precioBase: number;
}

interface Sala {
  id: number;
  nombre: string;
  capacidad: number;
}

// Obtener funciones de una película específica
export const getFuncionesByPelicula = async (req: Request, res: Response) => {
  const { peliculaId } = req.params;
  try {
    const funciones = await findMany<Funcion>('funciones', f => f.peliculaId === Number(peliculaId));
    // Para cada función, obtener el nombre de la sala
    const salas = await findMany<Sala>('salas');
    const resultado = funciones.map(f => {
      const sala = salas.find(s => s.id === f.salaId);
      return {
        ...f,
        salaNombre: sala?.nombre || 'Sala desconocida'
      };
    });
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener funciones:', error);
    res.status(500).json({ error: 'Error al obtener funciones' });
  }
};

// Obtener todas las funciones (opcional, para admin)
export const getAllFunciones = async (req: Request, res: Response) => {
  try {
    const funciones = await findMany<Funcion>('funciones');
    res.json(funciones);
  } catch (error) {
    console.error('Error al obtener funciones:', error);
    res.status(500).json({ error: 'Error al obtener funciones' });
  }
};