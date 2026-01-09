import { MongoClient, Db, Collection, Document } from 'mongodb';
import fs from 'fs';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongo(mongoUri?: string, mongoDb?: string): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUser = process.env.MONGO_USER || '';
  const mongoPassword = encodeURIComponent(process.env.MONGO_PASSWORD || '');
  const mongoHost = process.env.MONGO_HOST || '';
  const mongoDbName = mongoDb || process.env.MONGO_DB || '';
  const mongoUriInternal = 
    mongoUser && mongoPassword && mongoHost && mongoDbName
    ? `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}/${mongoDbName}?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false&authMechanism=SCRAM-SHA-1`
    : 'mongodb://localhost:27017/tech_challenge';
  const uri = mongoUri || mongoUriInternal;

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
  db = client.db(mongoDbName);
  return db;
}

export async function getCollection<TSchema extends Document = Document>(name: string, mongoUri?: string, mongoDb?: string): Promise<Collection<TSchema>> {
  const database = await getMongo(mongoUri, mongoDb);
  return database.collection<TSchema>(name);
}
