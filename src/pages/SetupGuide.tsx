import { useState } from 'react';
import {
  CheckCircle,
  Copy,
  Database,
  Globe,
  Smartphone,
  Rocket,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Key,
  Check
} from 'lucide-react';
import { DATABASE_SCHEMA, FIX_PROFILE_SQL } from '../lib/supabase';

function CodeBlock({ code }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative mt-3">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm max-h-96">
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
  );
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function StepCard({ number, title, description, defaultOpen, children }: StepCardProps) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-4 p-6 text-left">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-emerald-600">{number}</span>
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

export default function SetupGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-emerald-100 rounded-2xl mb-4">
          <Rocket className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Setup & Deployment Guide</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
          Follow these steps to connect MedStock to Supabase and deploy for production.
        </p>
      </div>

      {/* Prerequisites */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> Before You Begin
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />Free <strong>Supabase</strong> account → <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a></li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />Free <strong>GitHub</strong> account → <a href="https://github.com" target="_blank" className="underline">github.com</a></li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />Free <strong>Vercel</strong> account → <a href="https://vercel.com" target="_blank" className="underline">vercel.com</a></li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" /><strong>Git</strong> installed on your computer</li>
        </ul>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <StepCard number={1} title="Create Supabase Project" description="Set up your cloud database (5 min)" defaultOpen>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>Go to <a href="https://supabase.com/dashboard" target="_blank" className="text-emerald-600 underline font-medium">supabase.com/dashboard</a> and sign in</li>
            <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>Click <strong>"New Project"</strong></li>
            <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <div>Fill in: <strong>Name:</strong> MedStock, <strong>Password:</strong> strong password (SAVE IT!), <strong>Region:</strong> nearest to you</div>
            </li>
            <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>Click <strong>"Create new project"</strong> and wait ~2 minutes</li>
          </ol>
        </StepCard>

        <StepCard number={2} title="Create Database Tables" description="Run the SQL schema to create all 13 tables">
          <div className="space-y-4">
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>In Supabase → <strong>SQL Editor</strong> → <strong>New Query</strong></li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>Click <strong>"Copy"</strong> below, paste into Supabase, click <strong>"Run"</strong></li>
            </ol>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800 font-medium">⚠️ Run the ENTIRE script at once. Don't split it.</p>
            </div>
            <CodeBlock code={DATABASE_SCHEMA} language="sql" />
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800"><strong>Creates:</strong> 13 tables, default categories & units, auto-triggers for stock, security policies, helper views.</p>
            </div>
          </div>
        </StepCard>

        <StepCard number={3} title="Create Admin User" description="Add your first user via Supabase Auth UI">
          <div className="space-y-4">
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>In Supabase → <strong>Authentication</strong> → <strong>Users</strong></li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>Click <strong>"Add user" → "Create new user"</strong></li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>Enter email & password, toggle <strong>"Auto Confirm User"</strong> ON</li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>Click <strong>"Create user"</strong></li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>Check <strong>Table Editor → profiles</strong> — your user should auto-appear</li>
            </ol>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 font-medium">⚠️ If profile NOT auto-created, run this fix in SQL Editor:</p>
            </div>
            <CodeBlock code={FIX_PROFILE_SQL} language="sql" />
          </div>
        </StepCard>

        <StepCard number={4} title="Get API Keys" description="Find your Supabase URL and API key">
          <div className="space-y-4">
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>Go to <strong>Project Settings → API</strong></li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <div className="space-y-2">
                  <span>Copy these two values:</span>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                    <Key className="w-4 h-4 text-gray-500" />
                    <div><p className="text-xs text-gray-500">Project URL</p><p className="font-mono text-xs">https://xxxxxx.supabase.co</p></div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                    <Key className="w-4 h-4 text-gray-500" />
                    <div><p className="text-xs text-gray-500">anon / public key</p><p className="font-mono text-xs">eyJhbGci... (long JWT)</p></div>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </StepCard>

        <StepCard number={5} title="Configure & Push to GitHub" description="Set up .env and push code securely">
          <div className="space-y-4">
            <p className="text-sm text-gray-700 font-medium">Create <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">.env</code> in project root:</p>
            <CodeBlock code={`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key-here`} language="bash" />

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800"><strong>🔒 CRITICAL:</strong> Make sure <code>.env</code> is in <code>.gitignore</code> so it does NOT get pushed to GitHub. Also remove any secrets from <code>vercel.json</code> before pushing.</p>
            </div>

            <p className="text-sm text-gray-700 font-medium mt-4">Your <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">.gitignore</code> MUST contain:</p>
            <CodeBlock code={`.env
.env.local
.env.*.local
node_modules/
dist/`} language="text" />

            <p className="text-sm text-gray-700 font-medium mt-4">Git commands to push (fresh start):</p>
            <CodeBlock code={`# If you already pushed with secrets, reset first:
git rm --cached .env
git rm --cached vercel.json   # if it had secrets

# Commit the cleanup
git add .gitignore
git commit -m "Remove secrets from tracking"

# Force push to overwrite the bad commit
git push --force origin main`} language="bash" />
          </div>
        </StepCard>

        <StepCard number={6} title="Deploy to Vercel" description="Host your web app for free">
          <div className="space-y-4">
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>Go to <a href="https://vercel.com" target="_blank" className="text-emerald-600 underline">vercel.com</a> → Sign in with GitHub</li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span><strong>"Add New" → "Project"</strong> → Select your Medistock repo</li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <div>Add <strong>Environment Variables</strong> in Vercel (NOT in code):
                  <CodeBlock code={`VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...your-key`} language="text" />
                </div>
              </li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>Click <strong>"Deploy"</strong> → Live at <code>yourapp.vercel.app</code>!</li>
            </ol>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800"><strong>✅ Secrets stay safe:</strong> .env is NOT in GitHub. Vercel reads env vars from its own settings.</p>
            </div>
          </div>
        </StepCard>

        <StepCard number={7} title="Test Everything" description="Verify the setup is working">
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />Open your deployed URL</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />Check Settings → Categories (should show 12 defaults)</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />Add a test medicine in Inventory</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />Create a test sale</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />Check Reports — data should reflect</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />In Supabase → Table Editor — verify data is stored</li>
          </ul>
        </StepCard>

        <StepCard number={8} title="Next: Android APK" description="Build the offline-first Android app">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
            <h4 className="font-semibold text-lg mb-4">Phase 3: Android Module</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-4">
                <h5 className="font-medium text-emerald-400 mb-2">Tech Stack</h5>
                <ul className="space-y-1 text-gray-300">
                  <li>• React Native (share UI logic)</li>
                  <li>• SQLite / WatermelonDB (local DB)</li>
                  <li>• Supabase JS SDK (cloud sync)</li>
                  <li>• NetInfo (online/offline detect)</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h5 className="font-medium text-blue-400 mb-2">Offline-First Flow</h5>
                <ul className="space-y-1 text-gray-300">
                  <li>1. Sale saved to local SQLite</li>
                  <li>2. Background check connectivity</li>
                  <li>3. When online → push to Supabase</li>
                  <li>4. Pull new data from cloud</li>
                </ul>
              </div>
            </div>
          </div>
        </StepCard>
      </div>

      {/* Architecture Summary */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">🎉 Your Full Stack Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <Database className="w-8 h-8 mb-2 opacity-80" />
            <p className="font-medium">Supabase Cloud</p>
            <p className="text-sm text-emerald-100 mt-1">PostgreSQL + Auth + Real-time API</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <Globe className="w-8 h-8 mb-2 opacity-80" />
            <p className="font-medium">Web App (Vercel)</p>
            <p className="text-sm text-emerald-100 mt-1">React + Vite — Always online</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <Smartphone className="w-8 h-8 mb-2 opacity-80" />
            <p className="font-medium">Android APK (Phase 3)</p>
            <p className="text-sm text-emerald-100 mt-1">React Native + SQLite — Offline-first</p>
          </div>
        </div>
      </div>
    </div>
  );
}
