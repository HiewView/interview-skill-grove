
from flask_sqlalchemy import SQLAlchemy
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
import os

# Initialize extensions
db = SQLAlchemy()  # For structured data (users, organizations, interview sessions)
mongo = PyMongo()  # For non-structured data (detailed interview reports)
bcrypt = Bcrypt()  # For password hashing
jwt = JWTManager()  # For JWT authentication

def init_db(app):
    """Initialize all database connections and authentication tools"""
    # Configure SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///interview_app.db'  # SQLite for development
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure MongoDB - But make it optional
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/interview_reports')
    app.config['MONGO_URI'] = mongodb_uri
    app.config['MONGO_CONNECT'] = False  # Don't connect automatically - we'll handle errors gracefully
    
    # Configure JWT
    app.config['JWT_SECRET_KEY'] = app.config.get('SECRET_KEY', 'dev-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 24 * 3600  # 24 hours
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    
    # Initialize extensions with app
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Initialize MongoDB but don't fail if unavailable
    try:
        mongo.init_app(app)
        print("MongoDB connected successfully")
    except Exception as e:
        print(f"MongoDB not available: {e}. Continuing without MongoDB...")
    
    # Create all tables in SQLite if they don't exist
    with app.app_context():
        db.create_all()
