# Whole-site translation with LibreTranslate

The header supports English, Simplified Chinese (Mandarin), Vietnamese, and Spanish. The visitor's choice is saved in their browser. Pages, newly rendered content, accessible member messages, dialogs, and descriptive accessibility attributes use the same translation service. English restores original content. Authentication and route guards are unchanged.

## Local setup

No Google API key, Google account, or paid translation subscription is needed. LibreTranslate runs on your own computer; its dependencies and models require disk space and an initial download.

1. Free disk space and start Docker Desktop.
2. From the project directory run:
   ```sh
   docker compose -f compose.translation.yml up -d
   ```
3. Wait for the English, Chinese, Vietnamese, and Spanish models to download. Inspect startup with:
   ```sh
   docker compose -f compose.translation.yml logs -f libretranslate
   ```
4. `.env.local` is already configured with this server-only base URL:
   ```env
   LIBRETRANSLATE_URL=http://127.0.0.1:5100
   ```
5. Restart Next.js if it was running before changing the environment. Open http://localhost:3100 and select a language.

The `/languages` endpoint at http://127.0.0.1:5100/languages should list `en`, `zh-Hans`, `vi`, and `es` with the tested LibreTranslate 1.9.6 release. The website maps Simplified Chinese (`zh-CN`) to LibreTranslate's `zh-Hans` code. The API uses automatic source detection for displayed member messages as well as site text. Models for translation through English may be used by LibreTranslate.

Stop the local service with:
```sh
docker compose -f compose.translation.yml down
```
The named volume preserves downloaded models. The port is bound to the local computer only. Translation text/output are not application-logged, and no shared server text cache is enabled.

## Installed local Python service

LibreTranslate 1.9.6 is installed in `/tmp/binexa-libretranslate-venv`. Models are downloaded under `/tmp/binexa-libre-data`. It is currently running on port 5100. Docker is an alternative; do not start both on the same port.

To restart the installed service after it stops, from the project directory run:
```sh
/tmp/binexa-libretranslate-venv/bin/python -u scripts/start-libretranslate-local.py
```
The launcher suppresses verbose translation-content logging. These temporary directories may be cleared by the operating system; if so reinstall with Python 3.11 and `pip install --no-cache-dir libretranslate==1.9.6`. The launcher downloads only the requested language models. No service is configured to auto-start after a computer reboot.

## Live site

A Vercel deployment cannot reach this computer through `127.0.0.1`. The live site requires a reachable LibreTranslate server of your own, with `LIBRETRANSLATE_URL` set to its HTTPS base URL. Hosting may cost money even though the software has no per-character license fee. Do not use an unknown public mirror for private member conversations.

If your own server requires an API key, set `LIBRETRANSLATE_API_KEY` on the website server. It is optional for the local service. Never prefix it with NEXT_PUBLIC. Protect a public service with authenticated access and service-side limits; the Next.js circuit breaker is per instance, not a distributed global rate limit. Pin a tested container image digest before production rollout.

Official installation: https://docs.libretranslate.com/guides/installation/
API format: https://docs.libretranslate.com/api/operations/translate/

## Behavior and limits

Text is sent only to the configured server after a visitor selects a translated language. This includes member messages they can already view. Translation responses are private/no-store. Browser translation caches are in-memory only; only the language preference is persisted. Describe this processing in the privacy notice before a public release.

The integration preserves original posted messages, link destinations, passwords, form values, email addresses, code, brand names, and elements marked translate=no or data-no-translate. It translates text nodes without replacing or wrapping React elements, observes client navigation/content updates, and aborts outdated requests.

Audio, video speech, text baked into images, external iframe contents, PDFs, and linked external sites are not translated. English is an original-content view, not automatic English translation of foreign-language posts. Machine-translated healthcare language needs review against its source.

## Verification status

All 71 automated tests pass. TypeScript passes. Live LibreTranslate 1.9.6 loaded four languages and six translation models. Actual homepage translations succeeded through the language selector in Vietnamese, Simplified Chinese, and Spanish (approximately 21, 17, and 14 seconds respectively). Switching back to English restored the original heading, the mobile selector remained visible, and no browser runtime errors were observed. This is functional verification, not linguistic or medical review. The earlier installation storage blocker is resolved. No public server was provisioned or deployment made.

## Temporary connected Vercel preview

The release branch `release/libretranslate-languages` has branch-specific preview variables pointing to a temporary Cloudflare Quick Tunnel. Production variables are unchanged. This is a testing connection only, authorized by the user; it requires this Mac, LibreTranslate on port 5100, the key-protected gateway on port 5101, and cloudflared to remain running. The hostname changes if the tunnel restarts.

`scripts/translation-preview-proxy.py` exposes only a health route and a translation route. Translations require a dedicated random key stored outside the repository in `/tmp/binexa-translation-preview.key` and as a sensitive, server-only Vercel preview variable. Anonymous translation requests are rejected. Page text and that dedicated key pass through Cloudflare; passwords and form values are excluded by the website selector. Do not commit the key or tunnel logs.

Restarting this temporary setup, or moving to permanent hosting, requires checking the tunnel URL/key and updating the branch-specific preview environment before redeploying. It is not an always-on production solution.
