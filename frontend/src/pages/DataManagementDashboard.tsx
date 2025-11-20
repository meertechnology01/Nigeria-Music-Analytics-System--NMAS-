import { useEffect, useState } from 'react';
import { Database, Youtube, Music2, Play, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { runHarvest, getRecentSnapshots } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

interface IngestionResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
}

export function DataManagementDashboard() {
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [youtubeVideoIds, setYoutubeVideoIds] = useState('');
  const [spotifyClientId, setSpotifyClientId] = useState('');
  const [spotifyClientSecret, setSpotifyClientSecret] = useState('');
  const [spotifyTrackIds, setSpotifyTrackIds] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'youtube' | 'spotify'>('youtube');

  async function handleYoutubeIngestion() {
    // For prototype, this triggers the Python backend harvest across sources.
    setLoading(true);
    setResult(null);
    try {
      await runHarvest();
      setResult({ success: true, recordsProcessed: 0, errors: [] });
    } catch (error) {
      setResult({
        success: false,
        recordsProcessed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSpotifyIngestion() {
    // Prototype path triggers same backend harvest
    return handleYoutubeIngestion();
  }

  const [recent, setRecent] = useState<any | null>(null);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      setRecentLoading(true);
      setRecentError(null);
      try {
        const r = await getRecentSnapshots();
        setRecent(r);
      } catch (err: any) {
        setRecentError(err.message || 'Failed to load recent snapshots');
      } finally {
        setRecentLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data Management</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Ingest and manage streaming data from various platforms</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-300">
            <p className="font-medium">Before ingesting data:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800 dark:text-blue-300">
              <li>Ensure tracks exist in the database with corresponding platform IDs (spotify_id, youtube_video_id)</li>
              <li>Tracks must be linked to artists for proper attribution</li>
              <li>API keys must have appropriate permissions for the platforms</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'youtube'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50 dark:bg-red-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Youtube className="w-5 h-5" />
              <span>YouTube</span>
            </button>
            <button
              onClick={() => setActiveTab('spotify')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'spotify'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Music2 className="w-5 h-5" />
              <span>Spotify</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {recentLoading && (
            <div className="mb-6">
              <LoadingSpinner size="sm" message="Loading recent snapshots..." />
            </div>
          )}
          {recentError && (
            <div className="mb-6">
              <ErrorAlert message={recentError} />
            </div>
          )}
          {!recentLoading && !recentError && recent && (
            <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent Snapshots</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{recent.items?.length || 0} snapshot sets in the last harvest window.</p>
            </div>
          )}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  YouTube API Key
                </label>
                <input
                  type="password"
                  value={youtubeApiKey}
                  onChange={(e) => setYoutubeApiKey(e.target.value)}
                  placeholder="Enter your YouTube Data API v3 key"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Get your API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Google Cloud Console</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Video IDs (comma-separated)
                </label>
                <textarea
                  value={youtubeVideoIds}
                  onChange={(e) => setYoutubeVideoIds(e.target.value)}
                  placeholder="dQw4w9WgXcQ, jNQXAC9IVRw, 9bZkp7q19f0"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter YouTube video IDs separated by commas
                </p>
              </div>

              <button
                onClick={handleYoutubeIngestion}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Ingesting Data...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Ingest YouTube Data</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'spotify' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Spotify Client ID
                </label>
                <input
                  type="text"
                  value={spotifyClientId}
                  onChange={(e) => setSpotifyClientId(e.target.value)}
                  placeholder="Enter your Spotify Client ID"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Spotify Client Secret
                </label>
                <input
                  type="password"
                  value={spotifyClientSecret}
                  onChange={(e) => setSpotifyClientSecret(e.target.value)}
                  placeholder="Enter your Spotify Client Secret"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Get your credentials from <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Spotify Developer Dashboard</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Track IDs (comma-separated)
                </label>
                <textarea
                  value={spotifyTrackIds}
                  onChange={(e) => setSpotifyTrackIds(e.target.value)}
                  placeholder="11dFghVXANMlKmJXsNCbNl, 3n3Ppam7vgaVa1iaRUc9Lp"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter Spotify track IDs separated by commas
                </p>
              </div>

              <button
                onClick={handleSpotifyIngestion}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Ingesting Data...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Ingest Spotify Data</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className={`rounded-lg border p-6 ${
          result.success && result.errors.length === 0
            ? 'bg-green-50 border-green-200'
            : result.recordsProcessed > 0
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {result.success && result.errors.length === 0 ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : result.recordsProcessed > 0 ? (
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold ${
                result.success && result.errors.length === 0
                  ? 'text-green-900 dark:text-green-400'
                  : result.recordsProcessed > 0
                  ? 'text-amber-900 dark:text-amber-400'
                  : 'text-red-900 dark:text-red-400'
              }`}>
                {result.success && result.errors.length === 0
                  ? 'Data Ingestion Successful'
                  : result.recordsProcessed > 0
                  ? 'Partial Success'
                  : 'Ingestion Failed'}
              </h3>
              <p className={`mt-1 ${
                result.success && result.errors.length === 0
                  ? 'text-green-800 dark:text-green-300'
                  : result.recordsProcessed > 0
                  ? 'text-amber-800 dark:text-amber-300'
                  : 'text-red-800 dark:text-red-300'
              }`}>
                {result.recordsProcessed} record(s) processed successfully
              </p>
              {result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-slate-900 dark:text-white mb-2">Errors:</p>
                  <ul className="space-y-1 text-sm">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-slate-700 dark:text-slate-300">• {error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li className="text-slate-600 dark:text-slate-400">... and {result.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sample Data Setup</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          To test the data ingestion, you first need to create artists and tracks in the database. Here's a sample SQL script:
        </p>
        <div className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm">
{`-- Insert sample artist
INSERT INTO artists (name, genre, region, verified)
VALUES ('Burna Boy', 'Afrobeats', 'Lagos', true);

-- Get the artist ID and insert tracks
INSERT INTO tracks (artist_id, title, spotify_id, youtube_video_id, genre)
VALUES
  ((SELECT id FROM artists WHERE name = 'Burna Boy' LIMIT 1),
   'Last Last', '3LbfS2w5dZpsZ8gIUcPsJU', 'eXOeaAfwHdY', 'Afrobeats');`}
          </pre>
        </div>
      </div>
    </div>
  );
}
