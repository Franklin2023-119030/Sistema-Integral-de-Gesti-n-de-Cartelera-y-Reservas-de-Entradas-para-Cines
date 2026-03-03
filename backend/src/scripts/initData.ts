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
  // Películas (7)
await writeData<Pelicula>('peliculas', [
  {
    id: 1,
    titulo: 'Dune: Parte 2',
    duracion: 166,
    directores: 'Denis Villeneuve',
    actores: 'Timothée Chalamet, Zendaya, Austin Butler',
    fechaLanzamiento: '2026-03-15',
    fechaFinCartelera: '2026-05-15',
    sinopsis: 'Paul Atreides se une a los Fremen para vengar a su familia y evitar que el Emperador pueda controlar la especia.',
    clasificacion: 'B',
    posterUrl: 'https://via.placeholder.com/200x300?text=Dune+2'
  },
  {
    id: 2,
    titulo: 'Intensamente 2',
    duracion: 105,
    directores: 'Kelsey Mann',
    actores: 'Amy Poehler, Maya Hawke',
    fechaLanzamiento: '2026-04-01',
    fechaFinCartelera: '2026-06-01',
    sinopsis: 'Nuevas emociones llegan a la mente de Riley, ahora adolescente.',
    clasificacion: 'A',
    posterUrl: 'https://via.placeholder.com/200x300?text=Inside+Out+2'
  },
  {
    id: 3,
    titulo: 'Oppenheimer',
    duracion: 180,
    directores: 'Christopher Nolan',
    actores: 'Cillian Murphy, Emily Blunt, Robert Downey Jr.',
    fechaLanzamiento: '2026-03-20',
    fechaFinCartelera: '2026-05-20',
    sinopsis: 'El físico J. Robert Oppenheimer trabaja en el proyecto de la bomba atómica.',
    clasificacion: 'C',
    posterUrl: 'https://via.placeholder.com/200x300?text=Oppenheimer'
  },
  {
    id: 4,
    titulo: 'Deadpool & Wolverine',
    duracion: 128,
    directores: 'Shawn Levy',
    actores: 'Ryan Reynolds, Hugh Jackman',
    fechaLanzamiento: '2026-05-01',
    fechaFinCartelera: '2026-07-01',
    sinopsis: 'Deadpool viaja por el multiverso para salvar su mundo con la ayuda de un renuente Wolverine.',
    clasificacion: 'C',
    posterUrl: 'https://via.placeholder.com/200x300?text=Deadpool+3'
  },
  {
    id: 5,
    titulo: 'Wonka',
    duracion: 116,
    directores: 'Paul King',
    actores: 'Timothée Chalamet, Olivia Colman',
    fechaLanzamiento: '2026-03-10',
    fechaFinCartelera: '2026-05-10',
    sinopsis: 'El joven Willy Wonka abre su primera chocolatería en la ciudad.',
    clasificacion: 'A',
    posterUrl: 'https://via.placeholder.com/200x300?text=Wonka'
  },
  {
    id: 6,
    titulo: 'Misión Imposible: Sentencia Mortal',
    duracion: 163,
    directores: 'Christopher McQuarrie',
    actores: 'Tom Cruise, Hayley Atwell, Simon Pegg',
    fechaLanzamiento: '2026-04-15',
    fechaFinCartelera: '2026-06-15',
    sinopsis: 'Ethan Hunt enfrenta a una nueva y poderosa inteligencia artificial.',
    clasificacion: 'B',
    posterUrl: 'https://via.placeholder.com/200x300?text=Mision+Imposible'
  },
  {
    id: 7,
    titulo: 'El Padrino 50 aniversario',
    duracion: 175,
    directores: 'Francis Ford Coppola',
    actores: 'Marlon Brando, Al Pacino, James Caan',
    fechaLanzamiento: '2026-05-05',
    fechaFinCartelera: '2026-07-05',
    sinopsis: 'Reestreno de la clásica historia de la familia Corleone.',
    clasificacion: 'C',
    posterUrl: 'https://via.placeholder.com/200x300?text=El+Padrino'
  }
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