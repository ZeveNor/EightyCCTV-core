import { Pool } from 'pg';

const pool = new Pool({
   user: 'postgres',
   host: 'localhost',
   database: 'testbun',
   password: '1212312121',
   port: 5432, 
});

export default pool;