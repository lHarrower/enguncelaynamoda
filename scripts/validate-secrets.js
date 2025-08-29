/**
 * Simple secret hygiene checks for CI.
 * - Fail if .env is tracked in git
 * - Warn if EXPO_PUBLIC_OPENAI_API_KEY appears in client code
 */
const { execSync } = require('child_process');

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (e) {
    return '';
  }
}

let hasError = false;

const trackedEnv = run('git ls-files .env');
if (trackedEnv === '.env') {
  
  hasError = true;
}

const matches = run('git grep -n "EXPO_PUBLIC_OPENAI_API_KEY"');
if (matches) {
  console.warn(
    'WARNING: Found references to EXPO_PUBLIC_OPENAI_API_KEY in the repository. Avoid bundling sensitive AI keys in the client.',
  );
}

if (hasError) {
  process.exit(1);
}
