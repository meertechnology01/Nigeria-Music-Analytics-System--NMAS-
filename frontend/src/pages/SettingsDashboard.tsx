import { Settings, Info, Database, Globe, Check, DollarSign, Moon, Sun } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useState } from 'react';

export function SettingsDashboard() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = () => {
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings();
      setSaveMessage('Settings reset to defaults');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Configure system parameters and preferences</p>
        </div>
        {saveMessage && (
          <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{saveMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            {settings.theme === 'dark' ? (
              <Moon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Sun className="w-5 h-5 text-emerald-600" />
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Liquid Glass Effect
                </span>
                <button
                  onClick={() => updateSettings({ glassEffect: !settings.glassEffect })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    settings.glassEffect ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.glassEffect ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enable iOS-style translucent, blurred glass effect across the UI
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Data Collection</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.autoDataCollection}
                  onChange={(e) => updateSettings({ autoDataCollection: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Enable automatic data collection</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.storeRawData}
                  onChange={(e) => updateSettings({ storeRawData: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">Store raw streaming data</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.enableValidation}
                  onChange={(e) => updateSettings({ enableValidation: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">Enable data validation</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Regional Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Default Currency
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => updateSettings({ defaultCurrency: e.target.value as 'USD' | 'NGN' | 'EUR' })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Default Region
              </label>
              <select
                value={settings.defaultRegion}
                onChange={(e) => updateSettings({ defaultRegion: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Regions</option>
                <option value="lagos">Lagos</option>
                <option value="abuja">Abuja</option>
                <option value="port-harcourt">Port Harcourt</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Currency Conversion Rates</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                USD to NGN Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.usdToNgnRate}
                onChange={(e) => updateSettings({ usdToNgnRate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1 USD = {settings.usdToNgnRate} NGN</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                USD to EUR Rate
              </label>
              <input
                type="number"
                step="0.0001"
                value={settings.usdToEurRate}
                onChange={(e) => updateSettings({ usdToEurRate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1 USD = {settings.usdToEurRate} EUR</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> These rates are used to convert all USD values in the system to your selected currency. 
                Update these rates regularly to reflect current market conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Economic Model Parameters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Streaming Revenue Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.streamingRevenueMultiplier}
              onChange={(e) => updateSettings({ streamingRevenueMultiplier: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Factor to estimate total streaming revenue</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Concert Revenue Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.concertRevenueMultiplier}
              onChange={(e) => updateSettings({ concertRevenueMultiplier: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Factor to estimate concert revenue from streaming</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Employment Per Million ({settings.defaultCurrency})
            </label>
            <input
              type="number"
              step="1"
              value={settings.employmentPerMillion}
              onChange={(e) => updateSettings({ employmentPerMillion: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Jobs created per million {settings.defaultCurrency} of revenue</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Indirect Employment Ratio
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.indirectEmploymentRatio}
              onChange={(e) => updateSettings({ indirectEmploymentRatio: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ratio of indirect to direct employment</p>
          </div>
        </div>
        <div className="mt-6 flex items-center space-x-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Save Parameters
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">System Information</h3>
            <div className="mt-3 space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <p><strong>Database:</strong> Supabase PostgreSQL</p>
              <p><strong>Data Sources:</strong> YouTube, Spotify, Boomplay</p>
              <p><strong>Edge Functions:</strong> 3 deployed</p>
              <p><strong>Last Model Calculation:</strong> Check Economic Impact tab</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
