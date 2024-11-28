# Meeting Sessions Tracking Application

## Project Overview
This is a full-stack application for tracking meeting sessions, participants, and various events during meetings.

## Prerequisites
- Node.js (v16 or later)
- npm (v8 or later)
- MongoDB

## Project Setup

### Backend Setup
1. Clone the repository
```bash
git clone https://github.com/Vishal2002/videosdk-assignment.git
cd server
```

2. Create a `.env` file in the `server` directory with the following contents:
```env
PORT=8080
MONGODB_STRING=MongoDB Connection String
```

3. Install Dependencies
```bash
npm install
```

4. Run the Server
```bash
npm run start
```

### Frontend Setup
1. Navigate to the client directory
```bash
cd client
```

2. Install Dependencies
```bash
npm install
```

3. Run the Development Server
```bash
npm run dev
```

## API Routes

### Session Routes

#### Get All Sessions
- **URL:** `/api/sessions`
- **Method:** `GET`
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Number of sessions per page (default: 10)
- **Success Response:** 
  ```json
  {
    "sessions": [...],
    "totalPages": 5,
    "currentPage": 1
  }
  ```

#### Get Session by ID
- **URL:** `/api/sessions/:id`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "meetingId": "abc123",
    "start": "2024-01-15T10:30:00Z",
    "end": null,
    "participantArray": []
  }
  ```

#### Create Session
- **URL:** `/api/sessions`
- **Method:** `POST`
- **Success Response:** Returns created session object

#### Add Participant
- **URL:** `/api/sessions/:sessionId/participants`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "name": "Participant Name"
  }
  ```
- **Success Response:** Returns updated session with new participant

## Log Event Scenarios

#### Log Event
- **URL:** `/api/sessions/:sessionId/participants/:participantId/events`
- **Method:** `POST`

### Scenario 1: Joining and Leaving Session
```json
// First Join
{
  "eventType": "join"
}

// Later Exit
{
  "eventType": "exit"
}

// Rejoining 
{
  "eventType": "join"
}
```
**Explanation:** 
- Participants can join and exit multiple times during a session
- Each `join` creates a new timelog entry
- Each `exit` closes the most recent open timelog entry
- This allows tracking total time spent in the session, including multiple entry/exit events

### Scenario 2: Tracking Device Events
```json
// Mic Events
{
  "eventType": "mic",
  "action": "start"
}
{
  "eventType": "mic",
  "action": "stop"
}

// Webcam Events
{
  "eventType": "webcam",
  "action": "start"
}
{
  "eventType": "webcam",
  "action": "stop"
}

// Screen Share Events
{
  "eventType": "screenShare",
  "action": "start"
}
{
  "eventType": "screenShare",
  "action": "stop"
}
```
**Explanation:**
- Each device event (mic, webcam, screen share) can be independently tracked
- `start` begins a new event
- `stop` closes the most recent open event
- Allows granular tracking of participant interactions

### Scenario 3: Error Logging
```json
// Error Event
{
  "eventType": "errors",
  "message": "Mic is not working"
}

// Another Error
{
  "eventType": "errors",
  "message": "Screen share connection lost"
}
```
**Explanation:**
- Errors can be logged at any time during the session
- Each error is timestamped and stored with a descriptive message
- Helps in debugging and understanding session challenges

### Complex Example Scenario
```json
// Full Session Interaction Example
[
  {
    "eventType": "join"
  },
  {
    "eventType": "mic",
    "action": "start"
  },
  {
    "eventType": "webcam",
    "action": "start"
  },
  {
    "eventType": "screenShare",
    "action": "start"
  },
  {
    "eventType": "errors",
    "message": "Temporary audio glitch"
  },
  {
    "eventType": "mic",
    "action": "stop"
  },
  {
    "eventType": "screenShare",
    "action": "stop"
  },
  {
    "eventType": "exit"
  }
]
```
- **Success Response:** Logs event and returns updated timelog

#### End Session
- **URL:** `/api/sessions/:sessionId/end`
- **Method:** `PUT`
- **Success Response:** Returns session with end time set

## Postman Collection
Download the Postman collection from `Session Timeline.postman_collection.json` in the project root for easy API testing.

## Technologies Used
- Backend: Node.js, Express, TypeScript
- Database: MongoDB
- Frontend: React,TailwindCSS,Shadcn,TypeScript

## Deployment
- Live Link : 