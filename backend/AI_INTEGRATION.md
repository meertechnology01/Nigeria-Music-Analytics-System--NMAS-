# Beats AI - Gemini Integration Guide

## Overview

Beats AI is powered by **Google's Gemini 1.5 Flash** model, providing state-of-the-art reasoning capabilities for Nigeria's music economy analytics.

## Features

✅ **Multi-Model Support**
- Internal BeatsAI-v1 (pattern-matching, offline)
- Google Gemini 1.5 Flash (advanced reasoning, online)
- Ready for Claude, Groq, OpenAI integration

✅ **RAG Architecture**
- Knowledge base with 4+ core documents
- Semantic search for relevant context retrieval
- Citation generation with source tracking

✅ **Governance & Compliance**
- Full audit logging (query, response, model, tokens, timestamp)
- Role-based access control ready
- Export to Markdown/PDF for policy briefs

## Configuration

### API Key Setup

The Gemini API key is configured in three ways (priority order):

1. **Environment Variable** (Recommended for production)
   ```bash
   export GEMINI_API_KEY="AIzaSyBmFPthpIdrLptZCekTYyTNNscccF3tjCI"
   ```

2. **`.env` File** (Development)
   ```env
   GEMINI_API_KEY=AIzaSyBmFPthpIdrLptZCekTYyTNNscccF3tjCI
   ```

3. **config.py Default** (Fallback)
   ```python
   gemini_api_key: Optional[str] = "AIzaSyBmFPthpIdrLptZCekTYyTNNscccF3tjCI"
   ```

4. **Frontend UI** (Runtime Override)
   - Users can input API key in Settings panel
   - Sent with each request in `llm_config.apiKey`

### Installation

```powershell
# Install Google Generative AI SDK
pip install google-generativeai

# Or update from requirements.txt
pip install -r requirements.txt
```

## Usage

### Frontend (BeatsAIDashboard.tsx)

```typescript
// Model configuration state
const [modelConfig, setModelConfig] = useState({
  provider: 'gemini',           // 'internal' | 'gemini' | 'claude' | 'groq' | 'openai'
  modelName: 'gemini-1.5-flash',
  temperature: 0.7,             // 0.0 (deterministic) to 1.0 (creative)
  maxTokens: 2048,
  apiKey: ''                    // Optional: override default key
});

// Send chat request
const response = await fetch('/api/v1/ai/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: "What is Nigeria's music GDP impact?",
    conversation_history: [],
    llm_config: modelConfig,
    include_citations: true,
    include_analytics: true
  })
});
```

### Backend (ai_engine.py)

```python
# Auto-configured via environment or config.py
beats_ai = get_beats_ai()

# Process chat request
response = await beats_ai.chat(ChatRequest(
    message="Explain export revenue sources",
    llm_config={"provider": "gemini", "temperature": 0.5}
))

# Response includes:
# - response.response (text)
# - response.citations (sources)
# - response.model_used ("gemini/gemini-1.5-flash")
# - response.tokens_used (int)
# - response.confidence_score (float)
```

## API Endpoints

### POST `/api/v1/ai/chat`

Main chat completion with RAG.

**Request:**
```json
{
  "message": "What drives employment in the music sector?",
  "conversation_history": [
    {"role": "user", "content": "Previous question..."},
    {"role": "assistant", "content": "Previous answer..."}
  ],
  "llm_config": {
    "provider": "gemini",
    "temperature": 0.7,
    "maxTokens": 2048,
    "apiKey": "optional-override-key"
  },
  "include_citations": true,
  "include_analytics": true
}
```

**Response:**
```json
{
  "response": "**Employment Breakdown:**\n- Direct jobs: 11,500...",
  "citations": [
    {
      "source": "Employment Model",
      "snippet": "Jobs per $1M = 50 direct + 20 indirect",
      "relevance_score": 0.90
    }
  ],
  "chart_data": null,
  "model_used": "gemini/gemini-1.5-flash",
  "tokens_used": 523,
  "confidence_score": 0.88,
  "processing_time_ms": 1450
}
```

### GET `/api/v1/ai/audit-logs`

Retrieve audit trail for governance.

**Query Parameters:**
- `limit` (int): Max logs to return (default: 100)
- `user_id` (str): Filter by user (optional)

**Response:**
```json
[
  {
    "id": "audit_1731609234.567",
    "user_id": "user_123",
    "query": "What is the GDP contribution...",
    "response_summary": "Based on current data, Nigeria's...",
    "model_used": "gemini/gemini-1.5-flash",
    "tokens_used": 523,
    "timestamp": "2025-11-14T12:34:56Z",
    "ip_address": "192.168.1.100",
    "session_id": "session_abc123"
  }
]
```

### POST `/api/v1/ai/export`

Export conversations to Markdown or PDF.

