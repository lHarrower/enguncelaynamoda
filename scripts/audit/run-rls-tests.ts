/**
 * Supabase RLS Negative Test Harness (placeholder)
 * Contract: produce audit/out/security/rls.json with findings if policy gaps detected.
 */
import fs from 'fs';
import path from 'path';

interface PolicyMatrix {
  tables: Record<string, Record<string, string[]>>;
}

interface RLSFinding {
  id: string;
  table: string;
  role: string;
  action: string;
  description: string;
  severity: string;
}

async function run() {
  const findings: RLSFinding[] = [];
  const policyMatrixPath = path.join(process.cwd(), 'supabase', 'policy-matrix.json');
  if (!fs.existsSync(policyMatrixPath)) {
    findings.push({
      id: 'rls:matrix-missing',
      table: '*',
      role: '*',
      action: 'select',
      description: 'Supabase policy-matrix.json eksik (beklenen RLS tanımlamak için ekleyin)',
      severity: 'medium',
    });
  } else {
    try {
      const matrix: PolicyMatrix = JSON.parse(fs.readFileSync(policyMatrixPath, 'utf8'));
      // Negative test generation strategy: ensure no action grants to disallowed roles placeholder (real eval would call Supabase)
      for (const [table, actions] of Object.entries(matrix.tables || {})) {
        for (const [action, roles] of Object.entries(actions)) {
          if (roles.includes('*')) {
            continue;
          } // wildcard allowed
          // Standard expected roles set
          const allowed = new Set(roles);
          const canonicalRoles = ['anon', 'authenticated', 'service_role', 'admin'];
          for (const r of canonicalRoles) {
            // Heuristic: service_role or admin should generally not be blocked; if missing warn (low severity)
            if ((r === 'service_role' || r === 'admin') && !allowed.has(r)) {
              findings.push({
                id: 'rls:priv-role-missing',
                table,
                role: r,
                action,
                description: `${r} ${table}.${action} için açıkça listelenmemiş`,
                severity: 'low',
              });
            }
            // If anon listed on destructive actions, flag
            if (
              r === 'anon' &&
              allowed.has('anon') &&
              (action === 'insert' || action === 'update' || action === 'delete')
            ) {
              findings.push({
                id: 'rls:anon-destructive',
                table,
                role: r,
                action,
                description: `Anonim rol ${table} üzerinde ${action} işlemine izin verilmiş`,
                severity: 'high',
              });
            }
          }
          // If delete has any roles but update missing, possible inconsistency
          if (action === 'delete' && roles.length && !actions.update && roles[0]) {
            findings.push({
              id: 'rls:delete-without-update',
              table,
              role: roles[0],
              action,
              description: `${table} için silme izni var ama güncelleme işlemi eksik`,
              severity: 'medium',
            });
          }
        }
      }
    } catch (e) {
      findings.push({
        id: 'rls:matrix-parse-error',
        table: '*',
        role: '*',
        action: 'parse',
        description: 'Politika matrisi ayrıştırılamadı: ' + (e as Error).message,
        severity: 'medium',
      });
    }
  }
  const outDir = path.join(process.cwd(), 'audit', 'out', 'security');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'rls.json'), JSON.stringify({ findings }, null, 2));
}
run();
