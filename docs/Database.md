# Database schema v.1

settings.json
├── version # Application version
├── lastUpdated # Timestamp of last update
├── user # User-specific information
│ ├── id # Unique user identifier
│ └── preferences # User preferences
│ ├── theme # UI theme (dark/light)
│ ├── fontSize # Text size
│ ├── language # Locale setting
│ ├── notifications # Notification settings
│ └── layout # UI layout preferences
│
├── shortcuts # Shortcuts management
│ ├── folders # Collection of shortcut folders
│ │ ├── folder1 # First folder
│ │ │ ├── id # Unique folder identifier
│ │ │ ├── name # Display name
│ │ │ ├── icon # Folder icon
│ │ │ ├── color # Folder color
│ │ │ └── items # Shortcuts in this folder
│ │ │ ├── shortcut1 # First shortcut
│ │ │ │ ├── id # Unique shortcut identifier
│ │ │ │ ├── name # Display name
│ │ │ │ ├── url # Target URL
│ │ │ │ ├── icon # Shortcut icon
│ │ │ │ ├── tags # Categorization tags
│ │ │ │ └── lastAccessed # Last usage timestamp
│ │ │ └── shortcut2 # Second shortcut
│ │ │ └── ...
│ │ └── folder2, folder3... # Additional folders
│ │
│ ├── favorites # Array of shortcut IDs marked as favorites
│ └── recent # Array of recently used shortcut IDs
│
├── features # Feature flags and limits
│ ├── enabledExperiments # Array of enabled experimental features
│ ├── betaFeatures # Toggle for beta features
│ ├── maxShortcutsPerFolder # Limit for shortcuts per folder
│ └── maxFolders # Maximum number of folders allowed
│
└── security # Security settings
├── requirePasswordForSettings # Password protection for settings
├── autoLockTimeout # Auto-lock timeout in minutes
└── allowExport # Allow exporting settings
