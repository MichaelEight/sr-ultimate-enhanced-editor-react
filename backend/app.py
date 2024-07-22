# backend/app.py
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import zipfile
import io
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Read the file and extract the first line
        content = file.read().decode('utf-8')
        first_line = content.split('\n')[0][:10]

        # Save the content to a temporary file for later use
        file_path = os.path.join(UPLOAD_FOLDER, 'uploaded_file.txt')
        with open(file_path, 'w') as f:
            f.write(content)

        return jsonify({'first_line': first_line}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/process', methods=['POST'])
def process_file():
    try:
        file_path = os.path.join(UPLOAD_FOLDER, 'uploaded_file.txt')
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 400

        with open(file_path, 'a') as f:
            f.write('\nhello world')

        # Create a ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            zip_file.write(file_path, arcname='processed_file.txt')
        
        zip_buffer.seek(0)
        return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name='processed_file.zip')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
