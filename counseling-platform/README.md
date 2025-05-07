# Counseling Platform

## Overview
The Counseling Platform is a web-based application designed to connect students with counselors. It provides a secure and user-friendly environment for mental health services, allowing users to manage their profiles, schedule appointments, and engage in real-time chat.

## Features
- **User Authentication**: Secure registration and login for students and counselors using Firebase Authentication.
- **Profile Management**: Users can manage their profiles, including personal information and preferences.
- **Appointment Scheduling**: A system for scheduling sessions between students and counselors.
- **Real-Time Chat**: Instant messaging functionality for effective communication.
- **Custom Dashboards**: Tailored views for students and counselors to access relevant features.

## Technical Stack
- **Frontend**: HTML, CSS, JavaScript (Single Page Application)
- **Backend**: Node.js, Express
- **Database**: Firebase (Firestore for structured data, Realtime Database for chat)
- **Hosting**: Firebase Hosting

## Project Structure
```
Pent
└── counseling-platform
    ├── public
    │   ├── index.html
    │   ├── styles
    │   │   └── main.css
    │   └── scripts
    │       └── app.js
    ├── src
    │   ├── server.js
    │   ├── routes
    │   │   └── index.js
    │   ├── controllers
    │   │   └── authController.js
    │   ├── middlewares
    │   │   └── authMiddleware.js
    │   └── config
    │       └── firebaseConfig.js
    ├── package.json
    ├── .env
    ├── firebase.json
    └── README.md
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Navigate to the project directory: `cd counseling-platform`.
3. Install dependencies: `npm install`.
4. Configure Firebase settings in the `.env` file.
5. Start the server: `node src/server.js`.
6. Open your browser and navigate to `http://localhost:3000` to access the application.

## Usage
- **Students**: Register and log in to manage your profile, schedule appointments, and chat with counselors.
- **Counselors**: Register and log in to manage your profile, view appointments, and communicate with students.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.