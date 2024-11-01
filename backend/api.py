from flask import Flask, request, jsonify
import firebase
from firebase_configure import firebaseConfig
import os
from werkzeug.utils import secure_filename
import uuid
from datetime import date

# Initialize Firebase and Flask
app = Flask(__name__)
firebase_app = firebase.initialize_app(firebaseConfig)

auth = firebase_app.auth()
db = firebase_app.database()
storage = firebase_app.storage()

# Configure upload settings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
  os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
  return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS 

# Authentication routes
@app.route('/api/signup', methods=['POST'])
def signup():
  try:
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    # Create user in Firebase
    user = auth.create_user_with_email_and_password(email, password)
    
    # Store user data in database
    user_data = {
      "name": name,
      "email": email
    }
    db.child("users").child(user['localId']).set(user_data, user['idToken'])
    
    return jsonify({
      'message': 'Successfully created user',
      'userId': user['localId']
    }), 201
      
  except Exception as e:
    return jsonify({'error': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
  try:
    data = request.get_json()
    print(data)
    email = data.get('email')
    password = data.get('password')
    
    # Firebase auth
    user = auth.sign_in_with_email_and_password(email, password)
    
    return jsonify({
      'message': 'Successfully logged in',
      'userId': user['localId'],
      'idToken': user['idToken']
    }), 200
      
  except Exception as e:
    return jsonify({'error': str(e)}), 400

# Image upload route
@app.route('/api/upload', methods=['POST'])
def upload_image():
  try:
    # Verify token
    token = request.headers.get('Authorization')
    if not token:
      return jsonify({'error': 'No token provided'}), 401
        
    user = auth.get_account_info(token)
    user_id = user['users'][0]['localId']
    
    if 'file' not in request.files:
      return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
      return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
      # Create unique filename
      filename = secure_filename(file.filename)
      unique_filename = f"{uuid.uuid4()}_{filename}"
      
      # Save file temporarily
      temp_path = os.path.join(UPLOAD_FOLDER, unique_filename)
      file.save(temp_path)
      
      # Upload to Firebase Storage
      storage_path = f"images/{user_id}/{unique_filename}"
      storage.child(storage_path).put(temp_path, token)
      
      # Get the URL of the uploaded file
      image_url = storage.child(storage_path).get_url(token)
      
      # Save image info in database
      image_data = {
        "url": image_url,
        "filename": unique_filename,
        "uploadedAt": date.today().isoformat(),
        "likes": 0
      }
      
      image_ref = db.child("images").push(image_data, token)
      
      # Add image reference to user's images
      db.child("users").child(user_id).child("images").child(image_ref['name']).set(True, token)
      
      # Clean up temp file
      os.remove(temp_path)
      
      return jsonify({
        'message': 'File uploaded successfully',
        'url': image_url,
        'imageId': image_ref['name']
      }), 200
        
  except Exception as e:
    return jsonify({'error': str(e)}), 500

# Like/Unlike image route
@app.route('/api/images/<image_id>/like', methods=['POST'])
def like_image(image_id):
  try:
    # Verify token
    token = request.headers.get('Authorization')
    if not token:
      return jsonify({'error': 'No token provided'}), 401
        
    user = auth.get_account_info(token)
    user_id = user['users'][0]['localId']
    
    # Check if user already liked the image
    likes = db.child("likes").child(image_id).child(user_id).get(token)
    
    if likes.val():
      # Unlike
      db.child("likes").child(image_id).child(user_id).remove(token)
      # Decrease like count
      db.child("images").child(image_id).child("likes").set(
        db.child("images").child(image_id).child("likes").get(token).val() - 1,
        token
      )
      action = "unliked"
    else:
      # Like
      db.child("likes").child(image_id).child(user_id).set(True, token)
      # Increase like count
      db.child("images").child(image_id).child("likes").set(
        db.child("images").child(image_id).child("likes").get(token).val() + 1,
        token
      )
      action = "liked"
        
    return jsonify({
      'message': f'Successfully {action} image',
      'imageId': image_id
    }), 200
      
  except Exception as e:
    return jsonify({'error': str(e)}), 500

# Get user's images
@app.route('/api/users/<user_id>/images', methods=['GET'])
def get_user_images(user_id):
  try:
    # Verify token
    token = request.headers.get('Authorization')
    if not token:
      return jsonify({'error': 'No token provided'}), 401
        
    # Get user's image references
    user_images = db.child("users").child(user_id).child("images").get(token)
    
    images = []
    if user_images.val():
      for image_id in user_images.val():
        image_data = db.child("images").child(image_id).get(token).val()
        image_data['id'] = image_id
        images.append(image_data)
            
    return jsonify({
      'images': images
    }), 200
      
  except Exception as e:
    return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
  app.run(debug=True)