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
  Zap
} from 'lucide-react';

interface Step {
  id: number;
  phase: string;
  title: string;
  description: string;
  tasks: string[];
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
      'Design database tables (medicines, sales, purchases, suppliers, users)',
      'Set up Supabase project and create tables',
      'Configure Row Level Security (RLS) policies',
      'Create database triggers for auto-calculations',
      'Set up authentication with Supabase Auth',
      'Test database operations via Supabase dashboard'
    ],
    status: 'completed',
    techStack: ['Supabase', 'PostgreSQL', 'SQL']
  },
  {
    id: 2,
    phase: 'Phase 2',
    title: 'Web Module Development',
    description: 'Build the complete web application with direct Supabase connection',
    tasks: [
      'Set up React + Vite + Tailwind CSS project ✓',
      'Create authentication flow (login/register)',
      'Build Dashboard with analytics ✓',
      'Implement Sales module with POS ✓',
      'Build Inventory management ✓',
      'Create Purchase order system ✓',
      'Implement Reports & Export ✓',
      'Add Bulk upload functionality ✓',
      'Integrate with Supabase real-time'
    ],
    status: 'current',
    techStack: ['React', 'Vite', 'Tailwind CSS', 'Supabase JS', 'Recharts']
  },
  {
    id: 3,
    phase: 'Phase 3',
    title: 'Android Module Development',
    description: 'Build offline-first Android app with local database and sync capability',
    tasks: [
      'Set up React Native project',
      'Configure SQLite/WatermelonDB for local storage',
      'Mirror web UI for mobile experience',
      'Implement offline-first architecture',
      'Build sync engine for Supabase',
      'Handle conflict resolution',
      'Add barcode scanning feature',
      'Test offline scenarios',
      'Generate APK for distribution'
    ],
    status: 'pending',
    techStack: ['React Native', 'SQLite', 'WatermelonDB', 'Supabase']
  },
  {
    id: 4,
    phase: 'Phase 4',
    title: 'Testing & Deployment',
    description: 'Test both platforms thoroughly and deploy for production use',
    tasks: [
      'Test web module end-to-end',
      'Test Android offline/online scenarios',
      'Test data sync between platforms',
      'Deploy web app (Vercel/Netlify)',
      'Distribute Android APK',
      'Set up backup strategies',
      'Document user guides',
      'Go live!'
    ],
    status: 'pending',
    techStack: ['Vercel', 'Android APK', 'Testing']
  }
];

export default function ProjectPlan() {
  const [activeStep, setActiveStep] = useState(2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Medical Shop Management System
        </h1>
        <p className="text-lg text-gray-600">
          Complete project roadmap for building a cross-platform inventory and sales management system
          with offline-first Android app and real-time web dashboard.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-semibold mb-6 text-center">System Architecture</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Web Module */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Web Module</h3>
                <p className="text-sm text-gray-300">Always Online</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                React + Vite + Tailwind
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Direct Supabase Connection
              </li>
              <li className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Bulk Operations & Reports
              </li>
            </ul>
          </div>

          {/* Supabase */}
          <div className="bg-emerald-500/20 rounded-xl p-6 border-2 border-emerald-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Supabase Cloud</h3>
                <p className="text-sm text-emerald-300">Central Database</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                PostgreSQL Database
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Authentication & RLS
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                Real-time Subscriptions
              </li>
            </ul>
          </div>

          {/* Android Module */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Android Module</h3>
                <p className="text-sm text-gray-300">Offline-First</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Code className="w-4 h-4 text-green-400" />
                React Native
              </li>
              <li className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-orange-400" />
                SQLite Local Storage
              </li>
              <li className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-400" />
                Background Sync
              </li>
            </ul>
          </div>
        </div>

        {/* Data Flow */}
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <div className="px-4 py-2 bg-blue-500/30 rounded-full text-sm">Web Browser</div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-emerald-500/30 rounded-full text-sm">Supabase API</div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-emerald-500/30 rounded-full text-sm">PostgreSQL</div>
          <ArrowRight className="w-5 h-5 text-gray-400 rotate-180 lg:rotate-0" />
          <div className="px-4 py-2 bg-green-500/30 rounded-full text-sm">Sync Engine</div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-orange-500/30 rounded-full text-sm">SQLite (Android)</div>
        </div>
      </div>

      {/* Project Phases */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Development Roadmap</h2>
        
        {projectSteps.map((step) => (
          <div
            key={step.id}
            className={`bg-white rounded-2xl border-2 transition-all cursor-pointer ${
              activeStep === step.id
                ? 'border-emerald-500 shadow-lg'
                : step.status === 'completed'
                ? 'border-green-200'
                : 'border-gray-100'
            }`}
            onClick={() => setActiveStep(step.id)}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  step.status === 'completed'
                    ? 'bg-green-100'
                    : step.status === 'current'
                    ? 'bg-emerald-100'
                    : 'bg-gray-100'
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
                      step.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : step.status === 'current'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {step.phase}
                    </span>
                    {step.status === 'current' && (
                      <span className="text-xs font-medium text-emerald-600">← You are here</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {step.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                      >
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
                        {task.includes('✓') ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={task.includes('✓') ? 'text-green-700' : 'text-gray-600'}>
                          {task.replace(' ✓', '')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3">🌐 Web Module (This Application)</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Direct Database Access:</strong> Connects directly to Supabase cloud</li>
            <li>• <strong>Real-time Updates:</strong> Uses Supabase real-time subscriptions</li>
            <li>• <strong>Admin Functions:</strong> Bulk uploads, reports, user management</li>
            <li>• <strong>No Offline Mode:</strong> Requires internet connection</li>
          </ul>
        </div>
        
        <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
          <h3 className="font-semibold text-green-900 mb-3">📱 Android Module (Next Step)</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>• <strong>Offline-First:</strong> Works without internet using SQLite</li>
            <li>• <strong>Background Sync:</strong> Syncs data when connection available</li>
            <li>• <strong>Daily Operations:</strong> Optimized for quick sales entry</li>
            <li>• <strong>Conflict Resolution:</strong> Handles data conflicts intelligently</li>
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">🚀 What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-medium mb-2">1. Set Up Supabase</p>
            <p className="text-sm text-emerald-100">
              Go to Settings → Database Setup to copy the SQL schema and create your Supabase project
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-medium mb-2">2. Connect Web App</p>
            <p className="text-sm text-emerald-100">
              Add your Supabase URL and API key in Settings to enable cloud storage
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-medium mb-2">3. Build Android App</p>
            <p className="text-sm text-emerald-100">
              Use React Native with the same UI components for a consistent experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
