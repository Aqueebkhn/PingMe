# PingMe

PingMe is a real-time chat app built with React, Express, MongoDB, and Socket.IO. Visitors can try anonymous random chat without creating an account; registered users can also message other accounts and share files.

## Features

- **Anonymous random chat:** Match with another waiting visitor without signing in.
- **Automated fallback:** If no other visitor is available after a short wait, a clearly labeled scripted bot can chat with you. It is not an AI model.
- **Temporary anonymous conversations:** Anonymous messages are relayed in real time and are not saved to MongoDB.
- **Chat controls:** Leave, find another chat, or report a person during a conversation.
- **Accounts:** Sign up and log in with JWT-based authentication.
- **Registered-user messaging:** Browse the registered-user list, see online status, and send direct messages.
- **Media sharing:** Send images and files in registered-user chats through Cloudinary.
- **Profiles and themes:** Upload a profile photo and choose a UI theme.

> **Anonymous chat limitations:** The matchmaking queue is held in memory by one backend process. It is cleared when that process restarts and does not work across multiple backend instances. Reports are currently only logged by the server; they are not saved or reviewed. Add persistent moderation, stronger abuse prevention, and appropriate safety measures before opening anonymous chat to the public.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, DaisyUI, React Router, Zustand
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT in an HTTP-only cookie, bcryptjs
- **Uploads:** Cloudinary

## Project structure

```text
PingMe/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   └── package.json
├── frontend/
│   └── hippy/
│       ├── src/
│       └── package.json
└── README.md
```

## Requirements

- Node.js (a current LTS release)
- npm
- MongoDB connection string for registered accounts and persistent direct messages
- Cloudinary account credentials for profile-photo and chat-file uploads

Anonymous matching and bot chats use Socket.IO and do not require a MongoDB account. The backend still attempts to connect to MongoDB at startup.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Aqueebkhn/PingMe.git
cd PingMe
```

### 2. Configure the backend

Create `backend/.env`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<database-user>:<password>@<cluster-host>/<database-name>
JWT_SECRET=replace-with-a-long-random-secret

# Required for profile photos and image/file sharing
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Replace the MongoDB placeholders with the connection details from MongoDB Atlas. Create a database user and allow your IP address in Atlas Network Access. Remove the angle brackets when entering real values. URL-encode special characters in the database password.

Generate a JWT secret locally, for example in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Keep `.env` private. Never commit or share database credentials, JWT secrets, or Cloudinary secrets.

Cloudinary credentials are needed only for uploads; the app can be used without them if you do not use profile-photo or file-upload features.

### 3. Install dependencies

```bash
cd backend
npm install
cd ../frontend/hippy
npm install
```

### 4. Start the backend

From the `backend` directory:

```bash
node src/index.js
```

The API and Socket.IO server run on port `5001` by default. Set `PORT` in `backend/.env` to change the backend port.

### 5. Start the frontend

In a second terminal, from `frontend/hippy`:

```bash
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The frontend currently uses `http://localhost:5001` for the backend and Socket.IO.

## Trying anonymous chat

1. Open the app and choose **Find someone**.
2. To test visitor-to-visitor matching, open the app in two separate browser sessions and start a search in both.
3. If nobody else is waiting, the app connects you to the clearly labeled scripted bot after a short wait.
4. Use **Next** to find another chat, **Leave** to end the chat, or the report control to report a person.

Anonymous chat history is temporary and disappears when you leave or disconnect. The bot uses simple local response rules; it does not call an AI provider.

## Scripts

### Frontend (`frontend/hippy`)

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

### Backend

Start the backend with `node src/index.js` from the `backend` directory.

## Notes

- Add friend in the account experience browses existing registered users and opens a direct chat; friend requests are not implemented.
- Direct messages for registered accounts are stored in MongoDB.
- File and image uploads are limited to 5 MB by the app.
- The default development CORS configuration allows `localhost:5173` and `127.0.0.1:5173`.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Open a pull request.

## License

This project is licensed under the MIT License.

## Author

**Aqueeb Khan**
GitHub: [Aqueebkhn](https://github.com/Aqueebkhn)
