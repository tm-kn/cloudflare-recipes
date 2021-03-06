// NOTE: A 'Cache Level' page rule set to 'Cache Everything' will
// prevent private cookie cache skipping from working, as it is
// applied after this worker runs.

const PRIVATE_COOKIES = ["csrftoken", "sessionid"];

const STRIP_QUERYSTRING_KEYS = [
  "utm_source",
  "utm_campaign",
  "utm_medium",
  "utm_term",
  "utm_content",
];

/**
 * List of cachable HTTP status codes comes from here:
 * https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html#sec13.4
 */
const CACHABLE_HTTP_STATUS_CODES = [200, 203, 206, 300, 301, 410];

addEventListener("fetch", (event) => {
  event.respondWith(main(event));
});

async function main(event) {
  const cache = caches.default;
  let request = event.request;
  request = stripIgnoredQuerystring(request);

  if (!requestIsCachable(request)) {
    return fetch(request);
  }

  let response = await cache.match(request);
  if (!response) {
    response = await fetch(request);
    if (responseIsCachable(request, response)) {
      event.waitUntil(cache.put(request, response.clone()));
    }
  }

  return response;
}

function stripIgnoredQuerystring(request) {
  // Return a request with specified querystring keys stripped out
  const url = new URL(request.url);
  const stripKeys = STRIP_QUERYSTRING_KEYS.filter((v) =>
    url.searchParams.has(v)
  );

  if (stripKeys.length) {
    stripKeys.forEach((v) => url.searchParams.delete(v));

    return new Request(url, request);
  }
  return request;
}

function requestIsCachable(request) {
  if (hasPrivateCookie(request)) {
    return false;
  }
  return true;
}

function hasPrivateCookie(request) {
  // Check if the request includes any of the specified 'private' cookies
  const cookieString = request.headers.get("Cookie");
  return (
    cookieString !== null &&
    PRIVATE_COOKIES.some((item) => {
      return cookieString.includes(item);
    })
  );
}

function responseIsCachable(response) {
  if (!CACHABLE_HTTP_STATUS_CODES.includes(response.statusCode)) {
    return false;
  }
  return true;
}
