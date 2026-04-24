#!/usr/bin/env node

import { Readable, Writable } from "node:stream";
import chalk from "chalk";
import { execa } from "execa";
import { ClientSideConnection, PROTOCOL_VERSION, ndJsonStream } from "@agentclientprotocol/sdk";

const OPUS_46_FAST_MODEL_ID = "claude-4.6-opus-high-thinking-fast";

console.log(`${chalk.blue("->")} Running \`agent models\``);

const { stdout: agentModelsOutput } = await execa("agent", ["models"], {
  stderr: "inherit",
});

const opusAgentModelLines = agentModelsOutput
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.toLowerCase().includes("opus"));

console.log(`${chalk.dim("..")} Looking for ${chalk.bold(OPUS_46_FAST_MODEL_ID)}`);

if (!opusAgentModelLines.some((line) => line.includes(OPUS_46_FAST_MODEL_ID))) {
  console.log(`${chalk.red("FAIL")} ${chalk.red(`expected ${OPUS_46_FAST_MODEL_ID} to appear in \`agent models\``)}`);
} else {
  console.log(`${chalk.green("OK")} Confirmed the model is present in \`agent models\``);
}

console.log("");

console.log(`${chalk.blue("->")} Starting \`agent acp\` and creating a session`);
const child = execa("agent", ["acp"], {
  stdin: "pipe",
  stdout: "pipe",
  stderr: "inherit",
  reject: false,
});

try {
  const stream = ndJsonStream(Writable.toWeb(child.stdin), Readable.toWeb(child.stdout));

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

  console.log(`${chalk.dim("..")} Using auth method: ${authMethodId ?? "none"}`);

  const session = await connection.newSession({
    cwd: process.cwd(),
    mcpServers: [],
    authMethodId,
  });

  const opusAcpModelIds = (session.models?.availableModels ?? [])
    .map((model) => model.modelId)
    .filter((modelId) => modelId.toLowerCase().includes("opus"));
  const hasFastTrueModel = opusAcpModelIds.some((modelId) => modelId.includes("fast=true"));

  console.log(`${chalk.dim("..")} ACP returned ${opusAcpModelIds.length} Opus models`);
  console.log(chalk.bold("ACP Opus models"));

  for (const modelId of opusAcpModelIds) {
    console.log(`  - ${modelId}`);
  }

  if (hasFastTrueModel) {
    console.log(`${chalk.green("OK")} ${chalk.green("fast=true model found in list")}`);
  } else {
    console.log(`${chalk.red("FAIL")} ${chalk.red("no fast=true model found in list")}`);
  }
} finally {
  child.stdin.end();
  child.kill();
}
