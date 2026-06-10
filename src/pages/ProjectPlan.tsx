import { useState } from 'react';
import {
  CheckCircle,
  Circle,
  Code,
  Database,
  Smartphone,
  Globe,
  Server,
  ArrowRight,
  Layers,
  Cloud,
  HardDrive,
  RefreshCw,
  Shield,
  Zap,
  Wifi,
  WifiOff,
  ArrowDown,
  ArrowUp,
  Box,
  FileCode,
  Terminal,
  Download,
  AlertTriangle
} from 'lucide-react';

interface Step {
  id: number;
  phase: string;
  title: string;
  description: string;
  tasks: { text: string; done: boolean }[];
  status: 'completed' | 'current' | 'pending';
  techStack: string[];
}

const projectSteps: Step[] = [
  {
    id: 1,
    phase: 'Phase 1',
    title: 'Backend Planning & Database Design',
    description: 'Design a unified database schema that works for both Web and Android platforms',
    tasks: [
      { text: 'Design database tables (medicines, batches, sales, purchases, suppliers, users)', done: true },
      { text: 'Set up Supabase project and create 13 tables', done: true },
      { text: 'Configure Row Level Security (RLS) policies', done: true },
      { text: 'Create database triggers for auto stock management', done: true },
      { text: 'Set up authentication with Supabase Auth', done: true },
      { text: 'Create helper views (medicine_stock_view, fefo_batches_view, daily_sales_summary)', done: true },
      { text: 'Test database operations via Supabase dashboard', done: true }
    ],
    status: 'completed',
    techStack: ['Supabase', 'PostgreSQL', 'SQL', 'RLS Policies']
  },
  {
    id: 2,
    phase: 'Phase 2',
    title: 'Web Module Development & Deployment',
    description: 'Build the complete web application with direct Supabase connection — LIVE on Vercel',
    tasks: [
      { text: 'Set up React + Vite + Tailwind CSS project', done: true },
      { text: 'Login page with Supabase Auth (email/password)', done: true },
      { text: 'Dashboard with analytics, KPIs, drill-through slicers', done: true },
      { text: 'Sales module with POS, FEFO, discount (amount/%), tax toggle', done: true },
      { text: 'Inventory management — Medicine + Batch architecture, duplicate detection', done: true },
      { text: 'Purchase order system with supplier management', done: true },
      { text: 'Reports — Daily/Monthly statement, drill-through (Year→Quarter→Month→Week→Day)', done: true },
      { text: 'Bulk upload functionality (CSV/Excel)', done: true },
      { text: 'Settings — Customizable categories, units, tax, profile', done: true },
      { text: 'Stock history with full audit trail', done: true },
      { text: 'Export to CSV, Print invoices', done: true },
      { text: 'Protected routes — only logged-in users can access', done: true },
      { text: 'User menu with real profile data & Sign Out', done: true },
      { text: 'Deployed to Vercel with environment variables', done: true }
    ],
    status: 'completed',
    techStack: ['React 18', 'Vite', 'Tailwind CSS', 'Supabase JS', 'Recharts', 'date-fns', 'Vercel']
  },
  {
    id: 3,
    phase: 'Phase 3',
    title: 'Android Module Development',
    description: 'Build offline-first Android app with local SQLite database and background sync to Supabase',
    tasks: [
      { text: 'Set up React Native project with Expo or CLI', done: false },
      { text: 'Configure SQLite (expo-sqlite or WatermelonDB) for local database', done: false },
      { text: 'Mirror web database schema in SQLite (medicines, batches, sales, sale_items, etc.)', done: false },
      { text: 'Build Login screen with Supabase Auth', done: false },
      { text: 'Build Dashboard screen with KPIs from local DB', done: false },
      { text: 'Build Quick Sale screen — search medicine → FEFO auto-select → cart → checkout', done: false },
      { text: 'Build Inventory browser — view stock, expand batches, restock', done: false },
      { text: 'Implement offline-first write: all writes go to SQLite first', done: false },
      { text: 'Build Sync Engine — push local changes to Supabase when online', done: false },
      { text: 'Build Sync Engine — pull server changes to local SQLite', done: false },
      { text: 'Handle conflict resolution (last-write-wins with timestamps)', done: false },
      { text: 'Add network status detection (online/offline indicator)', done: false },
      { text: 'Build sync queue with retry logic for failed syncs', done: false },
      { text: 'Add barcode scanning for quick medicine lookup (optional)', done: false },
      { text: 'Build APK for Android distribution', done: false },
      { text: 'Test offline scenarios — airplane mode sales, then sync', done: false }
    ],
    status: 'current',
    techStack: ['React Native', 'Expo', 'SQLite', 'Supabase JS', 'NetInfo', 'TypeScript']
  },
  {
    id: 4,
    phase: 'Phase 4',
    title: 'Testing, Integration & Go Live',
    description: 'Test both platforms thoroughly, ensure data sync works, and launch for daily use',
    tasks: [
      { text: 'End-to-end test: Sale on Android (offline) → sync → appears on Web', done: false },
      { text: 'End-to-end test: Restock on Web → sync → appears on Android', done: false },
      { text: 'Test concurrent edits from Web and Android', done: false },
      { text: 'Test bulk upload via Web → stock appears on Android after sync', done: false },
      { text: 'Test reports on Web reflect both Web and Android sales', done: false },
      { text: 'Performance testing — large inventory (1000+ medicines)', done: false },
      { text: 'Set up automatic Supabase database backups', done: false },
      { text: 'Create user training guide', done: false },
      { text: 'Distribute APK to staff devices', done: false },
      { text: 'Go live with daily operations!', done: false }
    ],
    status: 'pending',
    techStack: ['Testing', 'APK Distribution', 'Supabase Backups']
  }
];

