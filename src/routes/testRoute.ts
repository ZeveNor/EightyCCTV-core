// 
import server from 'bunrest';
const app = server();

export const testRouter = app.router();

import { testController } from '../controllers/test';

testRouter.get('/', (req: any, res: any): void => {
  // function result from controller here.
  const getTestText = testController.testFunc();

  // response section
  const body = ({
    code: 200,
    result: getTestText
  });
  res.status(200).json(body);
})

testRouter.get('/cal', (req: any, res: any): void => {
  // function result from controller here.
  const getTestText = testController.testFunc();

  let text: string = '5 + 10';
  const calTest = testController.calFunc( 5, 10 );

  // response section
  const body = ({
    code: 200,
    result: getTestText,
    calTest: text,
    calResult: calTest
  });
  res.status(200).json(body);
})

testRouter.get('/cal/:a', (req: any, res: any): void => {
  // แค่ดูว่าข้อความ parameter ถูกรับมามั้ย
  let input: number = req.params?.a ?? 0;

  // response section
  const body = ({
    code: 200,
    a: input
  });
  res.status(200).json(body);
})

testRouter.get('/cal/:a/:b', (req, res) => {
  // function result from controller here.
  // รับค่าจาก params หมายเหตุ param จะเป็น string เสมอ ต้องแปลงเอง
  const a: string = req.params?.a ?? 0;
  const b: string = req.params?.b ?? 0;

  // sent a and b to test function to calculate
  const calTest = testController.calFunc( a, b );
  let text = `${a} + ${b}`;

  // response section
  const body = ({
    code: 200,
    calTest: text,
    calResult: calTest
  });
  res.status(200).json(body);
})


