# Database Schema v.1

## Application Settings (settings.json)

### Core Settings

- **version**: Application version
- **lastUpdated**: Timestamp of last update

### User Information

- **user**: User-specific information
  - **id**: Unique user identifier
  - **preferences**: User preferences
    - **theme**: UI theme (dark/light)
    - **fontSize**: Text size
    - **language**: Locale setting
    - **notifications**: Notification settings
    - **layout**: UI layout preferences

### Shortcuts Management

- **folders**: Collection of shortcut folders
  - **folder1, folder2, etc.**: Individual folders
    - **id**: Unique folder identifier
    - **name**: Display name
    - **icon**: Folder icon
    - **color**: Folder color
    - **items**: Array of shortcut IDs in this folder
  - **shortcuts**: Collection of shortcuts
    - **shortcut1, shortcut2, etc.**: Individual shortcuts
      - **id**: Unique shortcut identifier
      - **name**: Display name
      - **url**: Target URL
      - **icon**: Shortcut icon
      - **folderId**: Reference to the folder this shortcut belongs to
      - **tags**: Categorization tags
      - **lastAccessed**: Last usage timestamp
  - **favorites**: Array of shortcut IDs marked as favorites
  - **recent**: Array of recently used shortcut IDs

### Feature Configuration

- **features**: Feature flags and limits
  - **enabledExperiments**: Array of enabled experimental features
  - **betaFeatures**: Toggle for beta features
  - **maxShortcutsPerFolder**: Limit for shortcuts per folder
  - **maxFolders**: Maximum number of folders allowed

### Security Settings

- **security**: Security settings
  - **keepLogged**: Flag to maintain user login state
