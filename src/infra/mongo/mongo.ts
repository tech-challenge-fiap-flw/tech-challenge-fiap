import { MongoClient, Db, Collection, Document } from 'mongodb';
import fs from 'fs';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongo(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tech_challenge';
  const dbName = process.env.MONGO_DB || 'tech_challenge';

  // Caminho do arquivo de CA da AWS
  const caPath = './certs/rds-combined-ca-bundle.pem';
  let options: any = {
    tls: true,
    tlsCAFile: caPath,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  };
  // Se o arquivo não existir, ignora a opção (útil para dev local)
  if (!fs.existsSync(caPath)) {
    delete options.tlsCAFile;
    options.tlsAllowInvalidCertificates = true;
  }
  client = new MongoClient(uri, options);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function getCollection<TSchema extends Document = Document>(name: string): Promise<Collection<TSchema>> {
  const database = await getMongo();

  return database.collection<TSchema>(name);
}
