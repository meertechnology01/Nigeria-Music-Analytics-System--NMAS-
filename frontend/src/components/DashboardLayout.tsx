import { ReactNode } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Database, Settings, Globe, Moon, Sun, Brain } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function CurrencyIcon({ className }: { className?: string }) {
  const { settings } = useSettings();
  
  return (
    <span className={className} style={{ fontWeight: 600, fontSize: '1em' }}>
      {settings.defaultCurrency === 'NGN' ? '₦' : settings.defaultCurrency === 'EUR' ? '€' : '$'}
    </span>
  );
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'beats-ai', label: 'Beats AI', icon: Brain, highlight: true },
  { id: 'artists', label: 'Artists', icon: Users },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'economic', label: 'Economic Impact', icon: CurrencyIcon },
  { id: 'sources', label: 'Data Sources', icon: Globe },
  { id: 'data', label: 'Data Management', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const { settings, toggleTheme } = useSettings();
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nigeria Music Analytics</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Digital Industry Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {settings.theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full">
                Live Data
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isHighlight = tab.highlight && activeTab !== tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                      : isHighlight
                      ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isHighlight && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Nigeria Music Industry Data Visibility & Economic Impact Analytics System
          </p>
        </div>
      </footer>
    </div>
  );
}
