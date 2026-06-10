import { useState } from 'react';
import {
  Smartphone,
  FolderTree,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Wifi,
  RefreshCw,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  HardDrive,
  Download,
  Cloud
} from 'lucide-react';

function CodeBlock({ code, title, language = 'typescript' }: { code: string; title?: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mt-3">
      {title && (
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-xl">
          <span className="text-xs font-mono text-gray-400">{title}</span>
          <span className="text-xs text-gray-500">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm max-h-[500px] ${title ? 'rounded-b-xl' : 'rounded-xl'}`}>
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
            copied ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  status?: 'todo' | 'important';
}

function StepCard({ number, title, description, defaultOpen, children, status }: StepCardProps) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className={`bg-white rounded-2xl border-2 transition-all ${
      status === 'important' ? 'border-orange-200' : 'border-gray-100 hover:border-gray-200'
    }`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-4 p-6 text-left">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          status === 'important' ? 'bg-orange-100' : 'bg-emerald-100'
        }`}>
          <span className={`text-lg font-bold ${status === 'important' ? 'text-orange-600' : 'text-emerald-600'}`}>{number}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
        {open ? <ChevronDown className="w-5 h-5 text-gray-400 mt-1" /> : <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-gray-100">{children}</div>}
    </div>
  );
}

export default function AndroidGuide() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-green-100 rounded-2xl mb-4">
          <Smartphone className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Android App Development Guide</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
          Step-by-step guide to build the MedStock Android app with React Native, SQLite offline storage, and Supabase sync.
        </p>
      </div>

      {/* Prerequisites */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> Prerequisites — Install These First
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" /><strong>Node.js 18+</strong> — <a href="https://nodejs.org" target="_blank" className="underline">nodejs.org</a></li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" /><strong>Android Studio</strong> — <a href="https://developer.android.com/studio" target="_blank" className="underline">developer.android.com/studio</a></li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" /><strong>Java JDK 17</strong> — Usually bundled with Android Studio</li>
          </ul>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" /><strong>Expo Go app</strong> on your Android phone (from Play Store)</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" /><strong>VS Code</strong> — code editor</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" /><strong>Your Supabase URL & Key</strong> — from your live Supabase project</li>
          </ul>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">

        {/* Step 1: Create Project */}
        <StepCard number={1} title="Create React Native Project" description="Set up the Expo project and install all dependencies" defaultOpen>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Open a <strong>NEW terminal</strong> (NOT inside the web project). Create a separate folder for the Android app.</p>
            
            <CodeBlock title="Terminal — Run these commands one by one" language="bash" code={`# Step 1: Create the project
npx create-expo-app@latest MedStockMobile --template blank-typescript

# Step 2: Navigate into the project
cd MedStockMobile

# Step 3: Install core dependencies
npx expo install expo-sqlite
npx expo install @react-native-async-storage/async-storage
npx expo install @react-native-community/netinfo
npx expo install expo-status-bar

# Step 4: Install Supabase client
npm install @supabase/supabase-js

# Step 5: Install navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Step 6: Install UI helpers
npm install lucide-react-native react-native-svg
npx expo install react-native-svg
npm install date-fns

# Step 7: Start the app (scan QR with Expo Go on your phone)
npx expo start`} />

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800"><strong>✅ After running:</strong> Your phone should show a blank app with "Open up App.tsx to start working on your app!" — This means everything is working.</p>
            </div>
          </div>
        </StepCard>

        {/* Step 2: Project Structure */}
        <StepCard number={2} title="Create Project Folder Structure" description="Organize your code into a clean architecture">
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Create these folders inside your <code className="bg-gray-100 px-1 rounded">MedStockMobile/</code> project:</p>

            <CodeBlock title="Terminal — Create folders" language="bash" code={`# Create folder structure (run from MedStockMobile/)
mkdir -p src/database
mkdir -p src/context
mkdir -p src/screens
mkdir -p src/components
mkdir -p src/services
mkdir -p src/types
mkdir -p src/utils`} />

            <div className="bg-gray-50 rounded-xl p-4 border">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FolderTree className="w-4 h-4" /> Final Folder Structure
              </h4>
              <pre className="text-sm text-gray-600 font-mono">{`MedStockMobile/
├── App.tsx                  ← Entry point
├── src/
│   ├── database/
│   │   ├── schema.ts        ← SQLite table creation
│   │   ├── connection.ts    ← Database connection
│   │   ├── medicines.ts     ← Medicine CRUD
│   │   ├── sales.ts         ← Sales CRUD
│   │   └── syncQueue.ts     ← Pending sync operations
│   ├── context/
│   │   ├── AuthContext.tsx   ← Login/logout state
│   │   └── SyncContext.tsx   ← Online/offline & sync state
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── SaleScreen.tsx
│   │   ├── InventoryScreen.tsx
│   │   ├── RestockScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SyncScreen.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── MedicineCard.tsx
│   │   ├── CartItem.tsx
│   │   └── SyncBadge.tsx
│   ├── services/
│   │   ├── supabase.ts      ← Supabase client config
│   │   └── syncEngine.ts    ← Push/pull sync logic
│   ├── types/
│   │   └── index.ts         ← TypeScript types (shared with web)
│   └── utils/
│       └── helpers.ts       ← Formatting, ID generation
├── package.json
└── tsconfig.json`}</pre>
            </div>
          </div>
        </StepCard>

        {/* Step 3: Supabase Config */}
        <StepCard number={3} title="Configure Supabase Connection" description="Connect to your existing cloud database" status="important">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800"><strong>⚠️ IMPORTANT:</strong> Use the <strong>SAME</strong> Supabase project URL and anon key as your web app. Both apps share the same database!</p>
            </div>

            <CodeBlock title="src/services/supabase.ts" code={`import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';  // ← Replace with yours
const SUPABASE_ANON_KEY = 'eyJhbGci...your-key-here';        // ← Replace with yours

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,           // Persist login session on device
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,       // Not needed for mobile
  },
});`} />

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800"><strong>💡 Tip:</strong> For production, put these in an environment file. For now during development, hardcoding is fine.</p>
            </div>
          </div>
        </StepCard>

        {/* Step 4: TypeScript Types */}
        <StepCard number={4} title="Shared TypeScript Types" description="Same types used in both web and Android — keeps data consistent">
          <CodeBlock title="src/types/index.ts" code={`// These types match your Supabase database tables exactly

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  manufacturer: string;
  category_id: string;
  category_name?: string;
  unit_id: string;
  unit_name?: string;
  rack_location?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicineBatch {
  id: string;
  medicine_id: string;
  medicine_name?: string;
  batch_number: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  invoice_number: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_type: 'amount' | 'percentage';
  discount_value: number;
  discount_amount: number;
  tax_enabled: boolean;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'upi' | 'credit';
  created_at: string;
  created_by?: string;
  synced_from: 'android' | 'web';
  is_synced: boolean;       // LOCAL ONLY — tracks if pushed to cloud
}

export interface SaleItem {
  id: string;
  sale_id: string;
  medicine_id: string;
  medicine_name: string;
  batch_id: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SyncQueueItem {
  id: number;
  table_name: string;
  record_id: string;
  action: 'insert' | 'update' | 'delete';
  payload: string;           // JSON stringified data
  created_at: string;
  retry_count: number;
  last_error?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
  short_name: string;
}`} />
        </StepCard>

        {/* Step 5: SQLite Database */}
        <StepCard number={5} title="Set Up Local SQLite Database" description="Create local tables that mirror the cloud database — this is the core of offline-first" status="important">
          <div className="space-y-4">
            <p className="text-sm text-gray-700">This is the <strong>most critical file</strong>. SQLite stores everything locally so the app works without internet.</p>

            <CodeBlock title="src/database/connection.ts" code={`import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('medstock.db');
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}`} />

            <CodeBlock title="src/database/schema.ts" code={`import { getDatabase } from './connection';

export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

  // Enable WAL mode for better performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  await db.execAsync(\`
    -- Categories (synced from cloud)
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );

    -- Units (synced from cloud)
    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL
    );

    -- Medicines (master data, synced from cloud)
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      generic_name TEXT,
      manufacturer TEXT,
      category_id TEXT,
      unit_id TEXT,
      rack_location TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Medicine Batches (stock per batch, synced both ways)
    CREATE TABLE IF NOT EXISTS medicine_batches (
      id TEXT PRIMARY KEY,
      medicine_id TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      purchase_price REAL NOT NULL,
      selling_price REAL NOT NULL,
      quantity INTEGER DEFAULT 0,
      expiry_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(medicine_id, batch_number)
    );

    -- Sales (created locally, synced to cloud)
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      subtotal REAL NOT NULL,
      discount_type TEXT DEFAULT 'amount',
      discount_value REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      tax_enabled INTEGER DEFAULT 0,
      tax_percentage REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      created_by TEXT,
      synced_from TEXT DEFAULT 'android',
      is_synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Sale Items
    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      medicine_id TEXT NOT NULL,
      medicine_name TEXT NOT NULL,
      batch_id TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id)
    );

    -- Sync Queue (tracks what needs to be pushed to cloud)
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      retry_count INTEGER DEFAULT 0,
      last_error TEXT
    );

    -- Sync metadata (last sync timestamps)
    CREATE TABLE IF NOT EXISTS sync_meta (
      table_name TEXT PRIMARY KEY,
      last_synced_at TEXT,
      last_pulled_at TEXT
    );

    -- Initialize sync_meta for each table
    INSERT OR IGNORE INTO sync_meta (table_name) VALUES ('medicines');
    INSERT OR IGNORE INTO sync_meta (table_name) VALUES ('medicine_batches');
    INSERT OR IGNORE INTO sync_meta (table_name) VALUES ('sales');
    INSERT OR IGNORE INTO sync_meta (table_name) VALUES ('sale_items');
    INSERT OR IGNORE INTO sync_meta (table_name) VALUES ('categories');
    INSERT OR IGNORE INTO sync_meta (table_name) VALUES ('units');
  \`);

  console.log('✅ SQLite database initialized');
}`} />
          </div>
        </StepCard>

        {/* Step 6: Sync Engine */}
        <StepCard number={6} title="Build the Sync Engine" description="The brain — pushes local changes to cloud, pulls cloud changes to local" status="important">
          <div className="space-y-4">
            {/* Sync Architecture */}
            <div className="bg-slate-50 rounded-xl p-5 border">
              <h4 className="font-medium text-gray-900 mb-3">How the Sync Engine Works:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border text-center">
                  <Wifi className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">1. Detect Network</p>
                  <p className="text-xs text-gray-500">NetInfo checks if online</p>
                </div>
                <div className="bg-white rounded-lg p-3 border text-center">
                  <Cloud className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">2. Push Changes</p>
                  <p className="text-xs text-gray-500">Send sync_queue items to Supabase</p>
                </div>
                <div className="bg-white rounded-lg p-3 border text-center">
                  <Download className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">3. Pull Updates</p>
                  <p className="text-xs text-gray-500">Get new data from cloud → SQLite</p>
                </div>
              </div>
            </div>

            <CodeBlock title="src/services/syncEngine.ts" code={`import { supabase } from './supabase';
import { getDatabase } from '../database/connection';
import NetInfo from '@react-native-community/netinfo';

export class SyncEngine {
  private isSyncing = false;

  // Check if device is online
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  }

  // Main sync function — call this periodically or on network change
  async sync(): Promise<{ pushed: number; pulled: number; errors: number }> {
    if (this.isSyncing) return { pushed: 0, pulled: 0, errors: 0 };
    if (!(await this.isOnline())) return { pushed: 0, pulled: 0, errors: 0 };

    this.isSyncing = true;
    let pushed = 0, pulled = 0, errors = 0;

    try {
      // STEP 1: Push local changes to cloud
      pushed = await this.pushChanges();

      // STEP 2: Pull cloud changes to local
      pulled = await this.pullChanges();

    } catch (error) {
      console.error('Sync failed:', error);
      errors++;
    } finally {
      this.isSyncing = false;
    }

    return { pushed, pulled, errors };
  }

  // PUSH: Send local sync_queue items to Supabase
  private async pushChanges(): Promise<number> {
    const db = await getDatabase();
    let pushed = 0;

    // Get all pending items from sync queue
    const pending = await db.getAllAsync<{
      id: number; table_name: string; record_id: string;
      action: string; payload: string; retry_count: number;
    }>('SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 50');

    for (const item of pending) {
      try {
        const data = JSON.parse(item.payload);

        if (item.action === 'insert') {
          // Remove local-only fields before pushing
          const { is_synced, ...cloudData } = data;
          const { error } = await supabase
            .from(item.table_name)
            .upsert(cloudData, { onConflict: 'id' });

          if (error) throw error;

        } else if (item.action === 'update') {
          const { is_synced, ...cloudData } = data;
          const { error } = await supabase
            .from(item.table_name)
            .update(cloudData)
            .eq('id', item.record_id);

          if (error) throw error;

        } else if (item.action === 'delete') {
          const { error } = await supabase
            .from(item.table_name)
            .delete()
            .eq('id', item.record_id);

          if (error) throw error;
        }

        // Success — remove from queue, mark local record as synced
        await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        
        if (item.table_name === 'sales') {
          await db.runAsync(
            'UPDATE sales SET is_synced = 1 WHERE id = ?',
            [item.record_id]
          );
        }

        pushed++;

      } catch (error: any) {
        // Failed — increment retry count
        console.error(\`Push failed for \${item.table_name}/\${item.record_id}:\`, error.message);
        await db.runAsync(
          'UPDATE sync_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?',
          [error.message, item.id]
        );
      }
    }

    return pushed;
  }

  // PULL: Fetch cloud data updated since last sync
  private async pullChanges(): Promise<number> {
    const db = await getDatabase();
    let pulled = 0;

    // Pull categories
    pulled += await this.pullTable(db, 'categories', ['id', 'name', 'description']);

    // Pull units
    pulled += await this.pullTable(db, 'units', ['id', 'name', 'short_name']);

    // Pull medicines
    pulled += await this.pullTable(db, 'medicines', [
      'id', 'name', 'generic_name', 'manufacturer',
      'category_id', 'unit_id', 'rack_location', 'created_at', 'updated_at'
    ]);

    // Pull medicine batches
    pulled += await this.pullTable(db, 'medicine_batches', [
      'id', 'medicine_id', 'batch_number', 'purchase_price', 'selling_price',
      'quantity', 'expiry_date', 'created_at', 'updated_at'
    ]);

    return pulled;
  }

  private async pullTable(
    db: any, 
    tableName: string, 
    columns: string[]
  ): Promise<number> {
    try {
      // Get last pull time
      const meta = await db.getFirstAsync<{ last_pulled_at: string | null }>(
        'SELECT last_pulled_at FROM sync_meta WHERE table_name = ?',
        [tableName]
      );

      let query = supabase.from(tableName).select(columns.join(','));

      // Only fetch records updated since last pull
      if (meta?.last_pulled_at) {
        query = query.gt('created_at', meta.last_pulled_at);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) return 0;

      // Upsert each record into local SQLite
      for (const record of data) {
        const cols = columns.filter(c => record[c] !== undefined);
        const placeholders = cols.map(() => '?').join(',');
        const values = cols.map(c => record[c]);

        await db.runAsync(
          \`INSERT OR REPLACE INTO \${tableName} (\${cols.join(',')}) VALUES (\${placeholders})\`,
          values
        );
      }

      // Update last pull time
      await db.runAsync(
        'UPDATE sync_meta SET last_pulled_at = ? WHERE table_name = ?',
        [new Date().toISOString(), tableName]
      );

      return data.length;

    } catch (error) {
      console.error(\`Pull failed for \${tableName}:\`, error);
      return 0;
    }
  }

  // Add to sync queue (called when writing data locally)
  async addToQueue(tableName: string, recordId: string, action: string, payload: any): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO sync_queue (table_name, record_id, action, payload) VALUES (?, ?, ?, ?)',
      [tableName, recordId, action, JSON.stringify(payload)]
    );
  }

  // Get pending sync count
  async getPendingCount(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM sync_queue'
    );
    return result?.count || 0;
  }
}

// Singleton instance
export const syncEngine = new SyncEngine();`} />
          </div>
        </StepCard>

        {/* Step 7: Auth Context */}
        <StepCard number={7} title="Authentication Context" description="Login/logout with Supabase Auth, persist session on device">
          <CodeBlock title="src/context/AuthContext.tsx" code={`import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session (persisted in AsyncStorage)
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile(session.user.id, session.user.email || '');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || '');
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string, email: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    setUser({
      id: userId,
      email: data?.email || email,
      name: data?.name || email.split('@')[0],
      role: data?.role || 'staff',
    });
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) await fetchProfile(data.user.id, data.user.email || '');
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};`} />
        </StepCard>

        {/* Step 8: App Entry Point */}
        <StepCard number={8} title="App Entry Point (App.tsx)" description="Wire up auth, database init, and navigation">
          <CodeBlock title="App.tsx — Replace the entire file" code={`import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { initializeDatabase } from './src/database/schema';

// Import screens (create these next)
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SaleScreen from './src/screens/SaleScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import SyncScreen from './src/screens/SyncScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerStyle: { backgroundColor: '#059669' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ tabBarLabel: '🏠 Home' }} />
      <Tab.Screen name="Sale" component={SaleScreen}
        options={{ tabBarLabel: '🛒 Sale' }} />
      <Tab.Screen name="Inventory" component={InventoryScreen}
        options={{ tabBarLabel: '📦 Stock' }} />
      <Tab.Screen name="Sync" component={SyncScreen}
        options={{ tabBarLabel: '🔄 Sync' }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => setDbReady(true));
  }, []);

  if (loading || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ecfdf5' }}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={{ marginTop: 16, color: '#6b7280' }}>Loading MedStock...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppContent />
    </AuthProvider>
  );
}`} />
        </StepCard>

        {/* Step 9: Create Placeholder Screens */}
        <StepCard number={9} title="Create Placeholder Screens" description="Basic screens to get the app running — you'll enhance these next">
          <div className="space-y-4">
            <CodeBlock title="src/screens/LoginScreen.tsx" code={`import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💊 MedStock</Text>
      <Text style={styles.subtitle}>Medical Shop Manager</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password}
        onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#ecfdf5' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#059669' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#6b7280', marginBottom: 32 },
  error: { backgroundColor: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 16 },
  button: { backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`} />

            <CodeBlock title="src/screens/DashboardScreen.tsx" code={`import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { getDatabase } from '../database/connection';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ medicines: 0, batches: 0, todaySales: 0, pendingSync: 0 });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const db = await getDatabase();
    const meds = await db.getFirstAsync<{c:number}>('SELECT COUNT(*) as c FROM medicines');
    const batches = await db.getFirstAsync<{c:number}>('SELECT COUNT(*) as c FROM medicine_batches');
    const sales = await db.getFirstAsync<{c:number}>(\`SELECT COUNT(*) as c FROM sales WHERE date(created_at) = date('now')\`);
    const pending = await db.getFirstAsync<{c:number}>('SELECT COUNT(*) as c FROM sync_queue');
    setStats({ medicines: meds?.c||0, batches: batches?.c||0, todaySales: sales?.c||0, pendingSync: pending?.c||0 });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Hello, {user?.name} 👋</Text>

      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: '#ecfdf5' }]}>
          <Text style={styles.cardValue}>{stats.medicines}</Text>
          <Text style={styles.cardLabel}>Medicines</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#eff6ff' }]}>
          <Text style={styles.cardValue}>{stats.batches}</Text>
          <Text style={styles.cardLabel}>Batches</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.cardValue}>{stats.todaySales}</Text>
          <Text style={styles.cardLabel}>Today Sales</Text>
        </View>
        <View style={[styles.card, { backgroundColor: stats.pendingSync > 0 ? '#fef2f2' : '#f0fdf4' }]}>
          <Text style={styles.cardValue}>{stats.pendingSync}</Text>
          <Text style={styles.cardLabel}>Pending Sync</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', padding: 20, borderRadius: 16, marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  cardLabel: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  logoutBtn: { marginTop: 24, padding: 14, backgroundColor: '#fee2e2', borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#dc2626', fontWeight: '600' },
});`} />

            <CodeBlock title="src/screens/SaleScreen.tsx" code={`import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SaleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Quick Sale</Text>
      <Text style={styles.subtitle}>Sale screen will be built next — search medicine, FEFO auto-select, cart, checkout</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 },
});`} />

            <CodeBlock title="src/screens/InventoryScreen.tsx" code={`import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InventoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Inventory</Text>
      <Text style={styles.subtitle}>Inventory browser will be built next — view stock, expand batches, restock</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 },
});`} />

            <CodeBlock title="src/screens/SyncScreen.tsx" code={`import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { syncEngine } from '../services/syncEngine';

export default function SyncScreen() {
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastResult, setLastResult] = useState<string>('');

  useEffect(() => { loadPending(); }, []);

  const loadPending = async () => {
    const count = await syncEngine.getPendingCount();
    setPendingCount(count);
  };

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncEngine.sync();
    setLastResult(\`Pushed: \${result.pushed}, Pulled: \${result.pulled}, Errors: \${result.errors}\`);
    await loadPending();
    setSyncing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔄 Sync Status</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Pending Changes</Text>
        <Text style={[styles.cardValue, { color: pendingCount > 0 ? '#dc2626' : '#059669' }]}>
          {pendingCount}
        </Text>
      </View>

      {lastResult ? (
        <View style={[styles.card, { backgroundColor: '#ecfdf5' }]}>
          <Text style={{ color: '#059669', fontWeight: '600' }}>Last Sync Result:</Text>
          <Text style={{ color: '#065f46', marginTop: 4 }}>{lastResult}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.syncBtn} onPress={handleSync} disabled={syncing}>
        {syncing ? <ActivityIndicator color="#fff" /> : <Text style={styles.syncBtnText}>Sync Now</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  cardLabel: { fontSize: 14, color: '#6b7280' },
  cardValue: { fontSize: 36, fontWeight: 'bold', marginTop: 4 },
  syncBtn: { backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  syncBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`} />
          </div>
        </StepCard>

        {/* Step 10: Build APK */}
        <StepCard number={10} title="Build & Distribute APK" description="Generate an APK file to install on Android phones">
          <div className="space-y-4">
            <CodeBlock title="Terminal — Build APK" language="bash" code={`# Install EAS CLI (Expo Application Services)
npm install -g eas-cli

# Login to Expo account (create free at expo.dev if needed)
eas login

# Configure build (run once, select "Yes" for default)
eas build:configure

# Build APK for Android (preview = no Play Store needed)
eas build -p android --profile preview

# This takes 10-15 minutes. You'll get a download link for the .apk file.
# Share the APK with staff via WhatsApp, email, or direct transfer.`} />

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800"><strong>✅ After build:</strong> You'll get a URL to download the .apk file. Install it on any Android phone — no Play Store needed for internal use!</p>
            </div>
          </div>
        </StepCard>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">📱 Summary: Your Android App Will Have</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Shield className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <p className="font-medium">Login</p>
            <p className="text-emerald-200 text-xs">Same Supabase auth as web</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <HardDrive className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <p className="font-medium">Offline SQLite</p>
            <p className="text-emerald-200 text-xs">Works without internet</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <RefreshCw className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <p className="font-medium">Sync Engine</p>
            <p className="text-emerald-200 text-xs">Push/pull with retry</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Zap className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <p className="font-medium">Quick Sale</p>
            <p className="text-emerald-200 text-xs">FEFO batch selection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
