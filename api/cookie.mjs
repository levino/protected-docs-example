import PocketBase from "pocketbase";

export async function POST(request) {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token) {
      return new Response("Auth token is missing", { status: 400 });
    }

    const pb = new PocketBase(process.env.POCKETBASE_URL);

    pb.authStore.save(token);

    const authCookie = pb.authStore.exportToCookie({ sameSite: "None" });

    return new Response(null, {
      status: 200,
      headers: {
        "Set-Cookie": authCookie,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
