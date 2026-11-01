import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RECORD_BATCH_SCRIPT, PUBLISH_SCRIPT, RELEASE_SCRIPT } from '../lib/ranking/scripts.ts';

// Supply the directory containing redis-server and redis-cli to run these tests.
// A private Unix socket and ephemeral data directory keep production Redis untouched.
const bin = process.env.REDIS_TEST_BIN;
test('Redis scripts: atomic recording, retry dedup, quotas, lease ownership and snapshots', { skip: !bin }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nightticker-ranking-'));
  const socket = join(dir, 'redis.sock');
  const server = spawn(join(bin, 'redis-server'), ['--port', '0', '--unixsocket', socket, '--save', '', '--appendonly', 'no', '--dir', dir], { stdio: 'ignore' });
  const cli = (...args) => execFileSync(join(bin, 'redis-cli'), ['-s', socket, '--raw', ...args.map(String)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { if (cli('PING') === 'PONG') { ready = true; break; } } catch { /* Startup. */ }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.ok(ready, 'test Redis started');
    const scriptPath = join(dir, 'record.lua');
    const publishPath = join(dir, 'publish.lua');
    const releasePath = join(dir, 'release.lua');
    writeFileSync(scriptPath, RECORD_BATCH_SCRIPT);
    writeFileSync(publishPath, PUBLISH_SCRIPT);
    writeFileSync(releasePath, RELEASE_SCRIPT);
    const keys = ['batch:1', 'rate:1', 'bucket:old', 'bucket:new'];
    const events = JSON.stringify([{ key: 3, symbol: 'NVDA', count: 2 }, { key: 4, symbol: 'AAPL', count: 1 }]);
    const record = (id, digest = 'digest-1', count = 3) => cli('--eval', scriptPath, id, ...keys.slice(1), ',', digest, count, 4, events);
    assert.equal(record(keys[0]), '1');
    assert.equal(cli('HGET', 'bucket:old', 'NVDA'), '2');
    assert.equal(cli('HGET', 'bucket:new', 'AAPL'), '1');
    assert.equal(cli('GET', 'rate:1'), '3');
    assert.equal(record(keys[0]), '0', 'same batch retry is acknowledged without another increment');
    assert.equal(cli('HGET', 'bucket:old', 'NVDA'), '2');
    assert.equal(record(keys[0], 'changed'), '-2', 'same id cannot change payload');
    assert.equal(record('batch:2'), '-1', 'quota is checked before any new write');
    assert.equal(cli('EXISTS', 'batch:2'), '0');
    assert.ok(Number(cli('TTL', 'batch:1')) > 7100);
    assert.ok(Number(cli('TTL', 'bucket:old')) > 89000);

    // Multiple concurrent retries must commit only once.
    const parallel = Array.from({ length: 10 }, () => new Promise((resolve, reject) => {
      const child = spawn(join(bin, 'redis-cli'), ['-s', socket, '--raw', '--eval', scriptPath, 'parallel', 'parallel-rate', 'parallel-bucket', ',', 'same', '1', '120', JSON.stringify([{ key: 3, symbol: 'TSLA', count: 1 }])]);
      child.on('error', reject); child.on('close', resolve);
    }));
    await Promise.all(parallel);
    assert.equal(cli('HGET', 'parallel-bucket', 'TSLA'), '1');

    cli('SET', 'lease', 'new-owner');
    assert.equal(cli('--eval', publishPath, 'lease', 'cache', 'snapshot', ',', 'old-owner', '{"expiresAt":123}', '{"NVDA":1}'), '0');
    assert.equal(cli('EXISTS', 'cache'), '0');
    assert.equal(cli('--eval', releasePath, 'lease', ',', 'old-owner'), '0');
    assert.equal(cli('GET', 'lease'), 'new-owner');
    assert.equal(cli('--eval', publishPath, 'lease', 'cache', 'snapshot', ',', 'new-owner', '{"expiresAt":123}', '{"NVDA":1}'), '1');
    assert.equal(cli('HGET', 'snapshot', 'NVDA'), '1');
    assert.equal(cli('EXISTS', 'lease'), '0');
    cli('SET', 'lease', 'next-owner');
    cli('--eval', publishPath, 'lease', 'cache', 'snapshot', ',', 'next-owner', '{}', '{"NVDA":2}');
    assert.equal(cli('HGET', 'snapshot', 'NVDA'), '1', 'hourly snapshot is immutable');
  } finally {
    try { cli('SHUTDOWN', 'NOSAVE'); } catch { server.kill(); }
    rmSync(dir, { recursive: true, force: true });
  }
});
