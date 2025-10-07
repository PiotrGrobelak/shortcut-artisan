# Voice Command Processing Flow

## Overview

This document describes the complete end-to-end flow for processing voice commands in ShortcutArtisan. The system enables users to execute custom keyboard shortcuts using natural language voice commands, providing an intuitive and hands-free way to interact with the application. The system uses Rustpotter for wake word detection in the backend and Parakeet for high-quality command transcription.

## Architecture Components

### Frontend (React/Next.js)

- **Status Display**: Shows listening status ("listening"/"disabled"/"wake word detected")
- **User Controls**: Disable button to turn off voice assistant (listening is always-on by default)
- **Command Feedback**: Display command execution results and confirmations
- **State Management**: Redux Toolkit for voice assistant UI state and status

### Backend (Rust/Tauri)

- **Wake Word Detection**: Rustpotter integration for continuous "arti" wake word listening
- **Audio Recording**: Triggered audio capture after wake word detection
- **AI Service Coordination**: Integration with local Parakeet service for enhanced transcription
- **Command Interpretation**: Integration with LLM for natural language understanding
- **Execution Engine**: Decision making and command execution logic
- **Database Integration**: Access to shortcuts and commands database
- **IPC Communication**: Events to frontend for status updates and user interactions

### AI Services

- **Rustpotter**: Rust-based wake word detection library for "arti" keyword spotting
- **Parakeet TDT 0.6B v3**: Primary speech-to-text engine for all command processing
- **Ollama (LLM)**: Local Llama 3.2:3b model for command interpretation
- **Docker**: Containerized AI services for consistent deployment

## Complete Flow Diagram

### Primary Flow: Rustpotter Wake Word Detection + Parakeet Processing

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant B as Backend (Rust/Tauri)
    participant R as Rustpotter
    participant P as Parakeet Service (Docker)
    participant L as LLM (Ollama)
    participant DB as Commands Database
    participant OS as Operating System

    Note over U,OS: 🎙️ Always-On Voice Assistant Flow

    Note over B,R: Application starts with voice assistant enabled by default
    B->>R: 1. Auto-initialize Rustpotter wake word detection on startup
    B->>F: 2. IPC event: status_update("listening")
    F->>U: 3. Display "Listening..." status (always-on indicator)

    Note over R,R: 🎧 Continuous Wake Word Detection in Backend
    U->>R: 4. Says "Arti, open Chrome"
    R->>B: 5. Wake word "arti" detected
    B->>F: 6. IPC event: status_update("wake_word_detected")
    B->>B: 7. Start audio recording for command

    Note over B,P: 🎤 Audio Recording & Parakeet Processing
    B->>B: 8. Records high-quality audio of full command
    B->>P: 9. Sends audio to Parakeet service
    P->>B: 10. Returns transcription: "arti open chrome"

    Note over B,L: 🧠 Command Interpretation
    B->>B: 11. Extracts command after "arti": "open chrome"
    B->>DB: 12. Retrieves available commands
    B->>L: 13. Sends prompt: extracted text + available commands
    L->>B: 14. Returns interpretation (command + confidence)

    Note over B,B: ⚖️ Decision Making & Execution
    alt Confidence > threshold (≥0.8)
        B->>OS: 15a. Executes command directly
        B->>F: 16a. IPC event: command_executed(success + details)
    else Medium confidence (0.6-0.79)
        B->>F: 15b. IPC event: request_confirmation(command)
        F->>U: 16b. "Execute: [command]?"
        U->>F: 17b. Confirms/Rejects
        alt User confirms
            F->>B: 18b. IPC event: confirm_execution
            B->>OS: 19b. Executes command
            B->>F: 20b. IPC event: command_executed(success)
        else User rejects
            F->>B: 18c. IPC event: cancel_execution
            B->>F: 19c. IPC event: execution_cancelled
        end
    else Low confidence (<0.6)
        B->>F: 15c. IPC event: show_alternatives(suggestions)
        F->>U: 16c. "Did you mean: [suggestions]?"
    end

    B->>R: 17. Resume wake word listening (always continues)
    B->>F: 18. IPC event: status_update("listening")
    F->>U: 19. Display result + "Listening..." status (always-on)
