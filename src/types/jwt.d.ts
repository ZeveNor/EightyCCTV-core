
export interface JwtPayloadCustom {
  id: string;
  role: "admin" | "user" | "security";
  iat?: number; // issued at
  exp?: number; // expired at
}
