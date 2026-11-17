# RUNLAB — Automatic watch sync (integration plan)

Status: **not connected**. The static GitHub Pages frontend cannot hold API keys, refresh tokens or private health data. Do not commit tokens, passwords, raw activity files or OAuth secrets.

## Official paths checked 17 November 2026

- COROS: https://support.coros.com/hc/en-us/articles/53181619102996-Build-on-COROS-MCP — user OAuth 2.0 via https://mcp.coros.com/mcp, no partner approval. Polling, not webhook push.
- Garmin: https://developer.garmin.com/gc-developer-program/personal/personal-api/ — Garmin Connect Personal API key and short-lived access token, personal pull access. Keep key server-side.

## Architecture

COROS APEX 2 -> COROS app -> COROS MCP OAuth -> private sync worker
Garmin FR55 -> Garmin Connect -> Garmin Personal API -> private sync worker
private sync worker -> private persistent activity store -> authenticated RUNLAB read endpoint -> browser

The current Google Apps Script RUNLAB SYNC write endpoint is not automatically a secure private read API. A private, authenticated read endpoint and user access controls must be built and tested before connecting the public dashboard.

## Worker responsibilities

1. Configure separate credentials for COROS and Garmin; store only as server secrets.
2. COROS: implement OAuth state, authorization-code exchange, secure refresh and periodic polling. Check MCP response formats before parsing.
3. Garmin: generate a personal API key **in Garmin Connect**; exchange server-side for a token, then call only documented personal activity endpoints. Do not place the key in client JavaScript.
4. Normalize fields: provider, providerActivityId, athlete (afiq|ahnaf), local date, distance, duration, average pace, HR, and optional per-lap interval/recovery details.
5. Dedupe on (provider, providerActivityId). When provider ID is absent, hold for review rather than guess.
6. Store in a private database; expose a protected read API to RUNLAB. Never expose private GPS traces publicly by default, especially for a child.
7. Sync on a periodic schedule; expose last-success time, last-error and count of imported records. Distinguish activity upload time from run date.
8. Test with historical activity data and verify that imported runs do not double-count current localStorage records before enabling automatic import.

## Next prerequisites

- Choose a private backend host with scheduled jobs and secrets (e.g. Cloudflare Worker + cron + protected database) and configure it in the owner's account.
- Complete COROS OAuth consent and Garmin Personal API key creation. No secrets should be sent in chat or stored in this repo.
- Test private endpoint with both athletes, then activate RUNLAB synchronization.

**No automatic synchronization is active yet.**
