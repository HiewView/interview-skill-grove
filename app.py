
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
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], 
                    "allow_headers": ["Content-Type", "Authorization", "Accept"]}},
     supports_credentials=True)

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
api_key = os.getenv('GROQ_API_KEY', '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')
llm = ChatGroq(api_key=api_key, model="llama3-70b-8192", temperature=0.2, max_retries=2)

# EdgeTTS voice selection
VOICE = "en-US-JennyNeural"

interview_sessions = {}

# Helper functions
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

# Add direct endpoint for ending interview (matches the client endpoint)
@app.route("/interview/end_interview", methods=["POST", "OPTIONS"])
def end_interview():
    """End interview and generate report."""
    if request.method == "OPTIONS":
        # Handle OPTIONS request for CORS preflight
        return "", 204
        
    data = request.get_json()
    if not data or not data.get("session_id"):
        return jsonify({"error": "Missing session_id"}), 400
        
    session_id = data.get("session_id")
    session = interview_sessions.get(session_id)
    
    if not session:
        return jsonify({"error": "Invalid session"}), 404
        
    # Generate a simple report without using MongoDB
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
            "_id": f"report-{session_id}",
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

@app.route("/interview/reports/<report_id>", methods=["GET", "OPTIONS"])
def get_report_by_id(report_id):
    """Gets a specific report by ID."""
    if request.method == "OPTIONS":
        # Handle OPTIONS request for CORS preflight
        return "", 204
    
    # Extract session_id from report_id
    session_id = report_id.replace("report-", "") if report_id.startswith("report-") else report_id
    session = interview_sessions.get(session_id, {})
    
    if not session:
        return jsonify({"error": "Report not found"}), 404
    
    # Create a report with metrics
    report = {
        "_id": report_id,
        "session_id": session_id,
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
    memory = session.get("memory", [])
    for i in range(0, len(memory), 2):
        if i+1 < len(memory):
            report["qa_details"].append({
                "question": memory[i][1] if memory[i][0] == "Interviewer" else memory[i+1][1],
                "answer": memory[i+1][1] if memory[i+1][0] == "Candidate" else memory[i][1],
                "assessment": "Good answer with clear explanation."
            })
    
    return jsonify({"report": report})

if __name__ == "__main__":
    app.run(debug=True)
