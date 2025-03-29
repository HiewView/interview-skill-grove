
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

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load FastWhisper Model
whisper_model = WhisperModel("small", device="cpu", compute_type="int8")

# Load Groq LLM
llm = ChatGroq(model="llama3-70b-8192", temperature=0.2, max_retries=2)

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

@app.route("/start_interview", methods=["POST"])
def start_interview():
    """Initializes interview session."""
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

@app.route("/submit_answer", methods=["POST"])
def submit_answer():
    """Handles answer submission and generates next question."""
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

@app.route("/transcribe", methods=["POST"])
def transcribe():
    """Transcribes audio using Whisper model."""
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

@app.route("/generate_report", methods=["GET"])
def generate_report():
    """Generates interview summary report."""
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

@app.route("/interview/reports/<report_id>", methods=["GET"])
def get_report_by_id(report_id):
    """Gets a specific report by ID."""
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

@app.route("/interview/reports", methods=["GET"])
def get_all_reports():
    """Gets all reports for the current user."""
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
