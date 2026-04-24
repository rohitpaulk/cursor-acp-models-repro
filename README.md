# cursor-acp-models-repro

A minimal repro showing how to use Cursor Agent's ACP server (`agent acp`) to list the models available on your account.

It uses the official ACP TypeScript SDK:

- `@agentclientprotocol/sdk`

## What this does

The script:

1. starts `agent acp`
2. initializes an ACP client connection over stdio
3. creates a new ACP session using Cursor login auth
4. reads `session.models.availableModels`
5. prints the model IDs, one per line

Notably, this repro does **not** need to send a prompt to the agent. Cursor returns the available model list directly from `session/new`.

## Requirements

- Node.js 18+ recommended
- Cursor Agent CLI installed as `agent`
- authenticated Cursor CLI session

You can verify auth with:

```sh
agent status
```

If needed, log in with:

```sh
agent login
```

## Install

```sh
npm install
```

## Run

From this directory:

```sh
node scripts/cursor-acp-models-repro.mjs
```

Or via npm:

```sh
npm run models
```

## Expected output

Example output:

```text
default[]
composer-2[fast=true]
composer-1.5[]
gpt-5.3-codex[reasoning=medium,fast=false]
claude-sonnet-4-6[thinking=true,context=200k,effort=medium]
...
```

## Files

- `scripts/cursor-acp-models-repro.mjs` — the minimal repro script
- `package.json` — isolated package manifest for the repro
- `.gitignore` — ignores local dependencies

## Notes

- The script accepts no CLI arguments.
- It relies on the auth methods advertised by Cursor ACP during `initialize`.
- In practice, this uses `cursor_login` when available.

## Why this repo exists

This is a small, standalone repro for testing and demonstrating how Cursor's ACP implementation exposes available models through session creation.