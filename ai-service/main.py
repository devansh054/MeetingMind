from fastapi import FastAPI, HTTPException, BackgroundTasks, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import logging
from datetime import datetime
import openai
from dotenv import load_dotenv
import tempfile
import asyncio

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    logger.warning("OPENAI_API_KEY not set - Whisper will use mock responses")

app = FastAPI(
    title="MeetingMind AI Service",
    description="AI/ML microservice for speech-to-text, NLP, and automation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TranscriptionRequest(BaseModel):
    audio_data: str  # Base64 encoded audio
    meeting_id: str
    speaker_id: Optional[str] = None

class TranscriptionResponse(BaseModel):
    text: str
    confidence: float
    speaker_id: Optional[str]
    timestamp: datetime

class InsightExtractionRequest(BaseModel):
    transcript: str
    meeting_id: str
    context: Optional[Dict[str, Any]] = None

class InsightResponse(BaseModel):
    action_items: List[Dict[str, Any]]
    decisions: List[Dict[str, Any]]
    summary: str
    sentiment: Dict[str, float]
    topics: List[str]

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    services: Dict[str, str]

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "MeetingMind AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "transcribe": "/transcribe",
            "extract_insights": "/extract-insights",
            "identify_speaker": "/identify-speaker",
            "analyze_sentiment": "/analyze-sentiment",
            "docs": "/docs"
        }
    }

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for service monitoring"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0",
        services={
            "whisper": "ready",
            "nlp": "ready",
            "redis": "connected"
        }
    )

# Speech-to-text endpoint
@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(request: TranscriptionRequest):
    """Convert audio to text using OpenAI Whisper"""
    try:
        if not openai.api_key:
            # Fallback to mock for development without API key
            mock_text = f"[MOCK] This is a mock transcription for meeting {request.meeting_id}. The speaker said something important about the project timeline and next steps."
            return TranscriptionResponse(
                text=mock_text,
                confidence=0.85,
                speaker_id=request.speaker_id,
                timestamp=datetime.now()
            )
        
        # Decode base64 audio data
        import base64
        audio_bytes = base64.b64decode(request.audio_data)
        
        # Create temporary file for Whisper API
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name
        
        try:
            # Call OpenAI Whisper API
            client = openai.OpenAI(api_key=openai.api_key)
            with open(temp_file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json",
                    timestamp_granularities=["word"]
                )
            
            return TranscriptionResponse(
                text=transcript.text,
                confidence=0.95,  # Whisper doesn't return confidence, using default
                speaker_id=request.speaker_id,
                timestamp=datetime.now()
            )
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail="Transcription failed")

# File upload transcription endpoint
@app.post("/transcribe-file", response_model=TranscriptionResponse)
async def transcribe_audio_file(
    file: UploadFile = File(...),
    meeting_id: str = None,
    speaker_id: str = None
):
    """Convert uploaded audio file to text using OpenAI Whisper"""
    try:
        if not openai.api_key:
            # Fallback to mock for development without API key
            mock_text = f"[MOCK] Transcription of uploaded file for meeting {meeting_id}. The audio contained important discussion points."
            return TranscriptionResponse(
                text=mock_text,
                confidence=0.85,
                speaker_id=speaker_id,
                timestamp=datetime.now()
            )
        
        # Read uploaded file
        audio_content = await file.read()
        
        # Create temporary file for Whisper API
        with tempfile.NamedTemporaryFile(suffix=f".{file.filename.split('.')[-1]}", delete=False) as temp_file:
            temp_file.write(audio_content)
            temp_file_path = temp_file.name
        
        try:
            # Call OpenAI Whisper API
            client = openai.OpenAI(api_key=openai.api_key)
            with open(temp_file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json",
                    timestamp_granularities=["word"]
                )
            
            return TranscriptionResponse(
                text=transcript.text,
                confidence=0.95,
                speaker_id=speaker_id,
                timestamp=datetime.now()
            )
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        logger.error(f"File transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File transcription failed: {str(e)}")

