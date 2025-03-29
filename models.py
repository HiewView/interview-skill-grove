
from db_config import db
from datetime import datetime
from flask_jwt_extended import create_access_token
import uuid

# Association table for many-to-many relationship between organizations and templates
org_template_association = db.Table('org_template_association',
    db.Column('organization_id', db.String(36), db.ForeignKey('organization.id')),
    db.Column('template_id', db.String(36), db.ForeignKey('interview_template.id'))
)

class User(db.Model):
    """User model for candidates and organization admins"""
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(120))
    user_type = db.Column(db.String(20), nullable=False)  # 'candidate', 'org_admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    organization_id = db.Column(db.String(36), db.ForeignKey('organization.id'))
    interviews = db.relationship('InterviewSession', backref='candidate', lazy=True)
    
    def generate_token(self):
        """Generate JWT token for the user"""
        return create_access_token(identity=self.id)

class Organization(db.Model):
    """Organization model for universities, companies, etc."""
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='organization', lazy=True)
    templates = db.relationship('InterviewTemplate', 
                               secondary=org_template_association,
                               backref=db.backref('organizations', lazy='dynamic'))

class InterviewTemplate(db.Model):
    """Template for interview configurations"""
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    rules = db.Column(db.Text)
    questions = db.Column(db.Text)  # Stored as JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sessions = db.relationship('InterviewSession', backref='template', lazy=True)

class InterviewSession(db.Model):
    """Record of an interview session"""
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    template_id = db.Column(db.String(36), db.ForeignKey('interview_template.id'))
    status = db.Column(db.String(20), default='pending')  # pending, active, completed
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    score = db.Column(db.Float)  # Overall score
    use_whisper = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Note: Detailed report data will be stored in MongoDB using this ID as reference
