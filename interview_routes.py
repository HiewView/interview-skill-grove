
from flask import Blueprint, request, jsonify
from models import InterviewSession, InterviewTemplate, User
from db_config import db, mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json
from bson.objectid import ObjectId

interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/templates', methods=['GET'])
@jwt_required()
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
@jwt_required()
def start_interview():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    if not data.get('template_id') and not all(k in data for k in ('role', 'experience')):
        return jsonify({'error': 'Missing template_id or role/experience details'}), 400
    
    # Create new session
    session = InterviewSession(
        user_id=current_user_id,
        template_id=data.get('template_id'),
        status='active',
        start_time=datetime.utcnow(),
        use_whisper=data.get('use_whisper', False)
    )
    
    db.session.add(session)
    db.session.commit()
    
    # If no template is provided, use custom parameters
    if not data.get('template_id'):
        # This would call your existing interview generation logic
        first_question = "Tell me about yourself and your experience in this role."
    else:
        template = InterviewTemplate.query.get(data['template_id'])
        questions = json.loads(template.questions)
        first_question = questions[0] if questions else "Tell me about yourself."
    
    return jsonify({
        'session_id': session.id,
        'first_question': first_question,
        'message': 'Interview session started successfully'
    }), 201

@interview_bp.route('/submit_answer', methods=['POST'])
@jwt_required()
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
    
    # This would call your existing interview question generation logic
    next_question = "What are your strengths and weaknesses?"
    
    # Save the Q&A pair to MongoDB
    qa_data = {
        'session_id': session.id,
        'question_number': data.get('question_number', 1),
        'question': data.get('question', 'Previous question'),
        'answer': data['answer'],
        'timestamp': datetime.utcnow()
    }
    
    mongo.db.interview_qa.insert_one(qa_data)
    
    # Check if this is the last question
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
    
    # Calculate metrics (in a real app, this would be more sophisticated)
    qa_count = len(qa_records)
    avg_answer_length = sum(len(qa['answer']) for qa in qa_records) / qa_count if qa_count > 0 else 0
    
    # Sample metrics - in a real app, you'd use AI to analyze answers
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
    
    # Calculate overall score
    all_metrics = technical_metrics + communication_metrics + personality_metrics
    overall_score = sum(metric["value"] for metric in all_metrics) / len(all_metrics)
    
    # Store report in MongoDB
    report_data = {
        "session_id": session_id,
        "user_id": session.user_id,
        "date": datetime.utcnow(),
        "overall_score": overall_score,
        "technical_metrics": technical_metrics,
        "communication_metrics": communication_metrics,
        "personality_metrics": personality_metrics,
        "qa_details": [
            {
                "question": qa["question"],
                "answer": qa["answer"],
                "assessment": "Strong understanding and clear communication" # Placeholder
            } for qa in qa_records
        ]
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
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get report list based on user type
    if user.user_type == 'org_admin':
        # For org admins, get all reports from their organization's users
        org_users = User.query.filter_by(organization_id=user.organization_id).all()
        user_ids = [u.id for u in org_users]
        reports = list(mongo.db.interview_reports.find({"user_id": {"$in": user_ids}}))
    else:
        # For candidates, get only their reports
        reports = list(mongo.db.interview_reports.find({"user_id": current_user_id}))
    
    # Convert ObjectId to string for JSON serialization
    for report in reports:
        report["_id"] = str(report["_id"])
    
    return jsonify({
        "reports": reports
    }), 200

@interview_bp.route('/reports/<report_id>', methods=['GET'])
@jwt_required()
def get_report_detail(report_id):
    try:
        report = mongo.db.interview_reports.find_one({"_id": ObjectId(report_id)})
    except:
        return jsonify({'error': 'Invalid report ID'}), 400
    
    if not report:
        return jsonify({'error': 'Report not found'}), 404
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user has access to this report
    if user.user_type != 'org_admin' and report['user_id'] != current_user_id:
        return jsonify({'error': 'You do not have permission to view this report'}), 403
    
    # Convert ObjectId to string for JSON serialization
    report["_id"] = str(report["_id"])
    
    return jsonify({
        "report": report
    }), 200
