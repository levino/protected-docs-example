import PocketBase from 'pocketbase'
import process from 'node:process'

// This endpoint is more or less just to set a httpOnly cookie.
export async function POST(request) {
  try {
    const body = await request.json()
    const token = body.token

    if (!token) {
      return new Response('Auth token is missing', { status: 400 })
    }

    const pb = new PocketBase(process.env.POCKETBASE_URL)

    pb.authStore.save(token)

    // I am using sameSite: "None" so deep links from third party apps like whatsapp etc. work.
    // It is very important to not allow server state changes via POST requests when using sameSite: "None".
    // If you later want to use the cookies to authenticate server state changing requests, you need to add CSRF protection (e.g. a CSRF token).
    const authCookie = pb.authStore.exportToCookie({ sameSite: 'None' })

    return new Response(null, {
      status: 200,
      headers: {
        'Set-Cookie': authCookie,
        'Content-Type': 'application/json',
      },
    })
  } catch (_) {
    return new Response('Internal server error', { status: 500 })
  }
}