**Request:**
```json
{
  "messages": [...],
  "format": "markdown",
  "include_metadata": true
}
```

### POST `/api/v1/ai/knowledge/ingest`

Add documents to knowledge base.

**Request:**
```json
{
  "title": "New Policy Document",
  "content": "Full document text...",
  "doc_type": "policy",
  "metadata": {"author": "Ministry of Arts", "date": "2025-11-14"}
}
```

## Model Selection Guide

| Model | Best For | Speed | Cost | Context Window |
|-------|----------|-------|------|----------------|
| **BeatsAI-v1** (internal) | Quick queries, offline use | ⚡⚡⚡ | Free | N/A |
| **Gemini 1.5 Flash** | Production, balanced performance | ⚡⚡ | $ | 1M tokens |
| Claude Sonnet | Complex analysis, policy drafts | ⚡ | $$$ | 200k tokens |
| GPT-4o | Creative content, visualization | ⚡ | $$ | 128k tokens |

### When to Use Internal Model:
- Testing/development without API costs
- Simple pattern-matched queries (GDP, jobs, exports, platforms)
- Offline environments
- Rate limit protection

### When to Use Gemini:
- **Production environment** (recommended)
- Complex policy analysis requiring reasoning
- Multi-turn conversations with context
- Generating custom reports and recommendations
- Questions outside pre-defined patterns

## Knowledge Base

Current documents loaded:

1. **Economic Impact Model** (doc_type: `economic_model`)
   - GDP calculation methodology
   - Economic multipliers (1.75x)
   - Employment intensity (50 jobs/$1M)

2. **Platform Ecosystem** (doc_type: `platform_data`)
   - 7 integrated platforms (YouTube, Boomplay, Audiomack, etc.)
   - Revenue shares and payout rates
   - Data collection methods (API, RSS, scraping)

3. **Nigeria Music Policy Context** (doc_type: `policy`)
   - 8 key policy challenges
   - Regulatory gaps
   - Tax incentive opportunities

4. **Music Economy Glossary** (doc_type: `glossary`)
   - Technical terms
   - Economic indicators
   - Industry jargon

### Adding Custom Knowledge

```python
from backend.ai_engine import get_beats_ai

beats_ai = get_beats_ai()
beats_ai.knowledge_base.add_document(
    title="2025 Streaming Revenue Report",
    content="Full report text with statistics...",
    doc_type="analytics",
    metadata={"source": "Internal Research", "year": 2025}
)
```

Or via API:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/ai/knowledge/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "title": "2025 Streaming Revenue Report",
    "content": "...",
    "doc_type": "analytics"
  }'
```

## Security Best Practices

1. **API Key Management**
   - ✅ Use environment variables in production
   - ✅ Rotate keys quarterly
   - ❌ Never commit `.env` to version control
   - ❌ Don't hardcode keys in frontend code

2. **Rate Limiting**
   - Configured in `config.py`: 60 requests/minute
   - Gemini free tier: 15 RPM, 1M TPM, 1500 RPD

3. **Audit Logging**
   - All queries logged with timestamp, user, model
   - Logs stored in-memory (production: migrate to database)
   - IP address and session tracking for security

4. **Data Privacy**
   - Queries truncated to 200 chars in audit logs
   - User data never sent to external LLMs without consent
   - GDPR-compliant response handling

## Troubleshooting

### Error: `google.generativeai` not installed
```powershell
pip install google-generativeai
```

### Error: API key invalid
- Check `.env` file or environment variable
- Verify key at https://makersuite.google.com/app/apikey
- Ensure key has Gemini API access enabled

### Error: Rate limit exceeded
- Switch to internal model temporarily
- Upgrade Gemini tier at Google Cloud Console
- Implement request queuing

### Slow responses
- Reduce `maxTokens` (default: 2048)
- Increase `temperature` for faster, less precise responses
- Use internal model for pattern-matched queries

### Citations missing
- Ensure `include_citations: true` in request
- Check knowledge base has relevant documents
- Verify RAG context retrieval (`get_context_for_query`)

## Future Enhancements

🔮 **Planned Features:**
- [ ] Vector embeddings with sentence-transformers
- [ ] Pinecone/ChromaDB integration for semantic search
- [ ] Claude 3.5 Sonnet integration
- [ ] Multi-modal support (chart images → vision models)
- [ ] Fine-tuned model on Nigeria music data
- [ ] Real-time streaming responses
- [ ] Function calling for dynamic analytics
- [ ] PDF export with reportlab/weasyprint

## Support

For issues or questions:
- Check logs: `backend/logs/app.log`
- Enable debug: `LOG_LEVEL=DEBUG` in `.env`
- Review audit logs: `GET /api/v1/ai/audit-logs`

---

**Beats AI** - Powered by Google Gemini 1.5 Flash 🚀
