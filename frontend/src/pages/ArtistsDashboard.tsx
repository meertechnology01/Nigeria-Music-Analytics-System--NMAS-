import { useEffect, useMemo, useState } from 'react';
import { getAllLatestTracks, getTrends } from '../lib/api';
import { Search, TrendingUp, Music, ExternalLink, Download } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface TurntableArtist {
  artist: string;
  total_tracks: number;
  total_streams: number;
  highest_rank: number;
  avg_rank: number;
  tracks: Array<{
    rank: number;
    title: string;
    streams: number;
  }>;
}

interface ArtistMetric {
  date: string;
  total_streams: number;
  total_revenue_usd: number;
  popularity_score: number;
}

export function ArtistsDashboard() {
  const { formatCurrency, settings } = useSettings();
  const [artists, setArtists] = useState<TurntableArtist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<TurntableArtist | null>(null);
  const [artistMetrics, setArtistMetrics] = useState<ArtistMetric[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

  useEffect(() => {
    loadTopArtists();
  }, []);

  useEffect(() => {
    if (selectedArtist) {
      loadArtistMetrics(selectedArtist.artist);
    }
  }, [selectedArtist]);

  async function loadTopArtists() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/charts/turntable`);
      if (!response.ok) throw new Error('Failed to fetch Turntable charts');
      const data = await response.json();
      
      setArtists(data.top_artists || []);
      setLastUpdated(data.last_updated || new Date().toISOString());
      if (data.top_artists && data.top_artists.length > 0) {
        setSelectedArtist(data.top_artists[0]);
      }
    } catch (error) {
      console.error('Error loading Turntable charts:', error);
      // Fallback to empty state
      setArtists([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadArtistMetrics(artistName: string) {
    try {
      const trends = await getTrends();
      // Generate artist-specific metrics based on their average performance
      const data: ArtistMetric[] = (trends.labels || []).map((label, idx) => {
        const streamsPerDay = Math.round((selectedArtist?.total_streams || 0) * (0.8 + Math.random() * 0.4) / 30);
        const revenueUsd = streamsPerDay * 0.003;
        const revenueNaira = revenueUsd * (settings.currencyRates?.NGN || 1500);
        
        return {
          date: label,
          total_streams: streamsPerDay,
          total_revenue_usd: Math.round(revenueNaira),
          popularity_score: Math.min(100, 100 - (selectedArtist?.avg_rank || 50)),
        };
      });
      setArtistMetrics(data);
    } catch (error) {
      console.error('Error loading artist metrics:', error);
    }
  }

  function handleDownloadCSV() {
    window.open(`${API_BASE}/api/v1/charts/turntable/download`, '_blank');
  }

  const filteredArtists = artists.filter((artist) =>
    artist?.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Top Artists</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Nigerian music chart performance • Updated {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Recently'}
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          <span>Download CSV</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
              Top Artists
            </h3>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {filteredArtists.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No artists found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredArtists.map((artist, index) => (
                  <button
                    key={artist.artist}
                    onClick={() => setSelectedArtist(artist)}
                    className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      selectedArtist?.artist === artist.artist ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-400 dark:text-slate-500">#{index + 1}</span>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{artist.artist}</h4>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {artist.total_tracks} track{artist.total_tracks !== 1 ? 's' : ''} • {artist.total_streams.toLocaleString()} streams
                          </p>
                          <div className="flex items-center space-x-3 text-xs">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Best: #{artist.highest_rank}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              Avg: #{artist.avg_rank.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(artist.total_streams * 0.003)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">est. revenue</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedArtist ? (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedArtist.artist}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Turntable Charts Performance</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Chart Tracks</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedArtist.total_tracks}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Streams</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {(selectedArtist.total_streams / 1_000_000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Best Rank</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      #{selectedArtist.highest_rank}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Rank</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      #{selectedArtist.avg_rank.toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Chart Tracks</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedArtist.tracks.map((track, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              #{track.rank}
                            </span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {track.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {track.streams.toLocaleString()} streams
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                  Streaming Trends
                </h3>
                {artistMetrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={artistMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
                      <XAxis dataKey="date" stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} />
                      <YAxis stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#fff', 
                          border: `1px solid ${settings.theme === 'dark' ? '#334155' : '#e2e8f0'}`, 
                          borderRadius: '8px', 
                          color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' 
                        }}
                      />
                      <Legend wrapperStyle={{ color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }} />
                      <Line type="monotone" dataKey="total_streams" stroke="#10b981" strokeWidth={2} name="Streams" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                    No data available
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Revenue Trends
                </h3>
                {artistMetrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={artistMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
                      <XAxis dataKey="date" stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} />
                      <YAxis stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#fff', 
                          border: `1px solid ${settings.theme === 'dark' ? '#334155' : '#e2e8f0'}`, 
                          borderRadius: '8px', 
                          color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' 
                        }}
                      />
                      <Legend wrapperStyle={{ color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }} />
                      <Bar dataKey="total_revenue_usd" fill="#3b82f6" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                    No data available
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-600 dark:text-slate-400">Select an artist to view detailed metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
