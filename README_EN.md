# Pick Up Memories

[中文版](./README.md)

A Tauri + React + TypeScript emotional diary app, offering absolutely private local storage and a unique time-sealing feature.

## Core Features

### Emotional Tree Hole
- 🌳 **Absolutely Private**: All data is stored locally to ensure privacy
- 📝 **Free Expression**: Supports text, images, and music for multimedia journaling
- 💭 **Emotional Venting**: Record emotions and secrets you can't share with others, like confiding in a tree hole
- 🎵 **Music Association**: Associate each memory with a song that represents your mood

### Time-Sealed Dust
- 🔒 **Active Sealing**: Seal specific records and set an unsealing time
- ⏰ **Timed Unsealing**: Automatically unseal at the specified time to revisit memories
- 🗑️ **Auto-Destruction**: Set records to self-destruct after a certain time
- 🎭 **Sense of Ritual**: Turn "clearing memories" and "letting go" into a controllable, active process

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Tauri 2.0
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand
- **Package Manager**: pnpm
- **Local Storage**: Tauri File System API

## Development Setup

### Prerequisites
- Node.js 18+
- Rust 1.70+
- pnpm

### Install Dependencies
```bash
pnpm install
```

### Development Mode
```bash
pnpm tauri dev
```

### Build App
```bash
pnpm tauri build
```

## Features

### Record Management
- ✅ Create, edit, and delete emotional records
- ✅ Support for text, images, and music
- ✅ Search and filter
- ✅ Multiple sorting options

### Time-Sealed Dust
- ✅ Permanent sealing or timed unsealing
- ✅ Auto-destruction
- ✅ Visualized sealing status
- ✅ Unsealing and destruction reminders

### Data Security
- ✅ Local storage for privacy
- ✅ Data import/export
- ✅ Auto-backup reminders

### User Experience
- ✅ Dark/Light theme switch
- ✅ Responsive design
- ✅ Elegant animations
- ✅ Intuitive UI

## App Screenshots

After launching the app, you'll see:
1. **Home Page**: Card view of all records with statistics
2. **Record Editor**: Rich text, image, and music editing
3. **Seal Dialog**: Set sealing and destruction times
4. **Record Viewer**: View full record content, with fullscreen image support

## Design Philosophy

> "Tears shatter my secrets in remembrance of the past, pierce my memories, and drain my patience."

This app aims to:
- Provide a safe container for shattered emotional fragments
- Let users actively choose when to face memories and when to let go
- Help users reconcile with the past at their own pace through ritual

## Development Notes

### Project Structure
```
src/
├── components/          # React components
│   ├── HomePage.tsx     # Home page
│   ├── RecordCard.tsx   # Record card
│   ├── RecordEditor.tsx # Record editor
│   ├── RecordViewer.tsx # Record viewer
│   ├── SealDialog.tsx   # Seal dialog
│   └── ThemeProvider.tsx # Theme provider
├── services/            # Service layer
│   ├── storage.ts       # Storage service
│   └── notification.ts  # Notification service
├── stores/              # State management
│   └── useAppStore.ts   # App state
├── types/               # Type definitions
│   └── index.ts         # All type definitions
└── App.tsx              # App entry point

src-tauri/
├── src/
│   └── lib.rs           # Rust backend code
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json      # Tauri config
```

### Contribution Guide
1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Acknowledgements

Thanks to everyone who inspired and supported this project. May everyone find their own way to reconcile with the past at their own pace.
