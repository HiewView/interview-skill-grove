
from flask import Blueprint, request, jsonify, current_app
from models import User, Organization
from db_config import db, bcrypt, jwt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == "OPTIONS":
        # Handle OPTIONS request for CORS preflight
        return "", 204
        
    data = request.get_json()
    
    # Check if required fields are present
    if not all(k in data for k in ('email', 'password', 'user_type')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Hash password
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Create new user
    new_user = User(
        email=data['email'],
        password_hash=password_hash,
        name=data.get('name', ''),
        user_type=data['user_type']
    )
    
    # If user is an org_admin, create or link organization
    if data['user_type'] == 'org_admin' and 'organization' in data:
        org_name = data['organization']
        org = Organization.query.filter_by(name=org_name).first()
        
        if not org:
            org = Organization(name=org_name)
            db.session.add(org)
            db.session.commit()
        
        new_user.organization_id = org.id
    
    # Save user to database
    db.session.add(new_user)
    db.session.commit()
    
    # Generate token
    # Create access token with 1 day expiry
    expires = timedelta(days=1)
    access_token = create_access_token(identity=str(new_user.id), expires_delta=expires)
    
    return jsonify({
        'message': 'User registered successfully',
        'token': access_token,
        'user': {
            'id': new_user.id,
            'email': new_user.email,
            'name': new_user.name,
            'user_type': new_user.user_type
        }
    }), 201

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == "OPTIONS":
        # Handle OPTIONS request for CORS preflight
        return "", 204
        
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Invalid content type or missing request body'}), 400
    
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        # Create access token with 1 day expiry
        expires = timedelta(days=1)
        access_token = create_access_token(identity=str(user.id), expires_delta=expires)
        
        # Get organization details if user belongs to one
        org_data = None
        if user.organization_id:
            org = Organization.query.get(user.organization_id)
            if org:
                org_data = {
                    'id': org.id,
                    'name': org.name
                }
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'user_type': user.user_type,
                'organization': org_data
            }
        }), 200
    
    return jsonify({'error': 'Invalid email or password'}), 401

@auth_bp.route('/profile', methods=['GET', 'OPTIONS'])
@jwt_required()
def profile():
    if request.method == "OPTIONS":
        # Handle OPTIONS request for CORS preflight
        return "", 204
        
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get organization details if user belongs to one
    org_data = None
    if user.organization_id:
        org = Organization.query.get(user.organization_id)
        if org:
            org_data = {
                'id': org.id,
                'name': org.name
            }
    
    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'user_type': user.user_type,
            'organization': org_data
        }
    }), 200
