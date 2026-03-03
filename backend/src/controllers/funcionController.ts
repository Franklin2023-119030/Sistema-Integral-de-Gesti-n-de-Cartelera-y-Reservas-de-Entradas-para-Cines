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

interface Asiento {
  id: number;
  salaId: number;
  fila: string;
  numero: number;
  coordenadas: string;
}

// Obtener funciones de una película
export const getFuncionesByPelicula = async (req: Request, res: Response) => {
  const { peliculaId } = req.params;
  try {
    const funciones = await findMany<Funcion>('funciones', f => f.peliculaId === Number(peliculaId));
    // Para cada función, obtener datos de la sala
    const funcionesConSala = await Promise.all(
      funciones.map(async (funcion) => {
        const sala = await findOne<Sala>('salas', s => s.id === funcion.salaId);
        return {
          ...funcion,
          sala: sala ? { nombre: sala.nombre, capacidad: sala.capacidad } : null
        };
      })
    );
    res.json(funcionesConSala);
  } catch (error) {
    console.error('Error al obtener funciones:', error);
    res.status(500).json({ error: 'Error al obtener funciones' });
  }
};

// Obtener asientos de una función con estado (ocupados/libres)
export const getAsientosByFuncion = async (req: Request, res: Response) => {
  const { funcionId } = req.params;
  try {
    // Obtener la función para saber la sala
    const funcion = await findOne<Funcion>('funciones', f => f.id === Number(funcionId));
    if (!funcion) {
      return res.status(404).json({ error: 'Función no encontrada' });
    }

    // Obtener todos los asientos de esa sala
    const asientos = await findMany<Asiento>('asientos', a => a.salaId === funcion.salaId);

    // Obtener los asientos ya comprados para esta función (de detalleCompra)
    // Nota: detalleCompra tiene campos: id, compraId, funcionId, asientoId, precioPagado
    const detalleCompras = await findMany<any>('detalleCompra', d => d.funcionId === Number(funcionId));
    const asientosOcupadosIds = detalleCompras.map(d => d.asientoId);

    // Marcar cada asiento como ocupado o libre
    const asientosConEstado = asientos.map(asiento => ({
      ...asiento,
      ocupado: asientosOcupadosIds.includes(asiento.id)
    }));

    res.json(asientosConEstado);
  } catch (error) {
    console.error('Error al obtener asientos:', error);
    res.status(500).json({ error: 'Error al obtener asientos' });
  }
};