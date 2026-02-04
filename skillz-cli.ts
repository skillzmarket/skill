#!/usr/bin/env npx tsx
import { SkillzMarket } from '@skillzmarket/sdk';

const PRIVATE_KEY = process.env.SKILLZ_PRIVATE_KEY as `0x${string}`;
const API_URL = process.env.SKILLZ_API_URL || 'https://api.skillz.market';

// Create client - wallet only needed for paid calls
const market = new SkillzMarket({
  wallet: PRIVATE_KEY,
  apiUrl: API_URL,
});

async function list(verified?: boolean) {
  const skills = await market.search('', verified ? { verified: true } : undefined);
  console.log(JSON.stringify(skills, null, 2));
}

async function search(query: string) {
  const skills = await market.search(query);
  console.log(JSON.stringify(skills, null, 2));
}

async function info(slug: string) {
  const skill = await market.info(slug);
  console.log(JSON.stringify(skill, null, 2));
}

async function call(slug: string, input: string) {
  if (!PRIVATE_KEY) {
    console.error('Error: SKILLZ_PRIVATE_KEY not set');
    process.exit(1);
  }

  const skill = await market.info(slug);
  console.error(`Calling ${skill.name} @ ${skill.endpoint} ($${skill.price} USDC)`);

  try {
    const result = await market.call(slug, JSON.parse(input));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function direct(url: string, input: string) {
  // Direct URL calls bypass the SDK and don't get automatic tracking
  // This is an edge case - prefer using slugs for tracking support
  if (!PRIVATE_KEY) {
    console.error('Error: SKILLZ_PRIVATE_KEY not set');
    process.exit(1);
  }

  console.error(`Calling endpoint: ${url}`);
  console.error('Note: Direct URL calls bypass analytics tracking. Use slugs for full tracking.');

  // Import x402 modules dynamically for direct calls only
  // @ts-ignore - Module resolution handled by tsx runtime
  const { x402Client, wrapFetchWithPayment } = await import('@x402/fetch');
  // @ts-ignore - Module resolution handled by tsx runtime
  const { registerExactEvmScheme } = await import('@x402/evm/exact/client');
  const { privateKeyToAccount } = await import('viem/accounts');

  const account = privateKeyToAccount(PRIVATE_KEY);
  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });
  const paymentFetch = wrapFetchWithPayment(fetch, client);

  try {
    const response = await paymentFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: input,
    });

    if (!response.ok) {
      console.error(`Call failed: ${response.statusText}`);
      process.exit(1);
    }

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Main dispatch
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'list':
    const verified = args.includes('--verified');
    list(verified).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
    break;
  case 'search':
    if (!args[0]) {
      console.error('Usage: search <query>');
      process.exit(1);
    }
    search(args[0]).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
    break;
  case 'info':
    if (!args[0]) {
      console.error('Usage: info <slug>');
      process.exit(1);
    }
    info(args[0]).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
    break;
  case 'call':
    if (!args[0] || !args[1]) {
      console.error('Usage: call <slug> <json_input>');
      process.exit(1);
    }
    call(args[0], args[1]).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
    break;
  case 'direct':
    if (!args[0] || !args[1]) {
      console.error('Usage: direct <url> <json_input>');
      process.exit(1);
    }
    direct(args[0], args[1]).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
    break;
  default:
    console.error('Usage: skillz-cli.ts <list|search|info|call|direct> [args]');
    process.exit(1);
}