```

### Error Handling Flow: Wake Word Detection Issues

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant B as Backend (Rust/Tauri)
    participant R as Rustpotter
    participant P as Parakeet Service

    Note over U,P: 🔄 Handling Wake Word Detection Problems

    U->>R: 1. Says "Arti, ..." but wake word not detected
    R->>B: 2. No wake word trigger (timeout)
    B->>F: 3. IPC event: status_update("listening") - no change
    F->>F: 4. Manual fallback button available

    alt Manual Trigger
        U->>F: 5. Clicks manual record button
        F->>B: 6. IPC event: manual_record_start
        B->>B: 7. Records audio directly (bypass wake word)
        B->>P: 8. Full transcription via Parakeet
        P->>B: 9. Returns full text (may or may not include "arti")
        B->>B: 10. Process command (extract after "arti" if present)
    else Retry Wake Word
        U->>R: 5. Repeats "Arti, ..." louder/clearer
        R->>B: 6. Detects wake word on retry
        B->>F: 7. IPC event: status_update("wake_word_detected")
        B->>B: 8. Proceeds with normal flow
    else Disable Assistant (Optional)
        U->>F: 5. Clicks disable button (optional - user choice)
        F->>B: 6. IPC event: stop_voice_assistant
        B->>R: 7. Stop Rustpotter listening
        B->>F: 8. IPC event: status_update("disabled")
        Note over F,U: User can re-enable by clicking enable button
        U->>F: 9. Clicks enable button (to restart)
        F->>B: 10. IPC event: start_voice_assistant
        B->>R: 11. Restart Rustpotter listening
    end
```

## Detailed Process Steps

### Phase 1: Always-On Wake Word Detection (Rustpotter)

1. **Automatic Startup**: Voice assistant starts automatically when application launches
2. **Rustpotter Auto-Initialization**: Backend automatically initializes Rustpotter with:
   - Wake word: "arti"
   - Audio format configuration (sample rate, channels)
   - Detection threshold and sensitivity settings
   - Microphone access through system audio APIs
3. **Status Update**: Backend sends `status_update("listening")` IPC event to frontend
4. **Always-On Listening**: Rustpotter continuously monitors audio stream for "arti" wake word
5. **User Control**: User can optionally disable listening via UI button (sends `stop_voice_assistant`)
6. **Wake Word Trigger**: When "arti" detected, Rustpotter notifies backend to start command recording

### Phase 2: Command Audio Recording & Parakeet Processing

#### Audio Recording Trigger

1. **Wake Word Detected**: Rustpotter detects "arti" keyword in backend
2. **Status Notification**: Backend sends `status_update("wake_word_detected")` to frontend
3. **Recording Start**: Backend immediately starts high-quality audio recording
4. **Recording Duration**: Record for 3-5 seconds after wake word detection
5. **Audio Buffer**: Capture complete command including "arti" prefix

#### Parakeet Processing (PRIMARY & ONLY transcription method)

1. **Audio Processing**: Backend processes recorded audio buffer internally
2. **Parakeet Service**: Backend forwards audio to local Parakeet service
3. **Full Transcription**: Parakeet processes entire audio including "arti"
4. **Enhanced Results**: Receive high-quality transcription with:
   - Automatic punctuation and capitalization
   - Word-level timestamps
   - Multilingual support (25 languages)
   - Superior noise robustness
5. **Command Extraction**: Backend extracts command text after "arti" keyword

### Phase 3: Command Interpretation

1. **Context Gathering**: System retrieves all available shortcuts from database
2. **Prompt Construction**: Creates structured prompt with:
   - User's transcribed text (ALWAYS from Parakeet - never Web Speech API)
   - Available commands and their descriptions
   - Context about command categories
   - Previous command history (optional)
3. **LLM Processing**: Ollama processes the prompt using Llama 3.2:3b
4. **Response Parsing**: LLM response parsed for:
   - Best matching command ID
   - Confidence score (0.0-1.0)
   - Reasoning explanation
   - Alternative suggestions

### Phase 4: Intelligent Decision Making & Execution

1. **Confidence Evaluation**: Backend evaluates LLM confidence score
2. **Smart Decision Tree**:
   - **High Confidence (≥0.8)**: Immediate execution with IPC notification to frontend
   - **Medium Confidence (0.6-0.79)**: Send `request_confirmation` IPC event to frontend
   - **Low Confidence (<0.6)**: Send `show_alternatives` IPC event with suggestions
3. **Command Execution**: If approved, execute through existing shortcut system
4. **User Feedback**: Backend sends execution results via IPC events to frontend
5. **Return to Listening**: Automatically resume Rustpotter wake word detection

### Phase 5: Continuous Operation & Frontend Responsibilities

1. **Backend State Management**: Maintain Rustpotter and assistant state across sessions
2. **Frontend UI Updates**: React to IPC events for status display:
   - "listening" - Show green microphone icon with "Listening..." text
   - "wake_word_detected" - Show orange icon with "Processing..." text
   - "disabled" - Show gray icon with "Voice Assistant Off" text
3. **User Controls**: Frontend provides disable button (listening is always-on by default, user can turn off)
4. **Error Handling**: Graceful recovery from Rustpotter and audio system errors
5. **Performance Monitoring**: Track recognition accuracy and response times in backend
6. **Manual Fallback**: Frontend provides manual record button for wake word detection issues