export default function ProjectPlan() {
  const [activeStep, setActiveStep] = useState(3);

  const completedPhases = projectSteps.filter(s => s.status === 'completed').length;
  const totalPhases = projectSteps.length;
  const progressPercent = Math.round((completedPhases / totalPhases) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Medical Shop Management System
        </h1>
        <p className="text-lg text-gray-600">
          Cross-platform inventory and sales management with offline-first Android app and real-time web dashboard.
        </p>
        
        {/* Overall Progress */}
        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-emerald-600">{completedPhases}/{totalPhases} Phases Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {projectSteps.map((step) => (
              <div key={step.id} className={`text-center p-2 rounded-lg ${
                step.status === 'completed' ? 'bg-green-50 text-green-700' :
                step.status === 'current' ? 'bg-emerald-50 text-emerald-700' :
                'bg-gray-50 text-gray-500'
              }`}>
                <p className="text-xs font-semibold">{step.phase}</p>
                <p className="text-xs mt-0.5">
                  {step.status === 'completed' ? '✅ Done' : step.status === 'current' ? '🔨 Active' : '⏳ Pending'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-semibold mb-6 text-center">System Architecture</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Web Module - Completed */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Web Module</h3>
                  <p className="text-sm text-gray-300">Always Online</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">✅ LIVE</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Code className="w-4 h-4 text-blue-400" />React + Vite + Tailwind</li>
              <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" />Direct Supabase Connection</li>
              <li className="flex items-center gap-2"><Layers className="w-4 h-4 text-purple-400" />Bulk Operations & Reports</li>
              <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" />Login Authentication</li>
            </ul>
          </div>

          {/* Supabase - Completed */}
          <div className="bg-emerald-500/20 rounded-xl p-6 border-2 border-emerald-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Supabase Cloud</h3>
                  <p className="text-sm text-emerald-300">Central Database</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">✅ LIVE</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Server className="w-4 h-4 text-emerald-400" />PostgreSQL + 13 Tables</li>
              <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" />Auth + RLS Policies</li>
              <li className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-emerald-400" />Auto Triggers & Views</li>
            </ul>
          </div>

          {/* Android Module - Building */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur border-2 border-orange-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500 rounded-xl">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Android Module</h3>
                  <p className="text-sm text-gray-300">Offline-First</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full animate-pulse">🔨 NEXT</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Code className="w-4 h-4 text-green-400" />React Native + Expo</li>
              <li className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-orange-400" />SQLite Local Storage</li>
              <li className="flex items-center gap-2"><Cloud className="w-4 h-4 text-blue-400" />Background Sync Engine</li>
            </ul>
          </div>
        </div>

        {/* Data Flow */}
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <div className="px-4 py-2 bg-blue-500/30 rounded-full text-sm">🌐 Web Browser</div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-emerald-500/30 rounded-full text-sm">☁️ Supabase API</div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-emerald-500/30 rounded-full text-sm">🗄️ PostgreSQL</div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-orange-500/30 rounded-full text-sm">🔄 Sync Engine</div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-green-500/30 rounded-full text-sm">📱 SQLite (Android)</div>
        </div>
      </div>

      {/* Android Offline-First Architecture Detail */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">📱 Phase 3: Android Offline-First Architecture</h2>

        {/* How Offline-First Works */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">When ONLINE</h3>
            </div>
            <ol className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                User makes a sale on Android
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                Data saved to <strong>local SQLite</strong> first (instant)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                Sync engine immediately pushes to <strong>Supabase</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                Web dashboard reflects the sale in real-time
              </li>
            </ol>
          </div>

          <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <WifiOff className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">When OFFLINE</h3>
            </div>
            <ol className="space-y-2 text-sm text-orange-800">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                User makes a sale on Android — <strong>works normally!</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                Data saved to <strong>local SQLite</strong> (instant)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                Change added to <strong>sync queue</strong> (pending)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                When internet returns → auto-syncs all pending changes
              </li>
            </ol>
          </div>
        </div>

        {/* Sync Engine Detail */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            Sync Engine Flow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-lg p-3 border text-center">
              <ArrowUp className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-700">PUSH</p>
              <p className="text-xs text-gray-500">Local → Supabase</p>
              <p className="text-xs text-gray-400 mt-1">Sales, Restocks made on mobile</p>
            </div>
            <div className="bg-white rounded-lg p-3 border text-center">
              <ArrowDown className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-700">PULL</p>
              <p className="text-xs text-gray-500">Supabase → Local</p>
              <p className="text-xs text-gray-400 mt-1">Bulk uploads, web changes</p>
            </div>
            <div className="bg-white rounded-lg p-3 border text-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-700">CONFLICT</p>
              <p className="text-xs text-gray-500">Same record changed</p>
              <p className="text-xs text-gray-400 mt-1">Last-write-wins + timestamps</p>
            </div>
            <div className="bg-white rounded-lg p-3 border text-center">
              <Box className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-700">QUEUE</p>
              <p className="text-xs text-gray-500">Pending changes</p>
              <p className="text-xs text-gray-400 mt-1">Retry with exponential backoff</p>
            </div>
            <div className="bg-white rounded-lg p-3 border text-center">
              <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-700">SYNCED</p>
              <p className="text-xs text-gray-500">Both in sync</p>
              <p className="text-xs text-gray-400 mt-1">Local = Cloud = Web</p>
            </div>
          </div>
        </div>

        {/* Android Screens */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">📱 Android App Screens</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Login', desc: 'Supabase Auth, cached session', icon: Shield },
              { name: 'Dashboard', desc: 'KPIs from local SQLite', icon: Layers },
              { name: 'Quick Sale', desc: 'Search → FEFO → Cart → Pay', icon: Zap },
              { name: 'Inventory', desc: 'Browse stock, expand batches', icon: HardDrive },
              { name: 'Restock', desc: 'Add batch to existing medicine', icon: ArrowDown },
              { name: 'Sale History', desc: 'Past sales, print receipt', icon: FileCode },
              { name: 'Sync Status', desc: 'Pending count, last sync time', icon: RefreshCw },
              { name: 'Settings', desc: 'Sync interval, offline mode', icon: Terminal },
            ].map((screen) => (
              <div key={screen.name} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <screen.icon className="w-6 h-6 text-emerald-600 mb-2" />
                <p className="font-medium text-gray-900 text-sm">{screen.name}</p>
                <p className="text-xs text-gray-500 mt-1">{screen.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack for Android */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">🛠️ Technology Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-2">Framework</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• <strong>React Native</strong> with Expo (easier APK build)</li>
                <li>• <strong>TypeScript</strong> (same types as web)</li>
                <li>• <strong>React Navigation</strong> (tab + stack nav)</li>
                <li>• <strong>NativeWind</strong> (Tailwind for RN)</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h4 className="font-medium text-green-900 mb-2">Local Database</h4>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• <strong>expo-sqlite</strong> (built-in, reliable)</li>
                <li>• Mirror cloud schema locally</li>
                <li>• <strong>sync_queue</strong> table for pending ops</li>
                <li>• <strong>last_synced_at</strong> timestamps</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <h4 className="font-medium text-purple-900 mb-2">Sync & Network</h4>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• <strong>@supabase/supabase-js</strong> (cloud API)</li>
                <li>• <strong>@react-native-community/netinfo</strong></li>
                <li>• Background sync with AppState</li>
                <li>• Conflict resolution engine</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Commands to Get Started */}
        <div className="mt-8 bg-gray-900 rounded-xl p-5 text-gray-100">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-400" />
            Getting Started Commands
          </h3>
          <pre className="text-sm overflow-x-auto space-y-1 text-green-300">
{`# Install Expo CLI globally
npm install -g expo-cli

# Create new React Native project
npx create-expo-app MedStockMobile --template blank-typescript

# Navigate to project
cd MedStockMobile

# Install dependencies
npx expo install expo-sqlite @supabase/supabase-js
npx expo install @react-native-async-storage/async-storage
npx expo install @react-native-community/netinfo
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context

# Start development
npx expo start

# Build APK (when ready)
eas build -p android --profile preview`}</pre>
        </div>
      </div>

      {/* Phase Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Development Roadmap</h2>
        
        {projectSteps.map((step) => {
          const completedTasks = step.tasks.filter(t => t.done).length;
          const totalTasks = step.tasks.length;
          const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          return (
            <div
              key={step.id}
              className={`bg-white rounded-2xl border-2 transition-all cursor-pointer ${
                activeStep === step.id
                  ? 'border-emerald-500 shadow-lg'
                  : step.status === 'completed'
                  ? 'border-green-200'
                  : 'border-gray-100'
              }`}
              onClick={() => setActiveStep(activeStep === step.id ? 0 : step.id)}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    step.status === 'completed' ? 'bg-green-100' :
                    step.status === 'current' ? 'bg-emerald-100' :
                    'bg-gray-100'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : step.status === 'current' ? (
                      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        step.status === 'completed' ? 'bg-green-100 text-green-700' :
                        step.status === 'current' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {step.phase}
                      </span>
                      <span className="text-xs text-gray-500">{completedTasks}/{totalTasks} tasks</span>
                      {step.status === 'current' && (
                        <span className="text-xs font-medium text-emerald-600 animate-pulse">← You are here</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                    
                    {/* Progress bar */}
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          step.status === 'completed' ? 'bg-green-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${taskPercent}%` }}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {step.techStack.map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {activeStep === step.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-3">Tasks:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.tasks.map((task, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          {task.done ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={task.done ? 'text-green-700' : 'text-gray-600'}>
                            {task.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Steps Call to Action */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">🚀 Ready for Phase 3: Android App</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <Download className="w-6 h-6 mb-2 opacity-80" />
            <p className="font-medium mb-1">Step 1: Setup</p>
            <p className="text-sm text-emerald-100">
              Install Node.js, Expo CLI, and create the React Native project
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <HardDrive className="w-6 h-6 mb-2 opacity-80" />
            <p className="font-medium mb-1">Step 2: Local DB</p>
            <p className="text-sm text-emerald-100">
              Set up SQLite, mirror the cloud schema, build CRUD operations
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <Cloud className="w-6 h-6 mb-2 opacity-80" />
            <p className="font-medium mb-1">Step 3: Sync</p>
            <p className="text-sm text-emerald-100">
              Build the sync engine — push/pull/conflict resolution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
