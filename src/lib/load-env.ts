import dotenv from 'dotenv';
import path from 'path';

// Carrega o arquivo .env.local do diretório raiz do projeto
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
