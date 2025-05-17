import { Pool } from 'pg';

const pool = new Pool({
  // user: 'zev',
  // host: 'localhost',
  // database: 'test',
  // password: 'zev123',
  port: 5432, // default PostgreSQL port
});

export default pool;