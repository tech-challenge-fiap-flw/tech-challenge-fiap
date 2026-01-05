import { MongoClient, Db, Collection, Document } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongo(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tech_challenge';
  const dbName = process.env.MONGO_DB || 'tech_challenge';

  // Options for AWS DocumentDB compatibility
  const options = {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: false, // Set to true only for development if needed
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  };

  client = new MongoClient(uri, options);
  await client.connect();

  db = client.db(dbName);

  return db;
}

export async function getCollection<TSchema extends Document = Document>(name: string): Promise<Collection<TSchema>> {
  const database = await getMongo();

  return database.collection<TSchema>(name);
}
