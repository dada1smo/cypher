import { SQLiteProvider, type SQLiteProviderAssetSource } from 'expo-sqlite';
import type { ReactNode } from 'react';

export type DbProviderProps = {
  /** File name in expo-sqlite's default directory (Documents/SQLite). */
  databaseName: string;
  /** For a database bundled with the app: copied to `databaseName` on first open (once per name). */
  assetSource?: SQLiteProviderAssetSource;
  children: ReactNode;
};

/** Opens a dictionary database, read-only, for `useSQLiteContext()` below it. Knows no tables. */
export function DbProvider({ databaseName, assetSource, children }: DbProviderProps) {
  return (
    <SQLiteProvider
      databaseName={databaseName}
      assetSource={assetSource}
      onInit={(db) => db.execAsync('PRAGMA query_only = ON')}
    >
      {children}
    </SQLiteProvider>
  );
}
