import { writeData } from '../utils/fileStorage';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: string;
}

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

interface Funcion {
  id: number;
  peliculaId: number;
  salaId: number;
  fechaHora: string;
  precioBase: number;
}

async function init() {
  // Usuarios de ejemplo (vacío por ahora)
  await writeData<Usuario>('usuarios', []);

  // Películas
  await writeData<Pelicula>('peliculas', [
    { id: 1, titulo: 'Scream', duracion: 120, directores: 'Wes Craven', actores: 'Neve Campbell, Courteney Cox', fechaLanzamiento: '2025-03-01', fechaFinCartelera: '2025-04-01', sinopsis: 'Un nuevo asesino acecha...', clasificacion: 'B', posterUrl: 'https://via.placeholder.com/200x300?text=Scream' },
    { id: 2, titulo: 'Walk the Line', duracion: 135, directores: 'James Mangold', actores: 'Joaquin Phoenix, Reese Witherspoon', fechaLanzamiento: '2025-03-05', fechaFinCartelera: '2025-04-05', sinopsis: 'La vida de Johnny Cash', clasificacion: 'B', posterUrl: 'https://via.placeholder.com/200x300?text=Walk+the+Line' }
  ]);

  // Salas
  await writeData<Sala>('salas', [
    { id: 1, nombre: 'Sala 1', capacidad: 50 },
    { id: 2, nombre: 'Sala 2', capacidad: 40 }
  ]);

  // Asientos para sala 1
  const asientos: Asiento[] = [];
  for (let fila = 0; fila < 5; fila++) {
    for (let num = 1; num <= 10; num++) {
      asientos.push({
        id: asientos.length + 1,
        salaId: 1,
        fila: String.fromCharCode(65 + fila),
        numero: num,
        coordenadas: `${String.fromCharCode(65 + fila)}${num}`
      });
    }
  }
  await writeData<Asiento>('asientos', asientos);

  // Funciones
  await writeData<Funcion>('funciones', [
    { id: 1, peliculaId: 1, salaId: 1, fechaHora: '2025-03-05T20:00:00', precioBase: 15.0 },
    { id: 2, peliculaId: 1, salaId: 1, fechaHora: '2025-03-05T22:30:00', precioBase: 15.0 }
  ]);

  // Compras vacías
  await writeData('compras', []);
  await writeData('detalleCompra', []);

  console.log('Datos inicializados correctamente');
}

init().catch(console.error);