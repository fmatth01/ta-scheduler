# TA Scheduler 

**TA Scheduler** is a full-stack web application built for JumboHack 2026 that intelligently assigns Teaching Assistants (TAs) to shifts based on their preferences, availability, and staffing requirements. The system uses optimization algorithms (simulated annealing and greedy approaches) to create fair, efficient schedules while respecting constraints like lab permissions and staffing capacity.

## 🌟 Features

### For Teaching Fellows (TFs)
- **Schedule Creation**: Configure shift times, durations, and staffing requirements
- **Automated Scheduling**: Run optimization algorithms to generate optimal TA assignments
- **Schedule Management**: View, edit, and publish finalized schedules
- **Budget Control**: Reduce schedules to meet budget constraints

### For Teaching Assistants (TAs)
- **Preference Submission**: Indicate availability and preferred time slots
- **Schedule Viewing**: See confirmed shift assignments
- **Interactive Calendar**: Visual representation of weekly schedules

### Core Functionality
- **Smart Scheduling Algorithm**: Uses simulated annealing optimization with constraint satisfaction
- **Fairness Guarantees**: Ensures equitable distribution of hours among TAs
- **Lab Permission Handling**: Respects TA qualifications (Office Hours, Lab Assist, Lab Lead)
- **Real-time Updates**: MongoDB backend for live data synchronization
- **Responsive Design**: Modern React interface with Tailwind CSS

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 19.2 with React Router for navigation
- Tailwind CSS 4.2 for styling
- Vite for fast development and builds
- Lottie animations for enhanced UX

**Backend:**
- Node.js with Express 5.2
- MongoDB 7.1 for data persistence
- Joi for request validation
- CORS enabled for cross-origin requests

**Algorithm:**
- Python 3.13
- Simulated annealing optimization
- Constraint satisfaction solver
- Budget reduction via greedy algorithm

### Project Structure

```
ta-scheduler/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   │   ├── ta.js          # TA-related endpoints
│   │   │   ├── schedule.js    # Schedule management
│   │   │   └── shift.js       # Shift creation
│   │   ├── schemas/           # Joi validation schemas
│   │   ├── utils/             # Helper functions
│   │   ├── app.js             # Express app configuration
│   │   └── server.js          # Server entry point
│   └── package.json
│
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Layout components
│   │   │   └── shared/        # Shared components
│   │   ├── contexts/          # React contexts (Auth, Schedule)
│   │   ├── pages/             # Route pages
│   │   │   ├── login/         # Login flow
│   │   │   ├── ta/            # TA dashboard
│   │   │   └── tf/            # TF dashboard
│   │   ├── services/          # API service layer
│   │   └── App.jsx            # Main app component
│   └── package.json
│
├── src/algorithm/             # Python scheduling algorithm
│   ├── data/                  # Data access layer
│   ├── helpers/               # Helper functions
│   │   ├── constraints.py     # Constraint validators
│   │   ├── scoring.py         # Cost calculation
│   │   └── data_access.py     # Data utilities
│   ├── simulated_annealing.py # Main optimizer
│   ├── reducer.py             # Budget reduction
│   ├── greedy.py              # Greedy algorithm
│   └── main.py                # Entry point
│
└── .github/workflows/         # CI/CD configuration
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.13+
- **MongoDB** 7+ (local or cloud instance like MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fmatth01/ta-scheduler.git
   cd ta-scheduler
   ```

2. **Install dependencies:**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables:**

   Create `backend/.env`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ta-scheduler
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ta-scheduler
   NODE_ENV=development
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

### Running the Application

**Option 1: Run everything together**

Open three terminal windows:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Algorithm (when needed)
cd src/algorithm
python main.py
```

**Option 2: Development mode**

```bash
# Backend (runs on http://localhost:3000)
cd backend
npm run dev

# Frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

