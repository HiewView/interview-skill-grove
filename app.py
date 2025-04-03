
from flask import Flask, request, jsonify
import soundfile as sf
import numpy as np
import asyncio
import edge_tts
import time
from faster_whisper import WhisperModel
from langchain_groq import ChatGroq
from PyPDF2 import PdfReader
from dotenv import load_dotenv
import os
import mutagen.mp3
from flask_cors import CORS
import tempfile
from auth_routes import auth_bp
from interview_routes import interview_bp
from db_config import init_db


load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
 
# Initialize database and extensions
init_db(app)

# Configure CORS to allow all origins and methods, including OPTIONS
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(interview_bp, url_prefix='/interview')

# Load FastWhisper Model
whisper_model = WhisperModel("small", device="cpu", compute_type="int8")

# Load Groq LLM
groq_api_key = os.getenv("GROQ_API_KEY", "")
llm = ChatGroq(api_key=groq_api_key, model="llama3-70b-8192", temperature=0.2, max_retries=2)

# EdgeTTS voice selection
VOICE = "en-US-JennyNeural"

interview_sessions = {}

def extract_text_from_pdf(pdf_path):
    """Extracts text from an uploaded PDF resume."""
    reader = PdfReader(pdf_path)
    text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    return text

async def generate_next_question(session_id, user_answer):
    """Generates the next interview question dynamically."""
    session = interview_sessions.get(session_id, {})
    memory_text = "\n".join([f"Q: {q}\nA: {a}" for q, a in session.get("memory", [])])
    
    prompt = f"""
    You are an AI interviewer conducting an interview for a candidate.
    
    ## Candidate Details:
    Name: {session.get('name', 'Unknown')}
    Role: {session.get('role', 'Not Specified')}
    Experience: {session.get('experience', '0')} years
    
    ## Resume Details:
    {session.get('resume_text', '')}
    
    ## Previous Questions & Answers:
    {memory_text}
    
    ## Candidate's Answer:
    {user_answer}
    
    Generate the next best interview question, ensuring variety across skills and topics:
    """
    
    response_text = ""
    async for chunk in llm.astream(prompt):
        response_text += chunk.content
    return response_text.strip()

async def text_to_speech(text):
    """Converts text to speech and returns file path."""
    tts = edge_tts.Communicate(text, voice=VOICE)
    output_path = "output.mp3"
    await tts.save(output_path)
    return output_path

@app.route("/start_interview", methods=["POST", "OPTIONS"])
def start_interview():
    """Initializes interview session."""
    if request.method == "OPTIONS":
         # Handle OPTIONS request for CORS preflight
         return "", 204
    data = request.json
    session_id = data.get("session_id")
    interview_sessions[session_id] = {
        "name": data.get("name"),
        "role": data.get("role"),
        "experience": data.get("experience"),
        "resume_text": data.get("resume_text"),
        "memory": []
    }
    return jsonify({"message": "Interview started!", "first_question": "Hello, welcome to the interview! Can you briefly introduce yourself?"})

@app.route("/submit_answer", methods=["POST", "OPTIONS"])
def submit_answer():
    """Handles answer submission and generates next question."""
    if request.method == "OPTIONS":
         # Handle OPTIONS request for CORS preflight
         return "", 204
    data = request.json
    session_id = data.get("session_id")
    user_answer = data.get("answer")
    
    # Get session and check if it exists
    session = interview_sessions.get(session_id)
    if not session:
        return jsonify({"error": "Invalid session."}), 400
    
    # Add to memory
    if len(session.get("memory", [])) == 0:
        session["memory"] = []
        session["memory"].append(("Interviewer", "Hello, welcome to the interview! Can you briefly introduce yourself?"))
        
    session["memory"].append(("Candidate", user_answer))
    
    try:
        # Generate next question
        next_question = asyncio.run(generate_next_question(session_id, user_answer))
        session["memory"].append(("Interviewer", next_question))
        
        return jsonify({"next_question": next_question})
    except Exception as e:
        print(f"Error generating next question: {str(e)}")
        return jsonify({"next_question": "I apologize, but I encountered an error processing your answer. Could you please elaborate on your previous response?"}), 200

@app.route("/transcribe", methods=["POST", "OPTIONS"])
def transcribe():
    """Transcribes audio using Whisper model."""
    if request.method == "OPTIONS":
         # Handle OPTIONS request for CORS preflight
         return "", 204
         
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    # Create a temporary file to store the audio
    with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_audio:
        audio_file.save(temp_audio.name)
        temp_audio_path = temp_audio.name
    
    try:
        # Use Whisper model for transcription
        segments, info = whisper_model.transcribe(temp_audio_path, beam_size=5)
        
        # Get the full transcript
        transcript = " ".join([segment.text for segment in segments])
        
        # Clean up temporary file
        os.unlink(temp_audio_path)
        
        return jsonify({"transcript": transcript})
    
    except Exception as e:
        # Clean up temporary file in case of an exception
        if os.path.exists(temp_audio_path):
            os.unlink(temp_audio_path)
        
        print(f"Transcription error: {str(e)}")
        return jsonify({"transcript": ""}), 200

# Add endpoint for /interview/end_interview that works without JWT
@app.route("/interview/end_interview", methods=["POST", "OPTIONS"])
def end_interview_direct():
    """End interview and generate report."""
    if request.method == "OPTIONS":
         # Handle OPTIONS request for CORS preflight
         return "", 204
         
    data = request.get_json()
    if not data or not data.get("session_id"):
        return jsonify({"error": "Invalid request. Session ID required."}), 400
        
    session_id = data.get("session_id")
    session = interview_sessions.get(session_id)
    
    if not session:
        return jsonify({"error": "Invalid session"}), 400
    
    # Extract QA pairs
    qa_pairs = []
    memory = session.get("memory", [])
    for i in range(0, len(memory), 2):
        if i+1 < len(memory):
            qa_pairs.append({
                "question": memory[i][1] if memory[i][0] == "Interviewer" else memory[i+1][1],
                "answer": memory[i+1][1] if memory[i+1][0] == "Candidate" else memory[i][1],
                "assessment": "Good answer with clear explanation."
            })
     
    # Create a simple report without MongoDB
    report_id = f"report-{session_id}"
    
    # Generate metrics (simplified without LLM)
    technical_metrics = [
        {"name": "Domain Knowledge", "value": 80, "color": "#4CAF50"},
        {"name": "Problem Solving", "value": 85, "color": "#2196F3"},
        {"name": "Technical Skills", "value": 90, "color": "#9C27B0"}
    ]
    communication_metrics = [
        {"name": "Clarity", "value": 85, "color": "#FF9800"},
        {"name": "Confidence", "value": 80, "color": "#E91E63"},
        {"name": "Articulation", "value": 75, "color": "#3F51B5"}
    ]
     
    personality_metrics = [
        {"name": "Cultural Fit", "value": 90, "color": "#009688"},
        {"name": "Adaptability", "value": 85, "color": "#607D8B"},
        {"name": "Leadership", "value": 80, "color": "#795548"}
    ]
    
    # Calculate overall score
    metrics_list = technical_metrics + communication_metrics + personality_metrics
    overall_score = sum(metric["value"] for metric in metrics_list) / len(metrics_list)
    
    return jsonify({
        "report_id": report_id,
        "overall_score": overall_score,
        "message": "Interview completed and report generated"
    }), 201

if __name__ == "__main__":
    app.run(debug=True)
