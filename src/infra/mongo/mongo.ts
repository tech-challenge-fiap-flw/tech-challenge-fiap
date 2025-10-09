import { MongoClient, Db, Collection, WithId, Document } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongo(): Promise<Db> {
  if (db) return db;
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tech_challenge';
  const dbName = process.env.MONGO_DB || 'tech_challenge';
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function getCollection<TSchema extends Document = Document>(name: string): Promise<Collection<TSchema>> {
  const database = await getMongo();
  return database.collection<TSchema>(name);
}
