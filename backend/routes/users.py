from flask import Blueprint, request, jsonify, current_app

users_bp = Blueprint("users", __name__)

# Get user's images
@users_bp.route('/<user_id>/images', methods=['GET'])
def get_user_images(user_id):
    try:
        # Verify token
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        user = current_app.config["AUTH"].get_account_info(token)

        if not user:
            return jsonify({'error': 'No user validated'}), 401

        # Get user's image references
        user_images = current_app.config['DB'].child("users").child(user_id).child("images").get(token)

        images = []
        private_images = 0
        public_images = 0

        if user_images.val():
            for image_id in user_images.val():
                image_data = current_app.config['DB'].child("images").child(image_id).get(token).val()
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