import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findOne, insertOne } from '../utils/fileStorage';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: string;
}

export const register = async (req: Request, res: Response) => {
  const { nombre, email, password } = req.body;
  try {
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const existing = await findOne<Usuario>('usuarios', u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await insertOne<Usuario>('usuarios', {
      nombre,
      email,
      passwordHash,
      rol: 'cliente'
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: { id: newUser.id, nombre: newUser.nombre, email: newUser.email }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await findOne<Usuario>('usuarios', u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      usuario: { id: user.id, nombre: user.nombre, email: user.email }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el login' });
  }
};