import { SQLiteProvider } from 'expo-sqlite';
import type { ReactNode } from 'react';

// The provider copies the bundled asset to the app's documents only once per name,
// so bump this when assets/cypher-en.db is rebuilt.
// shortcut: old copies stay on disk (~320 MB each); delete them when data updates become frequent.
const DB_NAME = 'cypher-en-2026-11-25.db';

export type DbProviderProps = { children: ReactNode };

export function DbProvider({ children }: DbProviderProps) {
  return (
    <SQLiteProvider
      databaseName={DB_NAME}
      assetSource={{ assetId: require('../../../assets/cypher-en.db') }}
      onInit={(db) => db.execAsync('PRAGMA query_only = ON')}
    >
      {children}
    </SQLiteProvider>
  );
}
