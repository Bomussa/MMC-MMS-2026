export interface RecoveryEnv {
  SITE_ORIGIN?: string;
  PRIMARY_ORIGIN?: string;
  SECONDARY_ORIGIN?: string;
  FALLBACK_ORIGIN?: string;
  FAIL_COUNT?: string | number;
  DB: {
    prepare: (query: string) => {
      first<T = unknown>(): Promise<T | null>;
    };
  };
  MMS_CACHE: {
    put(key: string, value: string, options?: Record<string, unknown>): Promise<void>;
    get(key: string): Promise<string | null>;
  };
  R2_BACKUPS: {
    list(options: Record<string, unknown>): Promise<{ objects?: Array<{ key: string }>; }>;
    get(key: string): Promise<unknown>;
  };
}

export interface HealthProbe {
  name: string;
  ok: boolean;
  details?: unknown;
}
