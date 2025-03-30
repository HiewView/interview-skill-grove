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
# Configure CORS to allow all origins and methods, including OPTIONS
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

# Set secret key for sessions and JWT
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize database and extensions
init_db(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(interview_bp, url_prefix='/interview')

# Load FastWhisper Model
whisper_model = WhisperModel("small", device="cpu", compute_type="int8")

# Load Groq LLM
llm = ChatGroq(model="llama3-70b-8192", temperature=0.2, max_retries=2)

# EdgeTTS voice selection
VOICE = "en-US-JennyNeural"

interview_sessions = {}

# Helper functions like extract_text_from_pdf, generate_next_question, text_to_speech
def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    text = ""
    with open(pdf_path, "rb") as file:
        pdf_reader = PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

async def generate_next_question(session_id, user_answer):
    """Generates the next interview question using Groq LLM."""
    session = interview_sessions.get(session_id, {})
    
    if not session:
        return "Error: Invalid session."
    
    resume_text = session.get("resume_text", "")
    role = session.get("role", "Software Engineer")
    experience = session.get("experience", "5 years")
    memory = session.get("memory", [])
    
    # Format conversation history
    conversation_history = "\n".join([f"{speaker}: {text}" for speaker, text in memory])
    
    prompt = f"""
    You are an interviewer for the role of {role} with {experience} of experience.
    The candidate's resume text is: {resume_text}.
    Here is the current conversation history:
    {conversation_history}
    
    Now, generate the next question to ask the candidate.
    The question should be relevant to the role and the candidate's experience.
    The question should be open-ended and encourage the candidate to elaborate.
    """
    
    try:
        response = llm.invoke(prompt)
        return response.content
    except Exception as e:
        print(f"Error generating next question: {e}")
        return "Could you please elaborate on your previous answer?"

async def text_to_speech(text, filename="output.mp3"):
    """Converts text to speech using EdgeTTS."""
    communicate = edge_tts.Communicate(text, VOICE)
    try:
        with open(filename, "wb") as output:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    output.write(chunk["data"])
        return filename
    except Exception as e:
        print(f"Error during TTS: {e}")
        return None

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
    session = interview_sessions.get(session_id, {})
    
    if not session:
        return jsonify({"error": "Invalid session."}), 400
    
    session["memory"].append(("Candidate", user_answer))
    next_question = asyncio.run(generate_next_question(session_id, user_answer))
    session["memory"].append(("Interviewer", next_question))
    
    return jsonify({"next_question": next_question})

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
        
        return jsonify({"error": f"Transcription failed: {str(e)}"}), 500

@app.route("/generate_report", methods=["GET", "OPTIONS"])
def generate_report():
    """Generates interview summary report."""
    if request.method == "OPTIONS":
        # Handle OPTIONS request for CORS preflight
        return "", 204
    
    session_id = request.args.get("session_id")
    session = interview_sessions.get(session_id, {})
    
    if not session:
        return jsonify({"error": "Invalid session."}), 400
    
    report = {
        "candidate_name": session.get("name"),
        "role": session.get("role"),
        "experience": session.get("experience"),
        "resume_text": session.get("resume_text"),
        "interview_transcript": session.get("memory", [])
    }
    
    return jsonify(report)

@app.route("/interview/reports/<report_id>", methods=["GET", "OPTIONS"])
def get_report_by_id(report_id):
    """Gets a specific report by ID."""
    if request.method == "OPTIONS":
        # Handle OPTIONS request for CORS preflight
        return "", 204
    
    session = interview_sessions.get(report_id, {})
    
    if not session:
        return jsonify({"error": "Report not found"}), 404
    
    # Create a report with metrics
    report = {
        "_id": report_id,
        "session_id": report_id,
        "user_id": "user123",  # In a real app, get from auth
        "date": time.strftime("%Y-%m-%d"),
        "overall_score": 85,  # In a real app, calculate this
        "role": session.get("role", "Not specified"),
        "technical_metrics": [
            {"name": "Domain Knowledge", "value": 80, "color": "#4CAF50"},
            {"name": "Problem Solving", "value": 85, "color": "#2196F3"},
            {"name": "Technical Skills", "value": 90, "color": "#9C27B0"}
        ],
        "communication_metrics": [
            {"name": "Clarity", "value": 85, "color": "#FF9800"},
            {"name": "Confidence", "value": 80, "color": "#E91E63"},
            {"name": "Articulation", "value": 75, "color": "#3F51B5"}
        ],
        "personality_metrics": [
            {"name": "Cultural Fit", "value": 90, "color": "#009688"},
            {"name": "Adaptability", "value": 85, "color": "#607D8B"},
            {"name": "Leadership", "value": 80, "color": "#795548"}
        ],
        "qa_details": []
    }
    
    # Add Q&A details
    for question, answer in session.get("memory", []):
        if question == "Candidate" or question == "Interviewer":
            report["qa_details"].append({
                "question": answer if question == "Interviewer" else "",
                "answer": answer if question == "Candidate" else "",
                "assessment": "Good answer with clear explanation." if question == "Candidate" else ""
            })
    
    return jsonify({"report": report})

@app.route("/interview/reports", methods=["GET", "OPTIONS"])
def get_all_reports():
    """Gets all reports for the current user."""
    if request.method == "OPTIONS":
        # Handle OPTIONS request for CORS preflight
        return "", 204
    
    # In a real app, you would filter by authenticated user
    reports = []
    
    for session_id, session in interview_sessions.items():
        reports.append({
            "_id": session_id,
            "session_id": session_id,
            "user_id": "user123",  # In a real app, get from auth
            "date": time.strftime("%Y-%m-%d"),
            "overall_score": 85,  # In a real app, calculate this
            "role": session.get("role", "Not specified"),
            "technical_metrics": [
                {"name": "Domain Knowledge", "value": 80, "color": "#4CAF50"},
                {"name": "Problem Solving", "value": 85, "color": "#2196F3"},
                {"name": "Technical Skills", "value": 90, "color": "#9C27B0"}
            ]
        })
    
    return jsonify({"reports": reports})

if __name__ == "__main__":
    app.run(debug=True)
