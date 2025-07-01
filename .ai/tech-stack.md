# ShortcutArtisan Tech Stack

## Frontend - Next.js with React for modern desktop application UI:

- **Next.js 15** provides a robust React framework for building the user interface with server-side rendering capabilities and excellent developer experience
- **React** serves as the core library for building interactive components and managing component state
- **TypeScript** ensures static code typing and better IDE support for improved development experience
- **TailwindCSS** with **shadcn/ui components** provides modern, accessible, and customizable UI components for consistent design
- **Redux Toolkit** manages application state for shortcuts and folders, providing predictable state management

## Backend - Tauri as a Rust-powered desktop application framework:

- **Tauri v2** serves as the main backend framework, providing secure and lightweight desktop application capabilities
- **Rust** programming language ensures memory safety, performance, and cross-platform compatibility
- **Tokio** provides asynchronous runtime for handling concurrent operations efficiently
- **Serde** handles serialization and deserialization of data between frontend and backend
- **UUID** generates unique identifiers for shortcuts and folders

## Desktop Integration - Native OS interaction capabilities:

- **Tauri's native APIs** enable direct interaction with the operating system for executing keyboard shortcuts
- **File system access** for configuration import/export functionality
- **System tray integration** for background operation and quick access
- **Global hotkey registration** for capturing and executing custom keyboard shortcuts

## Testing - Comprehensive development and testing environment:

- **Vitest** for unit and integration testing of components and services
- **ESLint** for code quality and consistency enforcement
- **Prettier** for code formatting
- **Playwright** for end-to-end testing
