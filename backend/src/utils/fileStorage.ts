import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readData<T extends { id: number }>(filename: string): Promise<T[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch {
    return [];
  }
}

export async function writeData<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function insertOne<T extends { id: number }>(filename: string, item: Omit<T, 'id'>): Promise<T> {
  const items = await readData<T>(filename);
  const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
  const newItem = { ...item, id: newId } as T;
  items.push(newItem);
  await writeData(filename, items);
  return newItem;
}

export async function findOne<T extends { id: number }>(filename: string, predicate: (item: T) => boolean): Promise<T | null> {
  const items = await readData<T>(filename);
  return items.find(predicate) || null;
}

export async function findMany<T extends { id: number }>(filename: string, predicate?: (item: T) => boolean): Promise<T[]> {
  const items = await readData<T>(filename);
  if (!predicate) return items;
  return items.filter(predicate);
}

export async function updateOne<T extends { id: number }>(filename: string, id: number, updates: Partial<Omit<T, 'id'>>): Promise<T | null> {
  const items = await readData<T>(filename);
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  await writeData(filename, items);
  return items[index];
}