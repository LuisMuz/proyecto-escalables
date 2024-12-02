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
    role = data.get('role', 'user')
    
    # Create user in Firebase
    user = auth.create_user_with_email_and_password(email, password)
    
    # Store user data in database
    user_data = {
      "name": name,
      "email": email,
      "user_name": user_name,
      "user_birth": user_birth,
      "role": role
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
    return jsonify({'error': "Invalid email or password"}), 400
  
# Verificación de username en uso
@app.route('/api/check-username', methods=['POST'])
def check_username():
  try:
    print("Checking username...")
    data = request.get_json()
    user_name = data.get('user_name')
    users = db.child("users").get()

    for user in users.each():
        if user.val().get("user_name") == user_name:
            return jsonify({'exists': True}), 200

    return jsonify({'exists': False}), 200
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
    print("user likes")
    
    # Check if user already liked the image
    likes = db.child("likes").child(image_id).child(user_id).get(token)
    likes_image = db.child("images").child(image_id).child("likes").get().val()

    if likes.val():
      # Unlike
      db.child("likes").child(image_id).child(user_id).remove()
      # Decrease like count
      db.child("images").child(image_id).child("likes").set(likes_image - 1)
      action = "unliked"
    else:
      # Like
      db.child("likes").child(image_id).child(user_id).set(True)
      # Increase like count
      db.child("images").child(image_id).child("likes").set(likes_image + 1)
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
    private_images = 0
    public_images = 0
    
    if user_images.val():
      for image_id in user_images.val():
        image_data = db.child("images").child(image_id).get(token).val()
        image_data['id'] = image_id
        images.append(image_data)
        
        # Count public and private images
        if image_data.get("public") == "true":
          public_images += 1
        else:
          private_images += 1

    return jsonify({
      'images': images,
      'counts': {
        'privateImages': private_images,
        'publicImages': public_images
      }
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
        # Verify token
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        # Get the logged-in user's ID
        user = auth.get_account_info(token)
        current_user_id = user['users'][0]['localId']
        
        # Fetch all images
        all_images = db.child("images").get()
        public_images = []

        if all_images and all_images.each():
            for image in all_images.each():
                image_data = image.val()
                if image_data.get("public") == "true":  # Ensure image is public
                  
                    # Fetch the user who owns this image
                    owner = None
                    users = db.child("users").get()
                    for user_entry in users.each():
                        user_images = user_entry.val().get("images", {})
                        if image.key() in user_images:
                            owner = user_entry.key()
                            break
                    
                    # Exclude images from the current user
                    if owner and owner != current_user_id:
                        image_data["id"] = image.key()
                        image_data["user_id"] = owner
                        image_data["user_name"] = db.child("users").child(owner).child("user_name").get().val()
                        public_images.append(image_data)
        
        return jsonify({'images': public_images}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
      
      
@app.route('/api/images/guest', methods=['GET'])
def get_public_images_guest():
    try:        
        # Obtener todas las imágenes de la base de datos
        all_images = db.child("images").get()
        public_images = []

        # Filtrar las imágenes públicas
        if all_images and all_images.each():
            for image in all_images.each():
                image_data = image.val()
                if image_data.get("public") == "true":  # Verificar si la imagen es pública
                    # Buscar el usuario propietario de la imagen
                    owner_id = None
                    users = db.child("users").get()
                    for user_entry in users.each():
                        user_images = user_entry.val().get("images", {})
                        if image.key() in user_images:
                            owner_id = user_entry.key()
                            break
                    
                    # Si encontramos al propietario, agregar su nombre de usuario
                    if owner_id:
                        owner_username = db.child("users").child(owner_id).child("user_name").get().val()
                        image_data["user_id"] = owner_id
                        image_data["user_name"] = owner_username  # Agregar el username del propietario
                    
                    # Agregar la imagen a la lista de imágenes públicas
                    image_data["id"] = image.key()  # Agregar el ID de la imagen
                    public_images.append(image_data)


        # Devolver las imágenes públicas en formato JSON
        return jsonify({'images': public_images}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/images/<image_id>/info', methods=['GET'])
def get_image_details(image_id):
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        image_data = db.child("images").child(image_id).get(token).val()
        if not image_data:
            return jsonify({'error': 'Image not found'}), 404

        user = auth.get_account_info(token)
        user_id = user['users'][0]['localId']

        liked_by_user = db.child("likes").child(image_id).child(user_id).get(token).val()

        owner = None
        users = db.child("users").get()
        for user_entry in users.each():
            user_images = user_entry.val().get("images", {})
            if image_id in user_images:
                owner = user_entry.key()
                break

        if owner:
            image_data["user_id"] = owner
            image_data["user_name"] = db.child("users").child(owner).child("user_name").get().val()

        filename = image_data.get("filename", "")
        if "_" in filename:
            short_name_with_ext = filename.split("_", 1)[1]  # Parte sin UUID
        else:
            short_name_with_ext = filename

        name_base, extension = os.path.splitext(short_name_with_ext)
        short_name = name_base
        image_type = extension.lstrip(".")

        image_data["short_name"] = short_name
        image_data["image_type"] = image_type
        image_data["likedByUser"] = bool(liked_by_user)

        return jsonify(image_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
def get_users_with_image_count():
    try:
        # Verifica que el usuario tiene el rol de admin
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        # Verificar si el rol es 'admin'
        user = auth.get_account_info(token)
        user_id = user['users'][0]['localId']
        user_data = db.child("users").child(user_id).get().val()
        if user_data.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Obtener todos los usuarios
        users = db.child("users").get()
        user_image_counts = []
        print("Catched users")

        for user_entry in users.each():
            user_id = user_entry.key()
            user_images_ref = db.child("users").child(user_id).child("images").get()
            print(user_id)

            print("ALO POLICIA")
            private_images = 0
            public_images = 0

            if user_images_ref.val():
                for image_id in user_images_ref.val():
                    image_data = db.child("images").child(image_id).get().val()
                    if image_data.get("public") == "true":
                        public_images += 1
                    else:
                        private_images += 1
            print(f'{user_id} ({ user_entry.val().get('name')}): {private_images}/{public_images}')
            
            user_image_counts.append({
                'user_id': user_id,
                'name': user_entry.val().get('name'),
                'public_images': public_images,
                'private_images': private_images
            })

        return jsonify({'users': user_image_counts}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/public-images', methods=['GET'])
def get_public_images_for_admin():
    try:
        # Verifica que el usuario tiene el rol de admin
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        # Verificar si el rol es 'admin'
        user = auth.get_account_info(token)
        user_id = user['users'][0]['localId']
        user_data = db.child("users").child(user_id).get().val()
        if user_data.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Obtener todas las imágenes
        all_images = db.child("images").get()
        public_images = []

        if all_images and all_images.each():
            for image in all_images.each():
                image_data = image.val()
                if image_data.get("public") == "true":  # Solo imágenes públicas
                    image_data['image_id'] = image.key()  # Agregar ID de la imagen
                    public_images.append(image_data)
        
        return jsonify({'public_images': public_images}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
  app.run(debug=True)