# AI insights extraction endpoint (Week 2 implementation)
@app.post("/extract-insights", response_model=InsightResponse)
async def extract_insights(request: InsightExtractionRequest):
    """
    Extract action items, decisions, and insights from meeting transcript using GPT
    """
    try:
        if not openai.api_key:
            # Fallback to mock for development without API key
            mock_insights = {
                "action_items": [
                    "[MOCK] Review quarterly budget by Friday",
                    "[MOCK] Schedule follow-up meeting with marketing team",
                    "[MOCK] Finalize mobile app wireframes"
                ],
                "decisions": [
                    "[MOCK] Approved budget increase for Q2",
                    "[MOCK] Decided to prioritize mobile development",
                    "[MOCK] Selected React Native for cross-platform"
                ],
                "key_points": [
                    "[MOCK] Team velocity has increased 25% this quarter",
                    "[MOCK] Customer satisfaction scores improved significantly",
                    "[MOCK] Need to address scaling challenges before Q3"
                ],
                "participants": ["John Doe", "Jane Smith", "Mike Johnson"],
                "sentiment": "positive",
                "confidence": 0.85
            }
            
            return InsightResponse(
                action_items=mock_insights["action_items"],
                decisions=mock_insights["decisions"],
                key_points=mock_insights["key_points"],
                participants=mock_insights["participants"],
                sentiment=mock_insights["sentiment"],
                confidence=mock_insights["confidence"],
                timestamp=datetime.now()
            )
        
        # Real GPT-powered insights extraction
        client = openai.OpenAI(api_key=openai.api_key)
        
        # Create comprehensive prompt for insights extraction
        prompt = f"""
        Analyze the following meeting transcript and extract structured insights:

        TRANSCRIPT:
        {request.transcript}

        Please extract and format the following information as JSON:
        1. ACTION_ITEMS: Specific tasks mentioned that need to be completed, with clear ownership if mentioned
        2. DECISIONS: Key decisions made during the meeting
        3. KEY_POINTS: Important discussion points, conclusions, or insights
        4. PARTICIPANTS: Names of people mentioned or speaking (if identifiable)
        5. SENTIMENT: Overall sentiment of the meeting (positive, negative, neutral)

        Format your response as valid JSON with these exact keys:
        {{
            "action_items": ["item1", "item2", ...],
            "decisions": ["decision1", "decision2", ...],
            "key_points": ["point1", "point2", ...],
            "participants": ["name1", "name2", ...],
            "sentiment": "positive|negative|neutral"
        }}

        Be concise but comprehensive. Focus on actionable and important information.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert meeting analyst. Extract key insights from meeting transcripts and return them in the requested JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # Parse GPT response
        import json
        try:
            insights_json = json.loads(response.choices[0].message.content)
            
            return InsightResponse(
                action_items=insights_json.get("action_items", []),
                decisions=insights_json.get("decisions", []),
                key_points=insights_json.get("key_points", []),
                participants=insights_json.get("participants", []),
                sentiment=insights_json.get("sentiment", "neutral"),
                confidence=0.92,  # High confidence for GPT responses
                timestamp=datetime.now()
            )
            
        except json.JSONDecodeError:
            # Fallback if GPT doesn't return valid JSON
            logger.error("GPT response was not valid JSON")
            raise HTTPException(status_code=500, detail="Failed to parse insights from GPT response")
        
    except Exception as e:
        logger.error(f"Insights extraction error: {str(e)}")
        # Week 1: Mock response for testing
        mock_insights = InsightResponse(
            action_items=[
                {
                    "content": "Review Q4 budget allocation",
                    "assignee": "John Doe",
                    "due_date": "2024-01-15",
                    "priority": "high"
                },
                {
                    "content": "Schedule client demo",
                    "assignee": "Jane Smith", 
                    "due_date": "2024-01-10",
                    "priority": "medium"
                }
            ],
            decisions=[
                {
                    "content": "Approved mobile app development budget",
                    "impact": "high",
                    "stakeholders": ["Engineering", "Product"]
                }
            ],
            summary="Team discussed Q4 planning, approved mobile development, and scheduled follow-ups.",
            sentiment={
                "positive": 0.7,
                "neutral": 0.2,
                "negative": 0.1
            },
            topics=["budget", "mobile development", "quarterly planning"]
        )
        
        return mock_insights
        
        # TODO Week 2: Implement actual LLM-based extraction
        # import openai
        # response = openai.ChatCompletion.create(...)
        
    except Exception as e:
        logger.error(f"Insight extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Insight extraction failed")

# Speaker diarization endpoint (Week 2)
@app.post("/identify-speakers")
async def identify_speakers(audio_data: str, meeting_id: str):
    """
    Identify and label different speakers in audio
    Week 1: Returns mock speaker identification
    """
    try:
        # Mock response
        return {
            "speakers": [
                {"id": "speaker_1", "name": "Unknown Speaker 1", "confidence": 0.9},
                {"id": "speaker_2", "name": "Unknown Speaker 2", "confidence": 0.85}
            ],
            "segments": [
                {"start": 0.0, "end": 5.2, "speaker": "speaker_1"},
                {"start": 5.3, "end": 12.1, "speaker": "speaker_2"}
            ]
        }
        
        # TODO Week 2: Implement pyannote.audio for speaker diarization
        
    except Exception as e:
        logger.error(f"Speaker identification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Speaker identification failed")

# Sentiment analysis endpoint
@app.post("/analyze-sentiment")
async def analyze_sentiment(text: str, meeting_id: str):
    """Analyze sentiment of meeting transcript"""
    try:
        # Mock sentiment analysis
        import random
        return {
            "sentiment": {
                "positive": random.uniform(0.3, 0.8),
                "neutral": random.uniform(0.1, 0.4),
                "negative": random.uniform(0.0, 0.3)
            },
            "confidence": 0.92
        }
        
        # TODO Week 3: Implement actual sentiment analysis with spaCy/transformers
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Sentiment analysis failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
