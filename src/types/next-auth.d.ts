import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      organizationId: string;
      organizationName: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    organizationId: string;
    organizationName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    organizationId: string;
    organizationName: string;
  }
}
