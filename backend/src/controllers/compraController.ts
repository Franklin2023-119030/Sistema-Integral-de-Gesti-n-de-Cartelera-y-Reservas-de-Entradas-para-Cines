import { Request, Response } from 'express';
import { findOne, findMany, insertOne, updateOne, readData, writeData } from '../utils/fileStorage';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: string;
}

interface Funcion {
  id: number;
  peliculaId: number;
  salaId: number;
  fechaHora: string;
  precioBase: number;
}

interface Asiento {
  id: number;
  salaId: number;
  fila: string;
  numero: number;
  coordenadas: string;
}

interface Compra {
  id: number;
  usuarioId: number;
  fechaCompra: string;
  total: number;
  estado: 'completada' | 'fallida';
}

interface DetalleCompra {
  id: number;
  compraId: number;
  funcionId: number;
  asientoId: number;
  precioPagado: number;
}

interface Pago {
  id: number;
  compraId: number;
  monto: number;
  metodo: 'tarjeta' | 'transferencia' | 'billetera';
  estado: 'exitoso' | 'fallido';
  fecha: string;
}

export const crearCompra = async (req: Request, res: Response) => {
  const { usuarioId, funcionId, asientosIds, metodoPago } = req.body;

  // Validaciones básicas
  if (!usuarioId || !funcionId || !asientosIds || !Array.isArray(asientosIds) || asientosIds.length === 0 || !metodoPago) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    // 1. Verificar que la función existe
    const funcion = await findOne<Funcion>('funciones', f => f.id === funcionId);
    if (!funcion) {
      return res.status(404).json({ error: 'Función no encontrada' });
    }

    // 2. Obtener todos los asientos de la sala de esa función
    const asientosSala = await findMany<Asiento>('asientos', a => a.salaId === funcion.salaId);
    const asientosMap = new Map(asientosSala.map(a => [a.id, a]));

    // 3. Verificar que los asientos solicitados existen en esa sala
    for (const id of asientosIds) {
      if (!asientosMap.has(id)) {
        return res.status(400).json({ error: `El asiento con id ${id} no pertenece a esta sala` });
      }
    }

    // 4. Verificar que los asientos no estén ya ocupados en esta función
    const detallesExistentes = await findMany<DetalleCompra>('detalleCompra', d => d.funcionId === funcionId);
    const asientosOcupados = new Set(detallesExistentes.map(d => d.asientoId));
    const asientosConflictivos = asientosIds.filter(id => asientosOcupados.has(id));
    if (asientosConflictivos.length > 0) {
      return res.status(400).json({ error: 'Algunos asientos ya están ocupados', asientos: asientosConflictivos });
    }

    // 5. Calcular total
    const total = funcion.precioBase * asientosIds.length;

    // 6. Crear la compra
    const nuevaCompra = await insertOne<Compra>('compras', {
      usuarioId,
      fechaCompra: new Date().toISOString(),
      total,
      estado: 'completada'  // asumimos que el pago es exitoso
    });

    // 7. Crear los detalles de compra (un registro por asiento)
    for (const asientoId of asientosIds) {
      await insertOne<DetalleCompra>('detalleCompra', {
        compraId: nuevaCompra.id,
        funcionId,
        asientoId,
        precioPagado: funcion.precioBase
      });
    }

    // 8. Registrar el pago
    await insertOne<Pago>('pagos', {
      compraId: nuevaCompra.id,
      monto: total,
      metodo: metodoPago,
      estado: 'exitoso',
      fecha: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Compra realizada con éxito',
      compraId: nuevaCompra.id,
      total
    });

  } catch (error) {
    console.error('Error al procesar compra:', error);
    res.status(500).json({ error: 'Error interno al procesar la compra' });
  }
};

// Opcional: obtener historial de compras de un usuario
export const getComprasByUsuario = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;
  try {
    const compras = await findMany<Compra>('compras', c => c.usuarioId === Number(usuarioId));
    // Podríamos enriquecer con detalles si es necesario
    res.json(compras);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};