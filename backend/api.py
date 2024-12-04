from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase
from firebase_configure import firebaseConfig
import os

# Import routes
from routes.auth import auth_bp
from routes.images import images_bp
from routes.users import users_bp

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

app.config['AUTH'] = firebase_app.auth()
app.config['DB'] = firebase_app.database()
app.config['STORAGE'] = firebase_app.storage()

# Registrar Blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(images_bp, url_prefix="/api/images")
app.register_blueprint(users_bp, url_prefix="/api/users")

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

        for user_entry in users.each():
            user_id = user_entry.key()
            user_images_ref = db.child("users").child(user_id).child("images").get()
            print(user_id)

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