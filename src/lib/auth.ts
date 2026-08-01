import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ENF-04, D-038 : déconnexion automatique après 30 minutes d'inactivité.
  // maxAge fixe la durée de vie du jeton depuis la dernière activité ;
  // updateAge (plus court) fait glisser cette expiration à chaque requête
  // authentifiée passant par proxy.ts, tant que l'utilisateur reste actif.
  session: { strategy: "jwt", maxAge: 30 * 60, updateAge: 5 * 60 },
  pages: {
    signIn: "/connexion",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });
        if (!utilisateur || !utilisateur.actif) return null;

        const motDePasseValide = await bcrypt.compare(password, utilisateur.motDePasseHash);
        if (!motDePasseValide) return null;

        return {
          id: utilisateur.id,
          name: utilisateur.nom,
          email: utilisateur.email,
          profil: utilisateur.profil,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.profil = (user as { profil: string }).profil;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.profil = token.profil as never;
      }
      return session;
    },
  },
});
