# Torchbox Cloudflare Worker Recipes
## common-caching.js
Worker for handling common operations when using Cloudflare as a frontend cache:

* Skip cache when private cookies are present
* Strip querystring keys that don't need to hit the server

## holding-page.js
Worker for putting up a holding page from an external source.

* Allows updating the markup without access to the Cloudflare dashboard
