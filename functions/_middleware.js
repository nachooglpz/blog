export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === "nacho.is-a.dev") {
    url.hostname = "nacho.fyi";
    url.protocol = "https:";

    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
