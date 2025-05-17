import server from 'bunrest';
const app = server();

import { testRouter } from './src/routes/testRoute';
import { testDBRouter } from './src/routes/testPostgresqlRoute';

app.use('/api/test', testRouter);
app.use('/api/testDB', testDBRouter);

app.get('/', (req: any, res: any): void => { 
  res.status(200).json({ status: "200", message: "Server is Alive!" });
});

app.listen(3000, (): void => {
  console.log("Server started on port 3000");
 })