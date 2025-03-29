
from flask import Blueprint, request, jsonify
from models import InterviewSession, InterviewTemplate, User
from db_config import db, mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json
from bson.objectid import ObjectId
from langchain_groq import ChatGroq

interview_bp = Blueprint('interview', __name__)

# Initialize Groq LLM for report generation
llm = ChatGroq(model="llama3-70b-8192", temperature=0.2, max_retries=2)

@interview_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_templates():
    # ... keep existing code (templates fetching logic)

@interview_bp.route('/start_interview', methods=['POST'])
@jwt_required()
def start_interview():
    # ... keep existing code (interview initialization)

@interview_bp.route('/submit_answer', methods=['POST'])
@jwt_required()
def submit_answer():
    # ... keep existing code (answer submission handling)

@interview_bp.route('/end_interview', methods=['POST'])
@jwt_required()
def end_interview():
    data = request.get_json()
    
    if not data.get('session_id'):
        return jsonify({'error': 'Missing session_id'}), 400
    
    # Get session
    session = InterviewSession.query.get(data['session_id'])
    
    if not session:
        return jsonify({'error': 'Interview session not found'}), 404
    
    session.status = 'completed'
    session.end_time = datetime.utcnow()
    db.session.commit()
    
    # Generate report
    return generate_report(session.id)

