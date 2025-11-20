import { useState, useRef, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Brain, 
  Send, 
  Loader2, 
  Download, 
  Trash2, 
  ChevronDown,
  FileText,
  BarChart3,
  Lightbulb,
  BookOpen,
  Settings as SettingsIcon,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  chartData?: any;
  metadata?: {
    model?: string;
    tokens?: number;
    confidence?: number;
  };
}

interface Citation {
  source: string;
  snippet: string;
  url?: string;
}

interface ModelConfig {
  provider: 'internal' | 'gemini' | 'claude' | 'groq' | 'openai';
  modelName: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
}

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: 'GDP Impact Analysis',
    prompt: 'Analyze the current GDP contribution of Nigeria\'s music industry and project growth over the next 5 years.'
  },
  {
    icon: Users,
    label: 'Employment Insights',
    prompt: 'Break down employment creation across direct and indirect jobs in the music sector.'
  },
  {
    icon: DollarSign,
    label: 'Export Revenue',
    prompt: 'Explain how diaspora consumption contributes to export revenue and suggest policy improvements.'
  },
  {
    icon: BarChart3,
    label: 'Platform Comparison',
    prompt: 'Compare revenue distribution across streaming platforms and identify opportunities.'
  }
];

export function BeatsAIDashboard() {
  const { settings } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: '👋 Welcome to **Beats AI** — your intelligent assistant for Nigeria\'s music economy.\n\nI have full access to all platform data, economic models, policy documents, and analytics. Ask me anything about:\n\n- 📊 Economic impact analysis\n- 📈 Trends and forecasting\n- 🌍 Regional and diaspora insights\n- 💡 Policy recommendations\n- 🎯 What-if scenario modeling\n\nHow can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    provider: 'gemini',
    modelName: 'Gemini 1.5 Flash',
    apiKey: 'AIzaSyBmFPthpIdrLptZCekTYyTNNscccF3tjCI',
    temperature: 0.7,
    maxTokens: 2048
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || input.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend AI endpoint
      const response = await fetch('http://127.0.0.1:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          conversation_history: messages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content })),
          llm_config: modelConfig,
          include_citations: true,
          include_analytics: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        citations: data.citations,
        chartData: data.chart_data,
        metadata: {
          model: data.model_used,
          tokens: data.tokens_used,
          confidence: data.confidence_score
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    handleSendMessage(prompt);
  };

  const handleExportChat = async (format: 'pdf' | 'markdown') => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/ai/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.filter(m => m.role !== 'system'),
          format,
          include_metadata: true
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beats-ai-conversation-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export conversation');
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear entire conversation history?')) {
      setMessages([messages[0]]); // Keep welcome message
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-2">
              Beats AI
              <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full">
                BETA
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Intelligent assistant for Nigeria's music economy
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportChat('markdown')}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
            title="Export as Markdown"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleExportChat('pdf')}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
            title="Export as PDF"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            title="Model settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Model Settings Panel */}
      {showSettings && (
        <div className="mb-3 sm:mb-4 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-700 p-3 sm:p-4 shadow-sm flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            Model Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="provider-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Provider
              </label>
              <select
                id="provider-select"
                value={modelConfig.provider}
                onChange={(e) => setModelConfig({ ...modelConfig, provider: e.target.value as 'internal' | 'gemini' | 'claude' | 'groq' | 'openai' })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                title="Select AI model provider"
              >
                <option value="internal">Internal (BeatsAI)</option>
                <option value="gemini">Google Gemini</option>
                <option value="claude">Anthropic Claude</option>
                <option value="groq">Groq</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            <div>
              <label htmlFor="temperature-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Temperature
              </label>
              <input
                id="temperature-input"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={modelConfig.temperature}
                onChange={(e) => setModelConfig({ ...modelConfig, temperature: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                title="Temperature controls randomness"
                placeholder="0.7"
              />
            </div>
            {modelConfig.provider !== 'internal' && (
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  API Key
                </label>
                <input
                  id="api-key-input"
                  type="password"
                  value={modelConfig.apiKey || ''}
                  onChange={(e) => setModelConfig({ ...modelConfig, apiKey: e.target.value })}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  title="API key for selected provider"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="mb-3 sm:mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 flex-shrink-0">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(prompt.prompt)}
              className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-left group"
            >
              <prompt.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {prompt.label}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 sm:p-4 space-y-3 sm:space-y-4 min-h-[300px] max-h-[600px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`w-full sm:max-w-[85%] lg:max-w-3xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-sm'
                  : message.role === 'system'
                  ? 'bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl rounded-tl-sm'
              } p-3 sm:p-4`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {message.metadata?.model || 'BeatsAI'}
                  </span>
                  {message.metadata?.confidence && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({(message.metadata.confidence * 100).toFixed(0)}% confidence)
                    </span>
                  )}
                </div>
              )}
              
              <div className="prose dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>

              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Sources
                  </div>
                  <div className="space-y-1">
                    {message.citations.map((citation, idx) => (
                      <div key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-medium">[{idx + 1}]</span>{' '}
                        {citation.url ? (
                          <a href={citation.url} className="hover:underline text-emerald-600 dark:text-emerald-400">
                            {citation.source}
                          </a>
                        ) : (
                          citation.source
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm p-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 sm:p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about Nigeria's music economy..."
              rows={2}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none text-sm sm:text-base"
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center min-w-[80px] sm:min-w-[100px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center">
            <kbd className="hidden sm:inline px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] mr-1">Enter</kbd>
            <span className="sm:hidden">Tap</span>
            <span className="hidden sm:inline">to send</span>
            <span className="sm:hidden">send button</span>
            <span className="hidden sm:inline">, </span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] mx-1">Shift+Enter</kbd>
            <span className="hidden sm:inline">for new line</span>
          </span>
          <span>{input.length} chars</span>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-2 sm:mt-3 text-center text-xs text-slate-500 dark:text-slate-400 px-2 sm:px-4 flex-shrink-0">
        <Lightbulb className="w-3 h-3 inline mr-1" />
        Beats AI has access to all platform data, economic models, and policy documents.
        All conversations are encrypted and audit-logged for governance compliance.
      </div>
    </div>
  );
}
