# Protected docs

This is an example on how to restrict access to a documentation website written
with [`docusaurus`](https://docusaurus.io/).

## Details

The implementation uses vercels ["middleware"](./middleware.ts) to check each
request for the correct authentication data. For user management and
authentication, a [`PocketBase`](https://pocketbase.io/) instance is used.

## Considerations

It is important to note that at least with `docusaurus`, one cannot protect
individual routes. This is because once one route has been opened, `docusaurus`
behaves like a SPA and greedily loads all the content into the client. No way to
disentangle that js-blob.

In this implementation, anybody can sign up and then immediately see the
content. That is kinda pointless of course. It is possible to check for roles or
attributes on the users. For example one could adjust the middleware like so:

```typescript
// middleware.ts
import PocketBase from 'pocketbase'
import { next, rewrite } from '@vercel/edge'

export const config = {
  matcher: ['/', '/((?!public/|api/).*)'],
}

export default async function authentication(request: Request) {
  const pb = new PocketBase('https://levinkeller.de')
  const cookie = request.headers.get('cookie')
  if (!cookie) return rewrite('/public/login.html')
  pb.authStore.loadFromCookie(cookie)
  try {
    await pb.collection('users').authRefresh()
    if (pb.authStore.model?.member) {
      return next()
    } else {
      // not_a_member.html shows instructions on how to reach the admin to make the person a member.
      return rewrite('/public/not_a_member.html')
    }
  } catch {
    return rewrite('/public/login.html')
  }
}
```

Then only users whose accounts are made a "member" after creation could access
the website. **Please be aware that this only is secure, iff you make sure that
users cannot make themselves "members"
[by using `@request.data.member:isset = false` in the appropriate API rules](https://github.com/pocketbase/pocketbase/discussions/5486#discussioncomment-10556948)!**

## Run it yourself

In order to run this yourself, you need to host a `PocketBase` instance and then
fork this repo and adjust the values. Deployment needs to happen via vercel. I
assume it also works on netlify or coolify with some minor adjustments.
