import { spawn } from 'child_process';

const cp = spawn('npx', ['-y', '@insforge/mcp@latest'], {
  env: { ...process.env, API_KEY: 'ik_4d3ca6e45067abcb06306c8edd48025f', API_BASE_URL: 'https://d5n38n23.ap-southeast.insforge.app' },
  stdio: ['pipe', 'pipe', 'pipe'], shell: true
});
let buf = '';
cp.stdout.on('data', d => buf += d);
cp.stderr.on('data', d => {});

setTimeout(() => {
  cp.stdin.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'run-raw-sql',arguments:{apiKey:'ik_4d3ca6e45067abcb06306c8edd48025f',query:'SELECT 1 AS test'}}})+'\n');
}, 15000);

setTimeout(() => {
  const lines = buf.split('\n').filter(l => l.startsWith('{'));
  if (lines.length) console.log(lines[lines.length-1]);
  else console.log('NO JSON:', buf.substring(0,500));
  cp.kill();
  process.exit(0);
}, 35000);
