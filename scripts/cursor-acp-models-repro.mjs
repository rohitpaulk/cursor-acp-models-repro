#!/usr/bin/env node

import { spawn } from "node:child_process";
import { Readable, Writable } from "node:stream";
import {
  ClientSideConnection,
  PROTOCOL_VERSION,
  ndJsonStream,
} from "@agentclientprotocol/sdk";

const child = spawn("agent", ["acp"], {
  stdio: ["pipe", "pipe", "inherit"],
});

const stream = ndJsonStream(
  Writable.toWeb(child.stdin),
  Readable.toWeb(child.stdout),
);

const connection = new ClientSideConnection(
  () => ({
    async requestPermission() {
      return { outcome: "cancelled" };
    },
    async sessionUpdate() {},
  }),
  stream,
);

const init = await connection.initialize({
  protocolVersion: PROTOCOL_VERSION,
  clientInfo: {
    name: "cursor-acp-models-repro",
    version: "0.0.1",
  },
  capabilities: {},
});

const authMethodId = init.authMethods.find((m) => m.id === "cursor_login")?.id;

const session = await connection.newSession({
  cwd: process.cwd(),
  mcpServers: [],
  authMethodId,
});

for (const model of session.models?.availableModels ?? []) {
  console.log(model.modelId);
}

child.stdin.end();
child.kill();
