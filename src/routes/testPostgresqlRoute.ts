// 
import server from 'bunrest';
const app = server();

export const testDBRouter = app.router();

import { testDBController } from '../controllers/testPostgresql';

testDBRouter.get('/', async (req: any, res: any): Promise<void> => {
  // Await the result from controller here.
  const userRes = await testDBController.getAllUserController();

  // response section
  const body = ({
    code: 200,
    result: userRes
  });
  res.status(200).json(body);
})
