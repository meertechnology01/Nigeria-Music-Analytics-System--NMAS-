import { useEffect, useState } from 'react';
import { listPlatforms, getRecentSnapshots } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { Globe, Code, Play, Pause, Plus, Edit2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface DataSource {
  id: string;
  platform_name: string;
  platform_type: 'api' | 'scraping';
  base_url: string;
  requires_authentication: boolean;
  api_endpoint: string | null;
  rate_limit_per_minute: number;
  is_active: boolean;
  last_successful_run: string | null;
  configuration_notes: string | null;
  priority: number;
}

interface ScrapingJob {
  id: string;
  source_id: string | null;
  job_type: 'api' | 'scraping';
  status: 'pending' | 'running' | 'completed' | 'failed';
  items_collected: number;
  error_details: string | null;
  started_at: string | null;
  completed_at: string | null;
  execution_time_seconds: number | null;
  created_at: string;
  data_sources?: {
    platform_name: string;
  };
}

export function SourcesManagementDashboard() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [recentJobs, setRecentJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'api' | 'scraping'>('all');
  const [, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const platforms = await listPlatforms();
      setSources(
        (platforms || []).map((p, idx) => ({
          id: String(idx + 1),
          platform_name: p.display_name,
          platform_type: ['apple-music', 'deezer'].includes(p.platform) ? 'api' : 'scraping',
          base_url: p.homepage,
          requires_authentication: p.platform === 'youtube',
          api_endpoint: null,
          rate_limit_per_minute: 30,
          is_active: true,
          last_successful_run: null,
          configuration_notes: p.description,
          priority: idx + 1,
        }))
      );

      const recent = await getRecentSnapshots();
      setRecentJobs(
        (recent.items || []).map((snap: any, idx: number) => ({
          id: String(idx + 1),
          source_id: null,
          job_type: ['apple-music', 'deezer'].includes(snap.platform) ? 'api' : 'scraping',
          status: 'completed',
          items_collected: (snap.tracks || []).length,
          error_details: null,
          started_at: snap.retrieved_at,
          completed_at: snap.retrieved_at,
          execution_time_seconds: 2,
          created_at: snap.retrieved_at,
          data_sources: { platform_name: snap.display_name },
        }))
      );
    } catch (err: any) {
      console.error('Error loading sources:', err);
      setError(err.message || 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  }

  async function toggleSourceStatus(id: string, currentStatus: boolean) {
    // Prototype: toggle in memory only
    setSources((prev: DataSource[]) => prev.map((s: DataSource) => (s.id === id ? { ...s, is_active: !currentStatus } : s)));
  }

  const filteredSources: DataSource[] = sources.filter(
    (source: DataSource) => filterType === 'all' || source.platform_type === filterType
  );

  const apiCount = sources.filter((s: DataSource) => s.platform_type === 'api').length;
  const scrapingCount = sources.filter((s: DataSource) => s.platform_type === 'scraping').length;

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading data sources..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorAlert message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data Sources Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Configure API and web scraping sources for data collection</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Source</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Sources</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{sources.length}</p>
            </div>
            <Globe className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">API Sources</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{apiCount}</p>
            </div>
            <Code className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Scraping Sources</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{scrapingCount}</p>
            </div>
            <Globe className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-400">Python Backend Integration</p>
            <p className="text-blue-800 dark:text-blue-300 mt-1">
              Configure these sources in your Python scraping backend. Use the Supabase connection to fetch source configurations
              and update job statuses. Each source includes rate limiting and authentication requirements.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Configured Sources</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  filterType === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                All ({sources.length})
              </button>
              <button
                onClick={() => setFilterType('api')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  filterType === 'api'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                API ({apiCount})
              </button>
              <button
                onClick={() => setFilterType('scraping')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  filterType === 'scraping'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Scraping ({scrapingCount})
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredSources.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-600 dark:text-slate-400">No sources configured</p>
            </div>
          ) : (
            filteredSources.map((source) => (
              <div key={source.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{source.platform_name}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          source.platform_type === 'api'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        }`}
                      >
                        {source.platform_type.toUpperCase()}
                      </span>
                      {source.is_active ? (
                        <span className="flex items-center space-x-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-xs text-slate-400">
                          <Pause className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Base URL:</span> {source.base_url}
                      </p>
                      {source.api_endpoint && (
                        <p className="text-slate-600 dark:text-slate-400">
                          <span className="font-medium">Endpoint:</span> {source.api_endpoint}
                        </p>
                      )}
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Rate Limit:</span> {source.rate_limit_per_minute} requests/min
                      </p>
                      {source.requires_authentication && (
                        <p className="text-amber-600 dark:text-amber-400 text-xs font-medium">Requires Authentication</p>
                      )}
                      {source.configuration_notes && (
                        <p className="text-slate-500 text-xs mt-2">{source.configuration_notes}</p>
                      )}
                      {source.last_successful_run && (
                        <p className="text-slate-500 text-xs">
                          Last successful run: {new Date(source.last_successful_run).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSourceStatus(source.id, source.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        source.is_active
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={source.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {source.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Collection Jobs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No collection jobs found
                  </td>
                </tr>
              ) : (
                recentJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {job.data_sources?.platform_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.job_type === 'api'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        }`}
                      >
                        {job.job_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center space-x-1 text-xs font-medium ${
                          job.status === 'completed'
                            ? 'text-green-600'
                            : job.status === 'failed'
                            ? 'text-red-600'
                            : job.status === 'running'
                            ? 'text-blue-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {job.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                        {job.status === 'failed' && <XCircle className="w-3 h-3" />}
                        {job.status === 'running' && <Clock className="w-3 h-3 animate-spin" />}
                        <span className="capitalize">{job.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{job.items_collected}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {job.execution_time_seconds ? `${job.execution_time_seconds}s` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {job.started_at ? new Date(job.started_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Python Backend Integration Guide</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">1. Fetch Platforms from FastAPI</h4>
            <div className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 overflow-x-auto">
              <pre>{`import requests

API_BASE = "http://127.0.0.1:8000"

# Get all platforms from backend registry
resp = requests.get(f"{API_BASE}/api/v1/platforms")
resp.raise_for_status()
platforms = resp.json()

for p in platforms:
    if p.get('platform') in ['apple-music', 'deezer']:
        # Platform uses public API
        collect_via_api(p)
    else:
        # Platform requires HTML scraping
        collect_via_scraper(p)`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">2. Trigger Harvest and Inspect Results</h4>
            <div className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 overflow-x-auto">
              <pre>{`import requests

API_BASE = "http://127.0.0.1:8000"

# Trigger a harvest run (server orchestrates all registered platforms)
run = requests.post(f"{API_BASE}/api/v1/harvest/run", params={"limit": 20})
run.raise_for_status()

# Read recent snapshots saved by backend
recent = requests.get(f"{API_BASE}/api/v1/harvest/recent")
recent.raise_for_status()
for item in recent.json().get('items', []):
    print(item['display_name'], len(item.get('tracks', [])))`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">3. Respect Rate Limits</h4>
            <div className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 overflow-x-auto">
              <pre>{`import time

def rate_limit(requests_per_minute: int):
    delay = max(0.0, 60.0 / max(1, requests_per_minute))
    def _wrap(func):
        def _inner(*args, **kwargs):
            result = func(*args, **kwargs)
            time.sleep(delay)
            return result
        return _inner
    return _wrap`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