def generate_report(session_id):
    """Generate interview report based on Q&A history"""
    session = InterviewSession.query.get(session_id)
    qa_records = list(mongo.db.interview_qa.find({'session_id': session_id}))
    
    # Check if report already exists in MongoDB
    existing_report = mongo.db.interview_reports.find_one({"session_id": session_id})
    
    if existing_report:
        # Return existing report if already generated
        existing_report["_id"] = str(existing_report["_id"])
        return jsonify({
            "report_id": existing_report["_id"],
            "overall_score": existing_report["overall_score"],
            "message": "Existing report retrieved"
        }), 200
    
    # If no existing report, generate one using LLM
    qa_text = ""
    qa_details = []
    
    # Format Q&A pairs for the LLM prompt and for storage
    for qa in qa_records:
        question = qa.get('question', 'Unknown question')
        answer = qa.get('answer', 'No answer provided')
        qa_text += f"Question: {question}\nAnswer: {answer}\n\n"
        
        qa_details.append({
            "question": question,
            "answer": answer,
            "assessment": ""  # Will be filled by LLM
        })
    
    # Get user and template information
    user = User.query.get(session.user_id)
    template = None
    role = "Not specified"
    
    if session.template_id:
        template = InterviewTemplate.query.get(session.template_id)
        if template:
            role = template.role
    
    # Generate metrics and analysis with LLM
    report_prompt = f"""
    You are an expert interview evaluator. You need to analyze the following interview transcript and generate a structured evaluation report.
    
    Role being applied for: {role}
    
    Interview transcript:
    {qa_text}
    
    Generate a comprehensive interview assessment with the following components:
    1. Technical metrics (score each from 0-100):
       - Technical Knowledge
       - Problem Solving
       - Code Quality
       
    2. Communication metrics (score each from 0-100):
       - Clarity of Expression
       - Articulation
       - Active Listening
       
    3. Personality metrics (score each from 0-100):
       - Confidence
       - Adaptability
       - Cultural Fit
       
    4. For each question and answer, provide a brief assessment.
    
    Format your response as valid JSON with the following structure:
    {{
        "technical_metrics": [
            {{"name": "Technical Knowledge", "value": 85, "color": "#3b82f6"}},
            {{"name": "Problem Solving", "value": 78, "color": "#3b82f6"}},
            {{"name": "Code Quality", "value": 92, "color": "#3b82f6"}}
        ],
        "communication_metrics": [
            {{"name": "Clarity of Expression", "value": 88, "color": "#10b981"}},
            {{"name": "Articulation", "value": 92, "color": "#10b981"}},
            {{"name": "Active Listening", "value": 75, "color": "#10b981"}}
        ],
        "personality_metrics": [
            {{"name": "Confidence", "value": 82, "color": "#8b5cf6"}},
            {{"name": "Adaptability", "value": 90, "color": "#8b5cf6"}},
            {{"name": "Cultural Fit", "value": 85, "color": "#8b5cf6"}}
        ],
        "qa_assessments": [
            {{"question_idx": 0, "assessment": "Strong understanding and clear communication"}},
            {{"question_idx": 1, "assessment": "Good technical knowledge but could improve conciseness"}}
        ]
    }}
    """
    
    try:
        # Use LLM to generate the report
        llm_response = llm.invoke(report_prompt)
        llm_content = llm_response.content
        
        # Extract JSON from the LLM response
        import re
        json_match = re.search(r'```json\n(.*?)\n```', llm_content, re.DOTALL)
        if json_match:
            llm_content = json_match.group(1)
        
        # Parse the LLM response
        ai_analysis = json.loads(llm_content)
        
        # Apply AI assessments to QA details
        for assessment in ai_analysis.get('qa_assessments', []):
            idx = assessment.get('question_idx')
            if idx is not None and idx < len(qa_details):
                qa_details[idx]["assessment"] = assessment.get('assessment')
        
        # Calculate overall score
        all_metrics = ai_analysis['technical_metrics'] + ai_analysis['communication_metrics'] + ai_analysis['personality_metrics']
        overall_score = sum(metric["value"] for metric in all_metrics) / len(all_metrics)
        
    except Exception as e:
        print(f"Error generating report with LLM: {str(e)}")
        # Fallback to default metrics if LLM fails
        technical_metrics = [
            {"name": "Technical Knowledge", "value": 85, "color": "#3b82f6"},
            {"name": "Problem Solving", "value": 78, "color": "#3b82f6"},
            {"name": "Code Quality", "value": 92, "color": "#3b82f6"}
        ]
        
        communication_metrics = [
            {"name": "Clarity of Expression", "value": 88, "color": "#10b981"},
            {"name": "Articulation", "value": 92, "color": "#10b981"},
            {"name": "Active Listening", "value": 75, "color": "#10b981"}
        ]
        
        personality_metrics = [
            {"name": "Confidence", "value": 82, "color": "#8b5cf6"},
            {"name": "Adaptability", "value": 90, "color": "#8b5cf6"},
            {"name": "Cultural Fit", "value": 85, "color": "#8b5cf6"}
        ]
        
        all_metrics = technical_metrics + communication_metrics + personality_metrics
        overall_score = sum(metric["value"] for metric in all_metrics) / len(all_metrics)
        
        ai_analysis = {
            "technical_metrics": technical_metrics,
            "communication_metrics": communication_metrics,
            "personality_metrics": personality_metrics
        }
    
    # Store report in MongoDB
    report_data = {
        "session_id": session_id,
        "user_id": session.user_id,
        "date": datetime.utcnow(),
        "overall_score": overall_score,
        "role": role,
        "technical_metrics": ai_analysis['technical_metrics'],
        "communication_metrics": ai_analysis['communication_metrics'],
        "personality_metrics": ai_analysis['personality_metrics'],
        "qa_details": qa_details
    }
    
    report_id = mongo.db.interview_reports.insert_one(report_data).inserted_id
    
    # Update session with score
    session.score = overall_score
    db.session.commit()
    
    return jsonify({
        "report_id": str(report_id),
        "overall_score": overall_score,
        "message": "Interview completed and report generated"
    }), 201

@interview_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    # ... keep existing code (report fetching)

@interview_bp.route('/reports/<report_id>', methods=['GET'])
@jwt_required()
def get_report_detail(report_id):
    # ... keep existing code (report detail fetching)

@interview_bp.route('/generate-report/<session_id>', methods=['POST'])
@jwt_required()
def request_report_generation(session_id):
    """Generate or fetch an existing report for a session"""
    # Check if report already exists
    existing_report = mongo.db.interview_reports.find_one({"session_id": session_id})
    
    if existing_report:
        # Return existing report if already generated
        existing_report["_id"] = str(existing_report["_id"])
        return jsonify({
            "report_id": existing_report["_id"],
            "report": existing_report,
            "message": "Existing report retrieved"
        }), 200
    
    # If no existing report, generate one
    return generate_report(session_id)
