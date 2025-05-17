import pool from '../../utils/db';

export const getAllUserController = async (): Promise<any[]> => {
  const res = await pool.query('SELECT * from users;');
  return res.rows; // Return only the rows
};