# 🎮 TicTacToe Multiplayer — Next.js + Firebase

A production-ready **Realtime Multiplayer Tic Tac Toe** web app built with:

- **Next.js 15** (App Router)
- **Firebase Realtime Database** — instant cross-player sync
- **Tailwind CSS v4** — utility-first styling
- **Framer Motion** — smooth animations
- **Lucide React** — crisp icons

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎯 Dynamic Grids | 3×3, 4×4, 5×5, 6×6 or custom N×N |
| 🏆 Smart Win Detection | Scales automatically (3/4/5-in-a-row) |
| ⚡ Realtime Sync | Firebase Realtime Database |
| 🔗 Room Codes | 6-character shareable codes |
| 😂 Live Emoji Reactions | Float on both screens in real-time |
| 🎨 Glassmorphism UI | Dark mode with animated backgrounds |
| 📱 Responsive | Works on mobile and desktop |

---

## 🚀 Quick Start

### 1. Clone and install dependencies

```bash
cd tictactoe
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Realtime Database** (start in test mode)
4. Go to **Project Settings → Your Apps → Web App**
5. Copy your config values

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Set Firebase Security Rules (Testing)

In Firebase Console → Realtime Database → Rules, paste:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

> ⚠️ **These rules are for development only.** Add authentication before going to production.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in two browser tabs to test multiplayer!

---

## 📁 Project Structure

```
tictactoe/
├── app/
│   ├── globals.css          # Dark theme, custom styles
│   ├── layout.tsx           # Root layout + SEO metadata
│   ├── page.js              # Home screen (Create/Join)
│   └── room/
│       └── [id]/
│           └── page.js      # Game room (main gameplay)
├── components/
│   ├── GameBoard.jsx        # Dynamic N×N board
│   ├── EmojiPanel.jsx       # Live emoji reactions
│   ├── GameOverModal.jsx    # Win/draw/lose overlay
│   ├── PlayerStatus.jsx     # Player connection badges
│   └── RoomCode.jsx         # 6-digit code display + copy
├── hooks/
│   └── useGameLogic.js      # Win detection, board utils
├── lib/
│   └── firebase.js          # Firebase init + db refs
├── .env.local               # Your Firebase credentials
└── firebase.rules.json      # Security rules (for reference)
```

---

## 🎮 How to Play

1. **Player 1 (Host)**: Click **Create Game**, choose grid size, copy the room code
2. **Player 2**: Click **Join Game**, enter the 6-character code
3. Take turns clicking cells — first to get the winning streak wins!
4. Use the **Emoji Panel** to react in real-time 😂
5. After the game, hit **Play Again** to reset or **Exit Room** to go home

---

## 🏆 Win Conditions by Grid Size

| Grid | Win Streak |
|------|-----------|
| 3×3  | 3 in a row |
| 4×4  | 4 in a row |
| 5×5  | 4 in a row |
| 6×6  | 5 in a row |

---

## 🔧 Firebase Database Schema

```json
{
  "rooms": {
    "ABC123": {
      "gridSize": 3,
      "winStreak": 3,
      "board": ["X", "O", "X", "", "X", "", "O", "", "O"],
      "currentTurn": "X",
      "players": {
        "X": { "connected": true },
        "O": { "connected": true }
      },
      "status": "playing",
      "winner": null,
      "winningCells": [],
      "emoji": {
        "value": "🎉",
        "sentBy": "X",
        "timestamp": 1234567890123
      }
    }
  }
}
```

---

## 📦 Tech Stack

- [Next.js 15](https://nextjs.org/) — React framework with App Router
- [Firebase](https://firebase.google.com/) — Realtime Database
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Lucide React](https://lucide.dev/) — Icons
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling
