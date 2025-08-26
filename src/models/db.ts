import { Pool } from 'pg';
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
   user: 'postgres',
   host: 'localhost',
   database: 'testbun',
   password: '1212312121',
   port: 5432, 
});

export default pool;