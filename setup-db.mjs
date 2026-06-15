import { spawn } from 'child_process';

const startTime = Date.now();
const cp = spawn('npx', ['-y', '@insforge/mcp@latest'], {
  env: {
    ...process.env,
    API_KEY: 'INSFORGE_SERVICE_KEY_PLACEHOLDER',
    API_BASE_URL: 'https://INSFORGE_HOST_PLACEHOLDER'
  },
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

let buf = '';
cp.stdout.on('data', d => { buf += d.toString(); });
cp.stderr.on('data', d => { process.stderr.write('stderr: ' + d.toString().substring(0,100)+'\n'); });

// Wait for server ready, then send command
setTimeout(() => {
  console.error('Sending SQL command...');
  const req = JSON.stringify({
    jsonrpc: '2.0', id: 1,
    method: 'tools/call',
    params: {
      name: 'run-raw-sql',
      arguments: {
        apiKey: 'INSFORGE_SERVICE_KEY_PLACEHOLDER',
        query: `
CREATE TABLE IF NOT EXISTS cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(150) NOT NULL,
  template_id VARCHAR(50) NOT NULL DEFAULT 'ats-clean-v1',
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cvs_user_id_idx ON cvs(user_id);
CREATE INDEX IF NOT EXISTS cvs_created_at_idx ON cvs(created_at DESC);
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cvs_manage" ON cvs;
CREATE POLICY "cvs_manage" ON cvs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cv_id UUID,
  position VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cover_letters_user_id_idx ON cover_letters(user_id);
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cl_manage" ON cover_letters;
CREATE POLICY "cl_manage" ON cover_letters FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO templates VALUES
  ('ats-clean-v1', 'ATS Clean', 'Format minimalis satu kolom, 100% ATS-friendly', true, NOW()),
  ('ats-modern-v1', 'ATS Modern', 'Modern dengan aksen warna tipis, tetap ATS-safe', true, NOW())
ON CONFLICT (id) DO NOTHING;
`
      }
    }
  });
  cp.stdin.write(req + '\n');
}, 12000);

setTimeout(() => {
  console.error('Elapsed:', Date.now() - startTime, 'ms');
  console.error('Buffer length:', buf.length);
  const lines = buf.trim().split('\n').filter(l => l.startsWith('{'));
  console.error('JSON lines:', lines.length);
  if (lines.length > 0) {
    console.log(lines[lines.length - 1]);
  } else {
    console.error('First 1000 chars of buffer:', buf.substring(0, 1000));
  }
  cp.kill();
  process.exit(0);
}, 30000);
