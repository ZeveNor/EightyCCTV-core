// 
export const calFunc = ( a: string|number, b: string|number ): number => {
  //
  // แปลงข้อความเป็น ตัวเลข
  let numA = Number(a);
  let numB = Number(b);

  const res = numA + numB;
  return res;
};
