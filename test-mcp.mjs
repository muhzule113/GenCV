import { spawn } from 'child_process';

const cp = spawn('npx', ['-y', '@insforge/mcp@latest'], {
  env: { ...process.env, API_KEY: 'INSFORGE_SERVICE_KEY_PLACEHOLDER', API_BASE_URL: 'https://INSFORGE_HOST_PLACEHOLDER' },
  stdio: ['pipe', 'pipe', 'pipe'], shell: true
});
let buf = '';
cp.stdout.on('data', d => buf += d);
cp.stderr.on('data', d => {});

setTimeout(() => {
  cp.stdin.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'run-raw-sql',arguments:{apiKey:'INSFORGE_SERVICE_KEY_PLACEHOLDER',query:'SELECT 1 AS test'}}})+'\n');
}, 15000);

setTimeout(() => {
  const lines = buf.split('\n').filter(l => l.startsWith('{'));
  if (lines.length) console.log(lines[lines.length-1]);
  else console.log('NO JSON:', buf.substring(0,500));
  cp.kill();
  process.exit(0);
}, 35000);
