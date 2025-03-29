
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from db_config import init_db
from auth_routes import auth_bp
from interview_routes import interview_bp

app = Flask(__name__)
CORS(app)

# Configure application
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize database
init_db(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(interview_bp, url_prefix='/interview')

# Retain your existing routes
@app.route('/start_interview', methods=['POST'])
def start_interview():
    data = request.get_json()
    # Your existing implementation...

@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    data = request.get_json()
    # Your existing implementation...

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Your existing implementation...

if __name__ == '__main__':
    app.run(debug=True)
