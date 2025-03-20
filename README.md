# ShortcutArtisan ⌨️ + 🛠️

ShortcutArtisan is an application for creating and managing custom keyboard shortcuts. Boost your productivity by tailoring shortcuts to fit your workflow with ease!

## 🛠️ Technologies & Tools

### 🖥️ Frontend

- **Framework**: [Next.js](https://nextjs.org/) (v15)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) with shadcn/ui components
- **State Management** [Redux Toolkit](https://redux-toolkit.js.org/)

### ⚙️ Backend

- **Framework**: [Tauri](https://tauri.app/) (v2) - Rust-based desktop application framework
- **Rust Dependencies**:
  - Tokio - Asynchronous runtime
  - Serde - Serialization/deserialization
  - UUID - Unique identifier generation

## ✅ Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended) 📦
- [Rust](https://www.rust-lang.org/tools/install) toolchain 🦀
- Platform-specific dependencies for Tauri (see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)) 🔍

## 🚀 Getting Started

1. **Install dependencies** 📥:

```bash
npm install
```

2. **Run in development mode** 🏃‍♂️:

```bash
npm run tauri dev
```

This will start both the Next.js frontend and the Tauri backend.

3. **Build for production** 📦:

```bash
npm run tauri build
```

This will create executable installers in the `src-tauri/target/release` directory.

## 📂 Project Structure

- `src/` - Next.js frontend code 🖥️
- `src-tauri/` - Tauri/Rust backend code ⚙️
- `docs/` - Project documentation 📝

### 🚧 Application is under construction 👷‍♀️🚧
