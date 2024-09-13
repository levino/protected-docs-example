import PocketBase from "pocketbase";
import { next, rewrite } from "@vercel/edge";

// This middleware will block all unauthenticated requests. In order for the users
// to go through the login flow, we need to NOT protect /public/** and /api/**.
export const config = {
  matcher: ["/", "/((?!public/|api/).*)"],
};

export default async function authentication(request: Request) {
  const pb = new PocketBase("https://api.levinkeller.de");
  const cookie = request.headers.get("cookie");
  if (!cookie) return rewrite("/public/login.html");
  pb.authStore.loadFromCookie(cookie);
  try {
    await pb.collection("protected_docs_example_users").authRefresh();
    return next();
  } catch {
    return rewrite("/public/login.html");
  }
}
