// types/express/index.d.ts
import { JwtPayloadCustom } from "../jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadCustom;
      file?: Multer.File;
    }
  }
}
