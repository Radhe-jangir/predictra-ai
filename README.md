# 🚀 Predictra AI
### AI-Powered Business Intelligence & Data Analytics Platform

<p align="center">

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM-purple?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)

</p>

---

## 🌟 Overview

**Predictra AI** is an intelligent Business Intelligence and Data Analytics platform that transforms raw datasets into meaningful insights using Artificial Intelligence, Statistical Analytics, and Interactive Visualizations.

Instead of writing SQL queries or Python code, users simply upload their dataset and interact with it using natural language.

Whether you're a student, researcher, startup, business owner, or data analyst, Predictra AI enables faster and smarter decision-making.

---

# ✨ Features

## 📂 Data Management

- CSV & Excel Upload
- Automatic Dataset Profiling
- Missing Value Detection
- Duplicate Detection
- Data Cleaning
- Column Statistics
- Dataset Summary

---

## 🤖 AI Assistant

- Chat with your data
- Natural Language Queries
- AI-powered Business Insights
- Statistical Analysis
- Context-aware Responses
- Local Statistical Engine Fallback
- OpenRouter LLM Integration

---

## 📊 Business Intelligence

- Executive Insights
- Trend Analysis
- Distribution Analysis
- Correlation Detection
- Outlier Detection
- KPI Summary
- Statistical Reports

---

## 📈 Visualization

- Interactive Charts
- Histograms
- Bar Charts
- Pie Charts
- Scatter Plots
- Line Charts
- Distribution Graphs

---

## 🔮 Forecasting

- Time Series Forecasting
- Predictive Analytics
- Trend Projection
- Business Forecast Reports

---

## 📄 Reporting

- AI Generated Reports
- Business Intelligence Summary
- PDF Export
- Markdown Reports

---

## 🔐 Authentication

- Secure User Registration
- Login
- JWT Authentication
- User Profile

---

# 🏗 Architecture

```
                 React + TypeScript
                        │
                        ▼
                FastAPI REST API
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
 Dataset Engine   Analytics Engine    AI Engine
       │                │                │
       ▼                ▼                ▼
    Pandas         Scikit-Learn      OpenRouter
       │                │
       └────────────┬───┘
                    ▼
               SQLite Database
```

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

---

## Backend

- FastAPI
- Python
- SQLAlchemy
- SQLite
- JWT Authentication

---

## AI

- OpenRouter API
- Llama Models
- Prompt Engineering

---

## Data Science

- Pandas
- NumPy
- Scikit-learn

---

## Visualization

- Plotly

---

## Report Generation

- ReportLab

---

## Deployment

- Vercel
- Render

---

# 📂 Project Structure

```
Predictra-AI
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── services/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── core/
│   │   └── utils/
│   │
│   └── main.py
│
├── uploads/
├── reports/
├── requirements.txt
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/predictra-ai.git
```

```bash
cd predictra-ai
```

---

## Backend

```bash
cd backend
```

```bash
pip install -r requirements.txt
```

```bash
uvicorn main:app --reload
```

---

## Frontend

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

---

# 🌐 Environment Variables

Create a `.env` file inside the backend directory.

```env
DATABASE_URL=sqlite:///predictra.db

SECRET_KEY=your_secret_key

OPENROUTER_API_KEY=your_openrouter_api_key

FRONTEND_ORIGIN=http://localhost:5173
```

---

# 📊 Workflow

```
User Login
      │
      ▼
Upload Dataset
      │
      ▼
Dataset Profiling
      │
      ▼
Data Cleaning
      │
      ▼
Statistical Analysis
      │
      ▼
AI Processing
      │
      ▼
Business Insights
      │
      ▼
Charts & Forecast
      │
      ▼
Generate PDF Report
```

---

# 💡 Use Cases

- Business Intelligence
- Market Analysis
- Sales Analytics
- Educational Projects
- Government Surveys
- Research Data
- Customer Analytics
- Financial Analysis
- NGO Data Analysis
- Academic Research

---

# 📷 Screenshots

> Add screenshots here.

- Dashboard
- Dataset Upload
- AI Chat
- Insights
- Forecast
- Reports

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Protected Routes
- API Validation
- Input Sanitization

---

# 🚀 Future Enhancements

- PostgreSQL Support
- Cloud Storage
- Team Collaboration
- Auto Dashboard Generation
- Real-time Analytics
- Voice Assistant
- Advanced ML Pipeline
- Multi-language Support
- Role-Based Access Control
- Enterprise Deployment

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/NewFeature
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push to GitHub

```bash
git push origin feature/NewFeature
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Developer

**Radheshyam Suthar**

AI/ML Developer • Python Developer • Full Stack Developer

- 💼 LinkedIn: https://www.linkedin.com/in/radheshyamsuthar/
- 💻 GitHub: https://github.com/Radhe-jangir

---

# ⭐ If you like this project...

Give it a ⭐ on GitHub and support the project!

---

<p align="center">
<b>Predictra AI — Transforming Data into Intelligent Decisions.</b>
</p>