
from flask import Blueprint, request, jsonify, current_app
from models import InterviewSession, InterviewTemplate, User
from db_config import db, mongo
from datetime import datetime
import json
import os
from bson.objectid import ObjectId
from langchain_groq import ChatGroq
from dotenv import load_dotenv
load_dotenv()
interview_bp = Blueprint('interview', __name__)

# Initialize Groq LLM for report generation
llm = ChatGroq(model="llama3-70b-8192", temperature=0.2, max_retries=2)

@interview_bp.route('/templates', methods=['GET'])
def get_templates():
     templates = InterviewTemplate.query.all()
     return jsonify({
         'templates': [{
             'id': template.id,
             'name': template.name,
             'role': template.role,
             'description': template.description
         } for template in templates]
     }), 200

@interview_bp.route('/start_interview', methods=['POST'])
def start_interview():
     # Use a mock user ID since we removed authentication
     mock_user_id = "mock-user-123"
     data = request.get_json() if request.content_type == 'application/json' else {}
     
     # Handle form data from frontend
     if request.content_type and 'multipart/form-data' in request.content_type:
         data = {
             'name': request.form.get('name'),
             'role': request.form.get('role'), 
             'experience': request.form.get('experience'),
             'resume_text': request.form.get('resume_text')
         }
     
     # Validate input
     if not data.get('name') or not data.get('role'):
         return jsonify({'error': 'Missing name or role'}), 400
     
     # Create new session without template for now
     session = InterviewSession(
         user_id=mock_user_id,
         template_id=None,
         status='active',
         start_time=datetime.utcnow(),
         use_whisper=data.get('use_whisper', False)
     )
     
     db.session.add(session)
     db.session.commit()
     
     first_question = "Hello! Welcome to your AI interview. Please introduce yourself and tell me about your background."
     
     return jsonify({
         'session_id': session.id,
         'first_question': first_question,
         'message': 'Interview session started successfully'
     }), 201

@interview_bp.route('/submit_answer', methods=['POST'])
def submit_answer():
     data = request.get_json()
     
     if not all(k in data for k in ('session_id', 'answer')):
         return jsonify({'error': 'Missing session_id or answer'}), 400
     
     # Get session
     session = InterviewSession.query.get(data['session_id'])
     
     if not session:
         return jsonify({'error': 'Interview session not found'}), 404
     
     if session.status != 'active':
         return jsonify({'error': 'Interview session is not active'}), 400
     
     # Generate next question based on the answer
     next_question = f"That's interesting. Can you tell me more about your experience with {data.get('question', 'technology')}?"
     
     # Save the Q&A pair to MongoDB
     qa_data = {
         'session_id': session.id,
         'question_number': data.get('question_number', 1),
         'question': data.get('question', 'Previous question'),
         'answer': data['answer'],
         'timestamp': datetime.utcnow()
     }
     
     mongo.db.interview_qa.insert_one(qa_data)
     
     # Check if this is the last question (simple logic for now)
     if data.get('is_last_question'):
         session.status = 'completed'
         session.end_time = datetime.utcnow()
         db.session.commit()
         
         # Generate report
         return generate_report(session.id)
     
     return jsonify({
         'next_question': next_question
     }), 200

@interview_bp.route('/end_interview', methods=['POST'])
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

# ... keep existing code (generate_report function and other routes)

@interview_bp.route('/reports', methods=['GET'])
def get_reports():
     # Mock user ID since we removed authentication
     mock_user_id = "mock-user-123"
     
     # Get all reports for mock user
     reports = list(mongo.db.interview_reports.find({"user_id": mock_user_id}))
     
     # Convert ObjectId to string for JSON serialization
     for report in reports:
         report["_id"] = str(report["_id"])
     
     return jsonify({
         "reports": reports
     }), 200

@interview_bp.route('/reports/<report_id>', methods=['GET'])
def get_report_detail(report_id):
     try:
         report = mongo.db.interview_reports.find_one({"_id": ObjectId(report_id)})
     except:
         return jsonify({'error': 'Invalid report ID'}), 400
     
     if not report:
         return jsonify({'error': 'Report not found'}), 404
     
     # Convert ObjectId to string for JSON serialization
     report["_id"] = str(report["_id"])
     
     return jsonify({
         "report": report
     }), 200

@interview_bp.route('/generate-report/<session_id>', methods=['POST'])
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

