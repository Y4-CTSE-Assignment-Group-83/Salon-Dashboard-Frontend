export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
}
