-----

# Skillatics (skillatics-io)

Skillatics is a full-stack adaptive learning and analytics platform designed to accelerate student outcomes. It features an adaptive test engine, detailed performance analytics, and role-based dashboards for students, faculty, and administrators.

## ✨ Features

  * **Adaptive Test Engine**: Delivers questions that adjust in difficulty based on the user's performance, providing a personalized assessment experience.
  * **Role-Based Dashboards**: Separate, tailored interfaces for three distinct user roles:
      * **Student**: View test history, track score over time, and analyze average performance by topic.
      * **TPO/Faculty**: Access batch-level analytics to monitor cohort performance, including average scores and test completion rates.
      * **Admin**: Full control over the platform, including user management (listing users, changing roles) and content management (adding new questions to the database).
  * **Secure Authentication**: JWT-based authentication for user registration and login.
  * **Data Visualization**: Uses **Chart.js** to render clear and insightful charts for student progress and batch analytics.

## 🛠️ Tech Stack

This project is a monorepo divided into two main parts:

  * **Backend**:

      * **Framework**: Flask
      * **Database**: MongoDB (with Flask-PyMongo)
      * **Authentication**: Flask-JWT-Extended
      * **Password Hashing**: passlib
      * **Other Libraries**: `python-dotenv`, `Flask-Cors`

  * **Frontend**:

      * **Framework**: React 18
      * **Bundler**: Vite
      * **Routing**: React Router 6
      * **Styling**: Tailwind CSS
      * **Data Fetching**: Axios
      * **Charts**: Chart.js (with `react-chartjs-2`)
      * **Animation**: Framer Motion

## 🚀 Getting Started

### Prerequisites

  * Python 3.8+
  * Node.js 18+
  * MongoDB (running locally or a cloud instance)

### 1\. Backend Setup

1.  **Navigate to the backend directory:**

    ```sh
    cd backend
    ```

2.  **Create and activate a virtual environment:**

    ```sh
    # On macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # On Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install Python dependencies:**

    ```sh
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the `backend` directory and add the following variables:

    ```env
    # Your MongoDB connection string
    MONGO_URI=mongodb://localhost:27017/skillatics

    # A strong, random string for signing JWTs
    JWT_SECRET_KEY=your-super-secret-key

    # (Optional) Credentials for the initial admin user
    ADMIN_EMAIL=admin@skillatics.local
    ADMIN_PASSWORD=ChangeMe123!
    ```

5.  **Initialize the Database:**
    This script will create database indexes and seed the admin user specified in your `.env` file.

    ```sh
    python scripts/init_db.py
    ```

6.  **Run the Backend Server:**

    ```sh
    flask run
    # Or
    python app.py
    ```

    The backend API will be running at `http://localhost:5000`.

### 2\. Frontend Setup

1.  **Navigate to the frontend directory (in a new terminal):**

    ```sh
    cd frontend
    ```

2.  **Install NPM dependencies:**

    ```sh
    npm install
    ```

3.  **Run the Frontend Development Server:**

    ```sh
    npm run dev
    ```

    The frontend application will be available at `http://localhost:5173`.

The frontend is pre-configured with a proxy, so all API requests to `/api` will be automatically forwarded to the backend server at `http://localhost:5000`.

## 📂 Project Structure

```
skillatics-io/
├── backend/
│   ├── routes/             # API Blueprints (auth, admin, data, test_engine)
│   ├── scripts/
│   │   └── init_db.py      # Database initialization script
│   ├── app.py              # Flask application factory
│   ├── extensions.py       # Flask extension instances (Mongo, JWT)
│   └── requirements.txt    # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable React components (Navbar, Page)
    │   ├── lib/            # Client-side helpers (api.js, auth.js)
    │   ├── pages/          # Top-level page components (Login, Test, Dashboards)
    │   ├── App.jsx         # Main app component with routing
    │   └── main.jsx        # React app entry point
    ├── tailwind.config.js  # Tailwind CSS configuration
    ├── vite.config.js      # Vite configuration (including proxy)
    └── package.json        # NPM dependencies
```

## 🔐 API Endpoints

All endpoints are prefixed with `/api`.

### Auth

  * `POST /auth/register`: Register a new user (defaults to "Student" role).
  * `POST /auth/login`: Log in a user and receive a JWT.

### Admin (Requires Admin Role)

  * `GET /admin/users`: Get a list of all users.
  * `POST /admin/questions`: Add a new question to the database.
  * `PUT /admin/users/<user_id>/role`: Update the role of a specific user.

### Test Engine (Requires Student Role)

  * `POST /test/start`: Start a new adaptive test session.
  * `POST /test/submit`: Submit an answer and receive the next question or final results.

### Data & Analytics

  * `GET /data/my-results`: (Student) Get a history of the current user's test results.
  * `GET /data/my-topic-averages`: (Student) Get the current user's average scores grouped by topic.
  * `GET /data/batch-analytics`: (Faculty/Admin) Get aggregated analytics for the entire cohort.
