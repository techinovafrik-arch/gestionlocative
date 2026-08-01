import type { DefaultSession } from "next-auth";
import type { ProfilUtilisateur } from "@/generated/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      profil: ProfilUtilisateur;
    } & DefaultSession["user"];
  }

  interface User {
    profil: ProfilUtilisateur;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    profil: ProfilUtilisateur;
  }
}