@interview_bp.route('/compare-candidates/<template_id>', methods=['GET'])
def compare_candidates(template_id):
    """Compare all candidates for a specific job template"""
    # Get template details
    template = InterviewTemplate.query.get(template_id)
    if not template:
        return jsonify({'error': 'Template not found'}), 404
    
    # Get all reports for this template's sessions
    sessions = InterviewSession.query.filter_by(template_id=template_id, status='completed').all()
    session_ids = [session.id for session in sessions]
    
    reports = []
    for session_id in session_ids:
        report = mongo.db.interview_reports.find_one({"session_id": session_id})
        if report:
            report["_id"] = str(report["_id"])
            reports.append(report)
    
    # If no reports, return early
    if not reports:
        return jsonify({'message': 'No completed interviews found for this template'}), 200
    
    # Generate comparison using LLM
    job_description = template.job_description if hasattr(template, 'job_description') else ""
    role = template.role
    
    # Create a summary of each candidate
    candidate_summaries = []
    for report in reports:
        tech_avg = sum(m["value"] for m in report["technical_metrics"]) / len(report["technical_metrics"])
        comm_avg = sum(m["value"] for m in report["communication_metrics"]) / len(report["communication_metrics"])
        pers_avg = sum(m["value"] for m in report["personality_metrics"]) / len(report["personality_metrics"])
        
        summary = {
            "report_id": str(report["_id"]),
            "session_id": report["session_id"],
            "overall_score": report["overall_score"],
            "technical_score": round(tech_avg, 1),
            "communication_score": round(comm_avg, 1),
            "personality_score": round(pers_avg, 1),
            "strengths": [],
            "weaknesses": []
        }
        
        candidate_summaries.append(summary)
    
    # Generate comparison prompt
    comparison_prompt = f"""
    You are an expert recruiter tasked with comparing candidates for a role. Based on the following information:
    
    Role: {role}
    
    Job Description: {job_description}
    
    Candidate Evaluations:
    {json.dumps(candidate_summaries, indent=2)}
    
    Please:
    1. Rank the candidates from best to worst fit for this role.
    2. For each candidate, identify key strengths and weaknesses based on their scores.
    3. Provide a final recommendation on which candidate(s) should be considered for the role.
    
    Format your response as valid JSON with the following structure:
    {{
        "ranked_candidates": [
            {{
                "report_id": "candidate_report_id",
                "rank": 1,
                "strengths": ["strength1", "strength2"],
                "weaknesses": ["weakness1", "weakness2"],
                "recommendation": "Brief recommendation for this candidate"
            }}
        ],
        "overall_recommendation": "Your final recommendation on who to hire and why"
    }}
    """
    
    try:
        # Use LLM to generate comparison
        llm_response = llm.invoke(comparison_prompt)
        llm_content = llm_response.content
        
        # Extract JSON from the response
        import re
        json_match = re.search(r'```json\n(.*?)\n```', llm_content, re.DOTALL)
        if json_match:
            llm_content = json_match.group(1)
        
        # Parse the LLM response
        comparison_result = json.loads(llm_content)
        
        # Add candidate details to results
        for ranked_candidate in comparison_result.get('ranked_candidates', []):
            report_id = ranked_candidate.get('report_id')
            for report in reports:
                if str(report.get('_id')) == report_id:
                    ranked_candidate['overall_score'] = report.get('overall_score')
                    # Add any other details needed
                    break
        
        return jsonify({
            'template': {
                'id': template.id,
                'name': template.name,
                'role': template.role,
                'job_description': job_description
            },
            'comparison': comparison_result,
            'candidates': candidate_summaries,
            'candidate_count': len(reports)
        }), 200
        
    except Exception as e:
        print(f"Error generating candidate comparison: {str(e)}")
        return jsonify({
            'error': 'Failed to generate comparison',
            'template': {
                'id': template.id,
                'name': template.name,
                'role': template.role
            },
            'candidates': candidate_summaries,
            'candidate_count': len(reports)
        }), 500

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
    
    # Get user information (mock user since we removed auth)
    role = "Software Developer"  # Default role
    job_description = ""
    
    # Generate metrics and analysis with LLM
    report_prompt = f"""
    You are an expert interview evaluator. You need to analyze the following interview transcript and generate a structured evaluation report.
    
    Role being applied for: {role}
    
    Job Description: {job_description}
    
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
    
    # Initialize variables with default values
    ai_analysis = None
    overall_score = None
    
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
        "job_description": job_description,
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
