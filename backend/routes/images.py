from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename
import uuid
from datetime import date
import cv2
import numpy as np

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

images_bp = Blueprint("images", __name__)

# Image upload route
@images_bp.route('/upload', methods=['POST'])
def upload_image():
    try:
        print("Requesting image upload")
        # Verify token
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        user = current_app.config["AUTH"].get_account_info(token)
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
            current_app.config["STORAGE"].child(storage_path).put(temp_path, token)

            # Get the URL of the uploaded file
            image_url = current_app.config["STORAGE"].child(storage_path).get_url(token)

            # Save image info in database
            image_data = {
                "url": image_url,
                "filename": unique_filename,
                "uploadedAt": date.today().isoformat(),
                "likes": 0,
                "public":"true"
            }

            image_ref = current_app.config["DB"].child("images").push(image_data, token)

            # Add image reference to user's images
            current_app.config["DB"].child("users").child(user_id).child("images").child(image_ref['name']).set(True, token)

            # Clean up temp file
            os.remove(temp_path)

            return jsonify({
                'message': 'File uploaded successfully',
                'url': image_url,
                'imageId': image_ref['name']
            }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

# Like/Unlike image route
@images_bp.route('/<image_id>/like', methods=['POST'])
def like_image(image_id):
    try:
        # Verify token
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        user = current_app.config["AUTH"].get_account_info(token)
        user_id = user['users'][0]['localId']
        print("user likes")

        # Check if user already liked the image
        likes = current_app.config["DB"].child("likes").child(image_id).child(user_id).get(token)
        likes_image = current_app.config["DB"].child("images").child(image_id).child("likes").get().val()

        if likes.val():
            # Unlike
            current_app.config["DB"].child("likes").child(image_id).child(user_id).remove()
            # Decrease like count
            current_app.config["DB"].child("images").child(image_id).child("likes").set(likes_image - 1)
            action = "unliked"
        else:
            # Like
            current_app.config["DB"].child("likes").child(image_id).child(user_id).set(True)
            # Increase like count
            current_app.config["DB"].child("images").child(image_id).child("likes").set(likes_image + 1)
            action = "liked"

        return jsonify({
            'message': f'Successfully {action} image',
            'imageId': image_id
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Change image's privacy
@images_bp.route('/<image_id>/toggle-privacy', methods=['PATCH'])
def toggle_image_privacy(image_id):
    try:
        # Verify token
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        user = current_app.config["AUTH"].get_account_info(token)
        user_id = user['users'][0]['localId']

        # Obtener datos actuales de la imagen
        image_ref = current_app.config["DB"].child("images").child(image_id).get(token)
        image_data = image_ref.val()

        if not image_data:
            return jsonify({'error': 'Image not found'}), 404

        # Cambiar el estado de 'public'
        new_privacy_status = "false" if image_data.get("public") == "true" else "true"
        current_app.config["DB"].child("images").child(image_id).update({"public": new_privacy_status}, token)

        return jsonify({
            'message': f'Image privacy updated to {"Public" if new_privacy_status == "true" else "Private"}',
            'imageId': image_id,
            'public': new_privacy_status
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@images_bp.route('/<image_id>/delete', methods=['DELETE'])
def delete_image(image_id):
    try:
        # Verify token
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        # Authenticate user
        user = current_app.config["AUTH"].get_account_info(token)
        user_id = user['users'][0]['localId']

        # Fetch image details
        image_ref = current_app.config["DB"].child("images").child(image_id).get(token)
        image_data = image_ref.val()

        if not image_data:
            return jsonify({'error': 'Image not found'}), 404

        # Extract the storage path from the image URL
        storage_path = image_data.get("url").split("o/")[-1].split("?")[0].replace("%2F", "/")

        # Delete the image from Firebase Storage
        current_app.config["STORAGE"].child(storage_path).delete()

        # Remove the image data from the 'images' table
        current_app.config["DB"].child("images").child(image_id).remove()

        # Remove the image reference from the user's images
        current_app.config["DB"].child("users").child(user_id).child("images").child(image_id).remove()

        return jsonify({
            'message': 'Image deleted successfully',
            'imageId': image_id
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get image by id
@images_bp.route('/<image_id>', methods=['Get'])
def get_image(image_id):
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        # Fetch image details
        image_ref = current_app.config["DB"].child("images").child(image_id).get(token)
        image_data = image_ref.val()

        return jsonify({
            'image': image_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Image edition route
@images_bp.route('/<image_id>/edit', methods=['POST'])
def edit_image(image_id):
    try:
        print("Requesting image edition")
        # Verify token
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        user = current_app.config["AUTH"].get_account_info(token)
        user_id = user['users'][0]['localId']

        data = request.json
        action = data.get('action')

        # Fetch image details
        image_ref = current_app.config["DB"].child("images").child(image_id).get(token)
        image_data = image_ref.val()

        if not image_data:
            return jsonify({'error': 'Image not found'}), 404

        storage_path = image_data['url'].split("o/")[-1].split("?")[0].replace("%2F", "/")
        temp_path = os.path.join(UPLOAD_FOLDER, image_data['filename'])

        current_app.config["STORAGE"].child(storage_path).download(temp_path)

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
        current_app.config["STORAGE"].child(edited_storage_path).put(edited_path, token)
        print("New Image uploaded")

        # Obtener la URL de la nueva imagen
        edited_url = current_app.config["STORAGE"].child(edited_storage_path).get_url(token)

        # Save image info in database
        image_data = {
            "url": edited_url,
            "filename": edited_filename,
            "uploadedAt": date.today().isoformat(),
            "likes": 0,
            "public":"false"
        }

        # Actualizar la base de datos con la nueva imagen
        image_ref = current_app.config["DB"].child("images").push(image_data, token)

        # Add image reference to user's images
        current_app.config["DB"].child("users").child(user_id).child("images").child(image_ref['name']).set(True, token)

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

# Show gallery
@images_bp.route('/gallery', methods=['GET'])
def get_public_images():
    try:
        # Verify token
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        # Get the logged-in user's ID
        user = current_app.config["AUTH"].get_account_info(token)
        current_user_id = user['users'][0]['localId']

        # Fetch all images
        all_images = current_app.config["DB"].child("images").get()
        public_images = []

        if all_images and all_images.each():
            for image in all_images.each():
                image_data = image.val()
                if image_data.get("public") == "true":  # Ensure image is public

                    # Fetch the user who owns this image
                    owner = None
                    users = current_app.config["DB"].child("users").get()
                    for user_entry in users.each():
                        user_images = user_entry.val().get("images", {})
                        if image.key() in user_images:
                            owner = user_entry.key()
                            break

                    # Exclude images from the current user
                    if owner and owner != current_user_id:
                        image_data["id"] = image.key()
                        image_data["user_id"] = owner
                        image_data["user_name"] = current_app.config["DB"].child("users").child(owner).child("user_name").get().val()
                        public_images.append(image_data)

        return jsonify({'images': public_images}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@images_bp.route('/guest', methods=['GET'])
def get_public_images_guest():
    try:
        # Obtain all images
        all_images = current_app.config["DB"].child("images").get()
        public_images = []

        # Filter public images
        if all_images and all_images.each():
            for image in all_images.each():
                image_data = image.val()
                if image_data.get("public") == "true":
                    # Find image's owner
                    owner_id = None
                    users = current_app.config["DB"].child("users").get()
                    for user_entry in users.each():
                        user_images = user_entry.val().get("images", {})
                        if image.key() in user_images:
                            owner_id = user_entry.key()
                            break

                    # If user found, add name
                    if owner_id:
                        owner_username = current_app.config["DB"].child("users").child(owner_id).child("user_name").get().val()
                        image_data["user_id"] = owner_id
                        image_data["user_name"] = owner_username

                    # Add to list
                    image_data["id"] = image.key()
                    public_images.append(image_data)

        return jsonify({'images': public_images}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@images_bp.route('/<image_id>/info', methods=['GET'])
def get_image_details(image_id):
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        image_data = current_app.config["DB"].child("images").child(image_id).get(token).val()
        if not image_data:
            return jsonify({'error': 'Image not found'}), 404

        user = current_app.config["AUTH"].get_account_info(token)
        user_id = user['users'][0]['localId']

        liked_by_user = current_app.config["DB"].child("likes").child(image_id).child(user_id).get(token).val()

        owner = None
        users = current_app.config["DB"].child("users").get()
        for user_entry in users.each():
            user_images = user_entry.val().get("images", {})
            if image_id in user_images:
                owner = user_entry.key()
                break

        if owner:
            image_data["user_id"] = owner
            image_data["user_name"] = current_app.config["DB"].child("users").child(owner).child("user_name").get().val()

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