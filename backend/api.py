from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase
from firebase_configure import firebaseConfig
import os
from werkzeug.utils import secure_filename
import uuid
from datetime import date
import cv2
import numpy as np

# Initialize Firebase and Flask
app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": "*",
            "supports_credentials": True,
            "Access-Control-Allow-Credentials": True,
        }
    },
)
firebase_app = firebase.initialize_app(firebaseConfig)

auth = firebase_app.auth()
db = firebase_app.database()
storage = firebase_app.storage()

# Configure upload settings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
ALLOWED_EXTENSIONS_EDIT = {'png', 'jpg', 'jpeg'}
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
  os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
  return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def allowed_file_to_edit(filename):
  return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_EDIT

# Authentication routes
@app.route('/api/signup', methods=['POST'])
def signup():
  try:
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    user_name = data.get('user_name')
    user_birth = data.get('user_birth')
    
    # Create user in Firebase
    user = auth.create_user_with_email_and_password(email, password)
    
    # Store user data in database
    user_data = {
      "name": name,
      "email": email,
      "user_name": user_name,
      "user_birth": user_birth,
    }
    db.child("users").child(user['localId']).set(user_data)
    
    return jsonify({
      'message': 'Successfully created user',
      'userId': user['localId']
    }), 201
      
  except Exception as e:
    return jsonify({'error': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
  print("Attempting to login")
  try:
    data = request.get_json()
    print(data)
    email = data.get('email')
    password = data.get('password')
    
    # Firebase auth
    user = auth.sign_in_with_email_and_password(email, password)
    
    user_data = db.child("users").child(user['localId']).get().val()
    print("Sending user data...")
    print()
    return jsonify({
      'message': 'Successfully logged in',
      'userId': user['localId'],
      'idToken': user['idToken'],
      'userData': user_data
    }), 200
      
  except Exception as e:
    return jsonify({'error': str(e)}), 400
  
# Verificación de username en uso
@app.route('/api/check-username', methods=['POST'])
def check_username():
  try:
    print("Checking username...")
    data = request.get_json()
    user_name = data.get('user_name')
    # Buscar en la base de datos usuarios con ese user_name
    users = db.child("users").get()

    # Recorre los usuarios y verifica si alguno tiene el mismo user_name
    for user in users.each():
        if user.val().get("user_name") == user_name:
            return jsonify({'exists': True}), 200  # Nombre de usuario ya en uso

    return jsonify({'exists': False}), 200  # Regresa si el usuario existe
  except Exception as e:
    return jsonify({'error': str(e)}), 500


# Image upload route
@app.route('/api/upload', methods=['POST'])
def upload_image():
  try:
    print("Requesting image upload")
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
    print("File found")
        
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
        "likes": 0,
        "public":"true"
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

# Change image's privacy
@app.route('/api/images/<image_id>/toggle-privacy', methods=['PATCH'])
def toggle_image_privacy(image_id):
  try:
    # Verify token
    token = request.headers.get('Authorization')
    if not token:
      return jsonify({'error': 'No token provided'}), 401

    user = auth.get_account_info(token)
    user_id = user['users'][0]['localId']

    # Obtener datos actuales de la imagen
    image_ref = db.child("images").child(image_id).get(token)
    image_data = image_ref.val()

    if not image_data:
      return jsonify({'error': 'Image not found'}), 404

    # Cambiar el estado de 'public'
    new_privacy_status = "false" if image_data.get("public") == "true" else "true"
    db.child("images").child(image_id).update({"public": new_privacy_status}, token)

    return jsonify({
      'message': f'Image privacy updated to {"Public" if new_privacy_status == "true" else "Private"}',
      'imageId': image_id,
      'public': new_privacy_status
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

@app.route('/api/images/<image_id>/delete', methods=['DELETE'])
def delete_image(image_id):
  try:
    # Verify token
    token = request.headers.get('Authorization')
    if not token:
      return jsonify({'error': 'No token provided'}), 401

    # Authenticate user
    user = auth.get_account_info(token)
    user_id = user['users'][0]['localId']

    # Fetch image details
    image_ref = db.child("images").child(image_id).get(token)
    image_data = image_ref.val()

    if not image_data:
      return jsonify({'error': 'Image not found'}), 404

    # Extract the storage path from the image URL
    storage_path = image_data.get("url").split("o/")[-1].split("?")[0].replace("%2F", "/")

    # Delete the image from Firebase Storage
    storage.child(storage_path).delete()

    # Remove the image data from the 'images' table
    db.child("images").child(image_id).remove()

    # Remove the image reference from the user's images
    db.child("users").child(user_id).child("images").child(image_id).remove()

    return jsonify({
      'message': 'Image deleted successfully',
      'imageId': image_id
    }), 200

  except Exception as e:
    return jsonify({'error': str(e)}), 500

# Get image by id
@app.route('/api/images/<image_id>', methods=['Get'])
def get_image(image_id):
  try:
    token = request.headers.get('Authorization')
    if not token:
      return jsonify({'error': 'No token provided'}), 401

    # Fetch image details
    image_ref = db.child("images").child(image_id).get(token)
    image_data = image_ref.val()

    return jsonify({
      'image': image_data
    }), 200
  except Exception as e:
    return jsonify({'error': str(e)}), 500

# Image edition route
@app.route('/api/images/<image_id>/edit', methods=['POST'])
def edit_image(image_id):
  try:
    print("Requesting image edition")
    # Verify token
    token = request.headers.get('Authorization')
    if not token:
      return jsonify({'error': 'No token provided'}), 401

    user = auth.get_account_info(token)
    user_id = user['users'][0]['localId']

    data = request.json
    action = data.get('action')

    # Fetch image details
    image_ref = db.child("images").child(image_id).get(token)
    image_data = image_ref.val()

    if not image_data:
      return jsonify({'error': 'Image not found'}), 404

    storage_path = image_data['url'].split("o/")[-1].split("?")[0].replace("%2F", "/")
    temp_path = os.path.join(UPLOAD_FOLDER, image_data['filename'])

    storage.child(storage_path).download(temp_path)

    # space to edit image
    image = cv2.imread(temp_path)

    if action == 'sharp':
      alpha = 1.5
      beta = 50
      image = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    elif action == 'b-c':
      kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
      image = cv2.filter2D(image, -1, kernel)
    elif action == 'blur':
      image = cv2.medianBlur(image, 17)

    print(f'Image {image_data['filename']} processed')

    # Guardar la imagen editada
    name = image_data['filename'].split(".")
    edited_filename = f"{name[0]}-{action}.{name[1]}"
    edited_path = os.path.join(UPLOAD_FOLDER, edited_filename)
    cv2.imwrite(f'{edited_path}', image)


    # Subir la nueva imagen a Firebase
    edited_storage_path = f"images/{user_id}/{edited_filename}"
    storage.child(edited_storage_path).put(edited_path, token)
    print("New Image uploaded")

    # Obtener la URL de la nueva imagen
    edited_url = storage.child(edited_storage_path).get_url(token)

    # Save image info in database
    image_data = {
      "url": edited_url,
      "filename": edited_filename,
      "uploadedAt": date.today().isoformat(),
      "likes": 0,
      "public":"false"
    }

    # Actualizar la base de datos con la nueva imagen
    image_ref = db.child("images").push(image_data, token)

    # Add image reference to user's images
    db.child("users").child(user_id).child("images").child(image_ref['name']).set(True, token)

    # Limpiar archivos temporales
    os.remove(temp_path)
    os.remove(edited_path)

    return jsonify({
      'message': 'Image edited successfully',
      'url': edited_url,
      'imageId': image_ref['name']
    }), 200
  except Exception as e:
    return jsonify({'error': str(e)}), 500


@app.route('/api/about', methods=['GET'])
def show():
  return jsonify({'message': 'Hello there!'})
  
  
@app.route('/api/images/gallery', methods=['GET'])
def get_public_images():
    try:
        all_images = db.child("images").get()
        public_images = []

        if all_images and all_images.each():
            for image in all_images.each():
                image_data = image.val()
                if image_data.get("public") == True:
                    image_data["id"] = image.key()
                    public_images.append(image_data)

        return jsonify({'images': public_images}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
  app.run(debug=True)