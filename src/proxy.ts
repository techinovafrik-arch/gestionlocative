import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const proxy = auth((request) => {
  if (!request.auth) {
    return NextResponse.redirect(new URL("/connexion", request.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|connexion).*)"],
};
