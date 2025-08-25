// Supabase -> AppError mapping helper
import { PostgrestError } from '@supabase/supabase-js';

import { AppError, ErrorCategory, ErrorHandler, ErrorSeverity } from '@/utils/ErrorHandler';
import { isSupabaseOk, SupabaseResult } from '@/utils/supabaseResult';

export interface MappedSupabaseError extends AppError {
  original: PostgrestError | { message: string };
}

// Known Postgres / PostgREST codes (expandable)
const PG_CODE_CATEGORY: Record<string, ErrorCategory> = {
  '23505': ErrorCategory.DATABASE, // unique violation
  '23503': ErrorCategory.DATABASE, // foreign key violation
  '23502': ErrorCategory.VALIDATION, // not null violation
  '22P02': ErrorCategory.VALIDATION, // invalid text representation
  '23514': ErrorCategory.VALIDATION, // check constraint violation
  '42601': ErrorCategory.DATABASE, // syntax error
  '42P01': ErrorCategory.DATABASE, // undefined table
  '42501': ErrorCategory.PERMISSION, // insufficient privilege
  '40001': ErrorCategory.DATABASE, // serialization failure (retryable)
  '57014': ErrorCategory.DATABASE, // query canceled (potentially retryable)
  PGRST116: ErrorCategory.DATABASE, // no rows returned
};

// Localizable user message map (Turkish defaults; can be swapped later for i18n)
export const PG_CODE_USER_MESSAGES: Record<
  string,
  { msg: string; sev?: ErrorSeverity; retryable?: boolean }
> = {
  '23505': { msg: 'Bu kayıt zaten mevcut.' },
  '23503': { msg: 'İlişkili kayıt bulunamadı veya kısıt ihlali.' },
  '23502': { msg: 'Zorunlu alan eksik.', sev: ErrorSeverity.LOW },
  '22P02': { msg: 'Geçersiz veri formatı.', sev: ErrorSeverity.LOW },
  '23514': { msg: 'Veri bir kuralı ihlal ediyor.', sev: ErrorSeverity.LOW },
  '42601': { msg: 'Sunucu sorgu hatası.' },
  '42P01': { msg: 'Beklenen tablo mevcut değil.' },
  '42501': { msg: 'Bu işlem için yetkiniz yok.', sev: ErrorSeverity.MEDIUM },
  '40001': { msg: 'Geçici eşzamanlılık hatası. Tekrar denenebilir.', retryable: true },
  '57014': { msg: 'İşlem iptal edildi. Tekrar deneyin.', retryable: true },
  PGRST116: { msg: 'Kayıt bulunamadı.', sev: ErrorSeverity.LOW },
};

function classify(error: PostgrestError | { message: string }): {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  retryable: boolean;
} {
  const code = 'code' in error && error.code ? error.code : undefined;
  const category = code && PG_CODE_CATEGORY[code] ? PG_CODE_CATEGORY[code] : ErrorCategory.DATABASE;
  let severity = ErrorSeverity.MEDIUM;
  let userMessage = 'Veri işlemi sırasında bir hata oluştu.';
  let retryable = false;
  if (code && PG_CODE_USER_MESSAGES[code]) {
    const def = PG_CODE_USER_MESSAGES[code];
    userMessage = def.msg;
    if (def.sev) {
      severity = def.sev;
    }
    if (def.retryable) {
      retryable = true;
    }
  }
  return { category, severity, userMessage, retryable };
}

export function mapSupabaseError(
  error: PostgrestError | { message: string },
  context: Partial<AppError['context']> = {},
): MappedSupabaseError {
  const { category, severity, userMessage, retryable } = classify(error);
  // Lightweight unique id (timestamp + random)
  const id = `sb_err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    code: 'code' in error ? error.code : undefined,
    message: error.message || 'Supabase error',
    userMessage,
    category,
    severity,
    context: {
      timestamp: Date.now(),
      platform: context.platform || 'unknown',
      ...context,
    },
    isRecoverable: retryable,
    reportable: severity !== ErrorSeverity.LOW,
    originalError: error as unknown as Error,
  } as MappedSupabaseError;
}

// Convenience guard to enforce ok state or throw mapped AppError
export function ensureSupabaseOk<T>(
  result: SupabaseResult<T>,
  meta: { action: string; service?: string; [k: string]: unknown },
): T {
  if (isSupabaseOk(result)) {
    return result.data;
  }
  const mapped = mapSupabaseError(result.error, meta);
  // Best-effort logging/reporting
  try {
    const errorHandler = ErrorHandler.getInstance();
    if (errorHandler && typeof errorHandler.handleError === 'function') {
      errorHandler.handleError(mapped);
    }
  } catch {
    // Silent fail for error handling
  }
  // Create a proper AppError instance
  const appError = new Error(mapped.message) as Error & AppError;
  appError.code = mapped.code;
  appError.severity = mapped.severity;
  appError.category = mapped.category;
  appError.context = mapped.context;
  appError.timestamp = mapped.timestamp;
  appError.isRecoverable = mapped.isRecoverable;
  appError.userMessage = mapped.userMessage;
  throw appError;
}
