# cursor-acp-models-repro

Minimal repro showing that `agent models` include Opus 4.6 fast mode, but it does not appear in the models returned by `agent acp`.

## Requirements

- Node.js 18+
- Cursor's `agent` installed and authed

## Run

```sh
npm install
node repro.mjs
```

The script starts `agent acp`, creates a session, and prints `session.models.availableModels` one model ID per line so the ACP-visible model list can be compared against the Agent model list.
