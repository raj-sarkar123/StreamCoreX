# Video Downloader 🎥

A minimal, clean, modern desktop video-downloading application for **YouTube** and **Instagram** media. Built with **Next.js**, **Tailwind CSS**, **Framer Motion**, **FastAPI**, and **Tauri**.

Designed specifically for downloading user-owned or authorized content directly to your local OS `Downloads` folder.

---

## 🌟 Key Features

- **Platform Selector**: Seamless toggle between YouTube and Instagram with animated selection states.
- **Dynamic Input & Validation**: Instant URL validation ensuring format match and URL accessibility.
- **Real-Time Download Tracking**: Live progress bar with percentage, download speed, total file size, and estimated time remaining (ETA).
- **Native File Handling**: Downloaded files are saved automatically to your local `Downloads` directory without requiring manual copy steps.
- **Single-Click Open Folder**: Dedicated "Open Folder" button opens the local `Downloads` folder directly in Windows Explorer / macOS Finder / Linux file manager.
- **Safe & Compliant**: Direct Python `yt-dlp` API integration without raw shell command execution, enforcing platform accessibility rules and zero DRM bypass.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (React, TypeScript), Tailwind CSS, Framer Motion, Lucide React Icons
- **Desktop Wrapper**: Tauri 1.5 (Rust)
- **Backend API**: Python 3.10+, FastAPI, Uvicorn, Pydantic
- **Media Engine**: Python `yt-dlp`
- **Media Converter**: FFmpeg (optional for combining high-definition video + audio formats)

---

## 📁 Project Architecture

```
video-downloader/
├── frontend/                 # Next.js React UI
│   ├── app/                  # App Router pages & layout
│   │   ├── globals.css       # Dark modern theme & CSS rules
│   │   ├── layout.tsx        # Root HTML layout
│   │   └── page.tsx          # Single-screen desktop dashboard
│   ├── components/           # UI Components
│   │   ├── Header.tsx        # App Title & Subtitle
│   │   ├── PlatformSelector.tsx # YouTube / Instagram cards
│   │   ├── UrlInputSection.tsx  # Dynamic URL Input & Action button
│   │   └── StatusCard.tsx    # Validating, Downloading, Success & Error UI
│   ├── lib/                  # Utilities & API Client
│   │   ├── api.ts            # FastAPI integration client
│   │   └── utils.ts          # Tailwind helper functions
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # FastAPI Python Backend
│   ├── main.py               # FastAPI entry point & CORS configuration
│   ├── routes/
│   │   ├── validate.py       # URL & platform validation endpoint
│   │   └── download.py       # Download initiation & status polling endpoints
│   ├── services/
│   │   └── downloader_service.py # Background worker & yt-dlp manager
│   ├── utils/
│   │   ├── validators.py     # Regex and platform URL validators
│   │   └── file_utils.py     # System Downloads folder & file manager openers
│   └── requirements.txt
│
├── src-tauri/                # Tauri Desktop Integration
│   ├── src/
│   │   └── main.rs           # Rust entry point & native commands
│   ├── Cargo.toml
│   └── tauri.conf.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.10 or higher)
- **Rust & Cargo** (Required for building Tauri desktop binary)
- **FFmpeg** (Recommended for 1080p+ video/audio merging)

---

### 1. Backend Setup (FastAPI)

Navigate to the `backend` folder and set up a Python virtual environment:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on http://127.0.0.1:8000)
python main.py
```

---

### 2. Frontend Setup (Next.js)

In a new terminal window, navigate to the `frontend` folder:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your web browser to test the web interface.

---

### 3. Running as a Native Desktop App (Tauri)

To run the application inside a native Tauri window:

```bash
# Ensure FastAPI backend is running on port 8000
cd backend
python main.py

# In a separate terminal, launch Tauri dev mode:
cd src-tauri
cargo tauri dev
```

---

## 📦 Production Build Instructions

### 1. Export Frontend
```bash
cd frontend
npm run build
```

### 2. Package Tauri Binary
```bash
cd src-tauri
cargo tauri build
```
The compiled installer/executable will be generated in `src-tauri/target/release/bundle/`.

---

## 🔒 Security & Scope Policy

This application is strictly designed for **user-owned or authorized public media**.

- **No DRM circumvention**: It will not bypass encrypted streams or DRM protections.
- **No private bypass**: It does not bypass platform login screens or age restrictions.
- **Safe subprocess execution**: Does not construct raw shell commands or evaluate arbitrary user input.

---

## 📄 License

Distributed under the MIT License.
