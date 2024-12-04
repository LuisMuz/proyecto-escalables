from flask import Blueprint, request, jsonify, current_app

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/about', methods=['GET'])
def show():
    return jsonify({'message': 'Hello there!'})

# Authentication routes
@auth_bp.route('/signup', methods=['POST'])
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
        user = current_app.config["AUTH"].create_user_with_email_and_password(email, password)

        # Store user data in database
        user_data = {
            "name": name,
            "email": email,
            "user_name": user_name,
            "user_birth": user_birth,
            "role": role
        }
        current_app.config["DB"].child("users").child(user['localId']).set(user_data)

        return jsonify({
            'message': 'Successfully created user',
            'userId': user['localId']
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    print("Attempting to login")
    try:
        data = request.get_json()
        print(data)
        email = data.get('email')
        password = data.get('password')

        # Firebase auth.py
        user = current_app.config["AUTH"].sign_in_with_email_and_password(email, password)

        user_data = current_app.config["DB"].child("users").child(user['localId']).get().val()
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

# Username Verification
@auth_bp.route('/api/check-username', methods=['POST'])
def check_username():
    try:
        print("Checking username...")
        data = request.get_json()
        user_name = data.get('user_name')
        users = current_app.config["AUTH"].child("users").get()

        for user in users.each():
            if user.val().get("user_name") == user_name:
                return jsonify({'exists': True}), 200

        return jsonify({'exists': False}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500