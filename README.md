# Pixel Art

PixelArt is a web-based image platform that empowers users to transform their photos with ease. Built with a interface using Angular, PixelArt offers editing tools to customize images. Powered by a Flask backend, the platform provides seamless image uploading, storage on Firebase. Users can securely manage their edited images in a personal gallery. With OpenCV integrated for image processing, PixelArt delivers a customizable image editing experience.

Technologies
- Angular (with PrimeNg Components)
- Python (Flask to handle routes & cv2 for image enhancing)
- Firebase (database & store images)

https://github.com/user-attachments/assets/f4032aca-88f6-4010-9b1c-66a6f6d73e0d


https://github.com/user-attachments/assets/5cda25de-42ea-4c13-a40b-8e4dbb1e74c1

---

## Installation

### Backend Dependencies
```bash
pip install flask opencv-python firebase-rest-api flask-cors
```
### Frontend Dependencies
Make sure that you have Node.js and npm installed to use Angular
```bash
npm install
```

## Quick Start

### Firebase

1. **Create a Firebase project:** Head over to the Firebase console (console.firebase.google.com) and create a new project.


2. **Enable Firebase services:** You'll need to enable the following services for PixelArt:
   - Authentication (credentials)
   - Realtime Database (for storing user data like edited image references)
   - Cloud Storage (for storing the actual edited images)
   

3. **Create** a new file named `firebase_config.py` inside the backend directory and paste your firebase api key and configs. 
    ```
   config = {
       "apiKey": "YOUR_API_KEY",
       "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
       "databaseURL": "https://YOUR_DATABASE_NAME.firebaseio.com",
       "projectId": "YOUR_PROJECT_ID",
       "storageBucket": "YOUR_PROJECT_ID.appspot.com",
       "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
       "appId": "YOUR_APP_ID"
   }
   ```
   ###### Note: the `databaseURL` can be found in the firebase realtime page.

if you wish to modify the backend, you can find the `firebase-rest-api` documentation [here](https://github.com/AsifArmanRahman/firebase-rest-api)

### Run

In the backend directory
```bash
python ./api.py
```
In the frontend directory
```bash
ng serve
```

   