**Production build:**

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production mode
cd ../backend
NODE_ENV=production npm start
```

---

## 📚 Usage

### For Teaching Fellows

1. **Access the TF Dashboard** at `/login/tf`
2. **Generate a new schedule** or join an existing one
3. **Configure shifts:**
   - Set start/end times
   - Define shift duration
   - Specify staffing capacity `[lab_permission, num_tas]`
4. **Run the scheduling algorithm** to assign TAs
5. **Review and publish** the finalized schedule

### For Teaching Assistants

1. **Access the TA Portal** at `/login/ta`
2. **Join a schedule** using the provided code
3. **Submit availability:**
   - Mark preferred shifts (green)
   - Mark available shifts (yellow)
   - Leave unavailable slots empty (gray)
4. **View confirmed assignments** once TF publishes schedule

### Running the Scheduling Algorithm

The algorithm optimizes TA assignments based on:
- TA preferences (preferred > available > unavailable)
- Lab permissions (TAs only work shifts they're qualified for)
- Staffing requirements (each shift meets min/max staffing)
- Fairness (balanced hour distribution)

```bash
cd src/algorithm
python main.py
```

The algorithm will:
1. Load data from MongoDB
2. Run simulated annealing optimization
3. Apply budget constraints if needed
4. Post the optimized schedule back to the database

---

## 🗄️ Data Models

### TA (Teaching Assistant)
```javascript
{
  ta_id: String,           // Unique identifier
  first_name: String,
  last_name: String,
  is_tf: Boolean,          // Is this TA also a Teaching Fellow?
  lab_perm: Number,        // 0 = OH, 1 = Lab Assist, 2 = Lab Lead
  preferences: [           // Array of shift preferences
    {
      ta_id: Number,
      shift_id: Number,
      preference: Number   // 0 = Unavailable, 1 = Available, 2 = Preferred
    }
  ],
  confirmed_shifts: [Number]  // Array of assigned shift IDs
}
```

### Schedule
```javascript
{
  schedule_id: Number,
  monday: [Shift],
  tuesday: [Shift],
  wednesday: [Shift],
  thursday: [Shift],
  friday: [Shift],
  saturday: [Shift],
  sunday: [Shift]
}
```

### Shift
```javascript
{
  shift_id: String,        // e.g., "m1" (Monday shift 1)
  schedule_id: Number,
  start_time: String,      // "HH:MM" format
  end_time: String,        // "HH:MM" format
  is_lab: Boolean,
  is_empty: Boolean,
  tas_scheduled: [String], // Array of ta_ids
  staffing_capacity: [     // [lab_permission, number_of_tas]
    Number,                // 0 = OH, 1 = Lab Assist, 2 = Lab Lead
    Number                 // Number of TAs needed
  ]
}
```

---

### Quick Reference

**TA Routes (`/ta`)**
- `POST /create` - Create a new TA
- `POST /get_schedule` - Get TA's confirmed shifts

**Schedule Routes (`/schedule`)**
- `GET /getSchedule?schedule_id=<id>` - Fetch schedule by ID
- `POST /initSchedule` - Create new schedule with shifts
- `PUT /update` - Update existing schedule

**Shift Routes (`/shift`)**
- `POST /create` - Create a new shift

---

### Optimization Approach

1. **Simulated Annealing:**
   - Starts with random assignment
   - Iteratively improves solution
   - Accepts worse solutions probabilistically to escape local optima
   - Gradually "cools" to converge on global optimum

2. **Constraint Satisfaction:**
   - Hard constraints (must be satisfied):
     - Lab permission matching
     - Staffing capacity limits
     - No TA double-booking
   - Soft constraints (optimized):
     - TA preferences
     - Fair hour distribution

3. **Budget Reduction:**
   - Greedy removal of least-preferred assignments
   - Maintains minimum staffing requirements
   - Preserves schedule quality

---

## 🎨 Frontend Components

### Key Components

**Layout Components:**
- `AppLayout` - Main app container with sidebar
- `LoginLayout` - Authentication flow layout
- `Sidebar` - Navigation sidebar

**Shared Components:**
- `ScheduleGrid` - Interactive weekly schedule view
- `ShiftCard` - Individual shift display
- `ChipInput` - Multi-select input for tags
- `EmojiCodeInput` - Fun code entry interface

**Page Components:**
- **Login Flow**: `LoginRolePicker`, `TAJoin`, `TFChoice`, `TFGenerate`, `TFJoin`
- **TA Pages**: `ScheduleBuilder`, `TAViewer`
- **TF Pages**: `ScheduleConfig`, `TFViewer`

---

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- **JavaScript**: Follow ESLint configuration
- **Python**: Follow PEP 8 style guide
- **Components**: Use functional components with hooks
- **Naming**: Use descriptive, camelCase for JS, snake_case for Python

---


**Module Not Found:**
```
Error: Cannot find module 'express'
```
**Solution:** Reinstall dependencies:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 License

This project was created for JumboHack 2026 at Tufts University.

---

## 👥 Team

- **Yoda Ermias** - [@ermiayn3962](https://github.com/ermiayn3962)
- **Caityn Parrish-Lewis** - [@rockyboo3](https://github.com/rockyboo3)
- **Lindsay Ulrey** - [@lgulrey](https://github.com/lgulrey)
- **Tom Zhou** - [@TomZhou145](https://github.com/TomZhou145)
- **Fahim Rashid** - [@epicfahimxd](https://github.com/epicfahimxd)
- **Finn Mathews** - [@fmatth01](https://github.com/fmathh01)
---

## Acknowledgments

- Built for **JumboHack 2026** at Tufts University
- Optimization algorithms inspired by classical scheduling problems
- UI design influenced by modern SaaS applications 

---

## 📬 Contact

For questions or issues, please open an issue on GitHub or contact the team.

**Repository:** [github.com/fmatth01/ta-scheduler](https://github.com/fmatth01/ta-scheduler)

---
