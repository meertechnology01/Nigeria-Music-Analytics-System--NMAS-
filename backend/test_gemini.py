"""
Quick test script to verify Gemini integration is working.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_gemini_chat():
    """Test Gemini chat endpoint."""
    print("\n🧪 Testing Gemini Integration...")
    print("=" * 60)
    
    # Test with Gemini model
    payload = {
        "message": "Explain Nigeria's music GDP impact in 2 sentences",
        "conversation_history": [],
        "llm_config": {
            "provider": "gemini",
            "temperature": 0.5,
            "maxTokens": 500
        },
        "include_citations": True,
        "include_analytics": True
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/ai/chat",
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        data = response.json()
        
        print(f"\n✅ Chat Response Received")
        print(f"Model Used: {data.get('model_used')}")
        print(f"Tokens Used: {data.get('tokens_used')}")
        print(f"Processing Time: {data.get('processing_time_ms')}ms")
        print(f"\n📝 Response:\n{data.get('response')[:300]}...")
        print(f"\n📚 Citations: {len(data.get('citations', []))} sources")
        
        for i, citation in enumerate(data.get('citations', [])[:3], 1):
            print(f"  {i}. {citation.get('source')} (score: {citation.get('relevance_score')})")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        return False

def test_internal_model():
    """Test internal BeatsAI model."""
    print("\n\n🧪 Testing Internal Model...")
    print("=" * 60)
    
    payload = {
        "message": "What is the GDP contribution?",
        "conversation_history": [],
        "llm_config": {
            "provider": "internal"
        },
        "include_citations": True
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/ai/chat",
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        
        data = response.json()
        
        print(f"\n✅ Internal Model Response")
        print(f"Model Used: {data.get('model_used')}")
        print(f"\n📝 Response:\n{data.get('response')[:200]}...")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        return False

def test_audit_logs():
    """Test audit log retrieval."""
    print("\n\n🧪 Testing Audit Logs...")
    print("=" * 60)
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/ai/audit-logs?limit=5",
            timeout=10
        )
        response.raise_for_status()
        
        logs = response.json()
        
        print(f"\n✅ Retrieved {len(logs)} audit logs")
        
        if logs:
            latest = logs[0]
            print(f"\nLatest Log:")
            print(f"  Query: {latest.get('query')[:50]}...")
            print(f"  Model: {latest.get('model_used')}")
            print(f"  Tokens: {latest.get('tokens_used')}")
            print(f"  Time: {latest.get('timestamp')}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  BEATS AI - GEMINI INTEGRATION TEST SUITE")
    print("=" * 60)
    
    # Run tests
    results = []
    results.append(("Gemini Chat", test_gemini_chat()))
    results.append(("Internal Model", test_internal_model()))
    results.append(("Audit Logs", test_audit_logs()))
    
    # Summary
    print("\n\n" + "=" * 60)
    print("  TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    passed_count = sum(1 for _, p in results if p)
    total_count = len(results)
    
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n🎉 All tests passed! Gemini integration is working.")
    else:
        print("\n⚠️  Some tests failed. Check the output above.")
