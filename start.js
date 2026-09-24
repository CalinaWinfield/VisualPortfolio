const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('\x1b[36m\x1b[1m%s\x1b[0m', '=======================================================');
console.log('\x1b[36m\x1b[1m%s\x1b[0m', '  Visual Portfolio - Starting Backend & Frontend');
console.log('\x1b[32m%s\x1b[0m', '  - Backend:  http://localhost:5001');
console.log('\x1b[35m%s\x1b[0m', '  - Frontend: http://localhost:4200');
console.log('\x1b[33m%s\x1b[0m', '  Press Ctrl+C anytime to stop both servers');
console.log('\x1b[36m\x1b[1m%s\x1b[0m', '=======================================================\n');

// Check backend .env
if (!fs.existsSync(path.join(backendDir, '.env'))) {
  console.log('\x1b[33m%s\x1b[0m', '[WARN] backend/.env file was not found! Make sure you configure MONGO_URL and JWT secrets.\n');
}

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const children = [];

function pipeLines(stream, prefix, colorCode) {
  if (!stream) return;
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    console.log(`${colorCode}${prefix}\x1b[0m ${line}`);
  });
}

function startBackend() {
  const child = spawn(`${npmCmd} start`, {
    cwd: backendDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  pipeLines(child.stdout, '[BACKEND]', '\x1b[36m\x1b[1m');
  pipeLines(child.stderr, '[BACKEND]', '\x1b[31m');

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`\x1b[31m[BACKEND] exited with code ${code}\x1b[0m`);
    }
  });

  children.push({ name: 'backend', process: child });
  return child;
}

function startFrontend() {
  const child = spawn(`${npmCmd} start`, {
    cwd: frontendDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  pipeLines(child.stdout, '[FRONTEND]', '\x1b[32m\x1b[1m');
  pipeLines(child.stderr, '[FRONTEND]', '\x1b[33m');

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`\x1b[31m[FRONTEND] exited with code ${code}\x1b[0m`);
    }
  });

  children.push({ name: 'frontend', process: child });
  return child;
}

let isCleaningUp = false;
function cleanup() {
  if (isCleaningUp) return;
  isCleaningUp = true;
  console.log('\n\x1b[33mStopping all Visual Portfolio processes...\x1b[0m');

  for (const item of children) {
    if (item.process && item.process.pid) {
      try {
        if (isWin) {
          execSync(`taskkill /pid ${item.process.pid} /t /f`, { stdio: 'ignore' });
        } else {
          item.process.kill('SIGINT');
        }
      } catch (e) {
        // Process might already be terminated
      }
    }
  }
  console.log('\x1b[32mAll processes stopped successfully.\x1b[0m');
  process.exit(0);
}

// Windows readline interface to reliably intercept Ctrl+C in CMD/PowerShell
if (isWin && process.stdin.isTTY) {
  process.stdin.setRawMode(false);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on('SIGINT', () => {
    cleanup();
  });
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
  if (!isCleaningUp) cleanup();
});

startBackend();
startFrontend();
