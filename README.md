# Smart Plate AI 🥗

Smart Plate AI is a Food Recognition & Health Analytics Platform built strictly with the requested "Simple Yet Powerful Free Stack" (Final Recommendation).

## 🏗 Stack Architecture

### Frontend (User Interface)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (Custom themes, Glassmorphism, Premium Dark UI)
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Deployment:** Ready for **Automatic PWA Hosting**

### Backend (API & Logic)
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (with SQLAlchemy ORM)
- **AI Model:** Pre-configured for YOLOv8 (`ultralytics`) and PyTorch for food recognition.
- **Nutrition Logic:** Data dictionaries for USDA FoodData Central and ICMR Indian Food Composition Table.
- **Health Engine:** Custom Python rule-based engine mapping food nutrition to medical conditions.
- **Deployment:** Ready for **Render** (`backend/render.yaml` & `Dockerfile` included)

---

## 🚀 How to Run Locally

### Prerequisites
You will need to install the following on your Windows machine to run this locally:
1. **Node.js** (v18+) - For the React frontend.
2. **Python** (v3.9+) - For the FastAPI backend.
3. **PostgreSQL** (or use SQLite temporarily by changing `DATABASE_URL` in `.env`).

### 1. Start the Backend (FastAPI)
Open a terminal in the `backend/` directory:

```bash
# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server (runs on http://localhost:8000)
uvicorn app.main:app --reload
```
*(Optionally, modify `backend/.env` to point to a local PostgreSQL instance).*

### 2. Start the Frontend (React + Vite)
Open a terminal in the `frontend/` directory:

```bash
# Install dependencies
npm install

# Start the development server (runs on http://localhost:5173)
npm run dev
```

---

---

## 📂 Project Structure

```
d:\project\
├── backend/                  # FastAPI Application
│   ├── app/                  # Application Code
│   │   ├── routers/          # API Endpoints (auth, health, meals, etc.)
│   │   ├── services/         # Core Logic (AI, Nutrition Lookup, Health Engine)
│   │   ├── models.py         # SQLAlchemy Database Models
│   │   ├── schemas.py        # Pydantic Schemas
│   │   └── ...
│   ├── main.py               # FastAPI Entry Point
│   ├── requirements.txt      # Python Dependencies
│   ├── Dockerfile            # Render Deployment Container
│   └── render.yaml           # Render Blueprint
├── frontend/                 # React UI
│   ├── src/                  
│   │   ├── pages/            # Dashboard, ScanFood, HealthProfile...
│   │   ├── components/       # Layouts and UI Components
│   │   ├── api.js            # Axios client connected to backend
│   │   └── ...
│   ├── package.json          # Node Dependencies
│   ├── tailwind.config.js    # Custom styling themes
│   └── vercel.json           # Vercel Deployment configuration
```
