# GitHub Integration Guide for Bi-Weekly Chore Manager

## Required File for GitHub Repository

To enable automatic data loading for all users accessing your chore management application, you need to create and maintain a specific JSON file in your GitHub repository.

### File Name and Location
```
current-chore-data.json
```

This file should be placed in the **root directory** of your GitHub Pages repository (the same folder as your `index.html` file).

### File Structure

The `current-chore-data.json` file should contain the following structure:

```json
{
  "metadata": {
    "lastUpdated": "2025-05-30T16:48:00.000Z",
    "version": "1.0",
    "cycleNumber": 1
  },
  "currentCycle": {
    "id": "cycle-2025-06-13",
    "startDate": "2025-06-10",
    "deadlineDate": "2025-06-13",
    "assignments": [
      {
        "person": "Oliver",
        "chores": [
          "Second-floor bathroom, mop floor & toilet",
          "Ground-floor washing sink"
        ],
        "completed": false,
        "violations": 0
      },
      {
        "person": "Spencer", 
        "chores": [
          "Sweep kitchen",
          "Sweep living room"
        ],
        "completed": false,
        "violations": 0
      }
    ]
  },
  "settings": {
    "cycleLength": 14,
    "minChoresPerPerson": 2
  }
}
```

### How to Create and Update This File

#### Method 1: Using the Application's Export Feature
1. Open your chore management application
2. Click the **"Generate GitHub Data File"** button
3. Download the generated `current-chore-data.json` file
4. Upload this file to your GitHub repository's root directory

#### Method 2: Manual Creation
1. Copy the template structure above
2. Update the assignments with current cycle data
3. Save as `current-chore-data.json` in your repository root

### How the Application Uses This File

When users load your chore management application:

1. **Automatic Loading**: The app attempts to fetch `current-chore-data.json` from your GitHub repository
2. **Fallback**: If the file doesn't exist or fails to load, the app uses local storage or default settings
3. **Data Synchronization**: The loaded data becomes the baseline for all users accessing the application

### GitHub Repository Setup

Your GitHub Pages repository should have this structure:
```
username.github.io/
├── index.html
├── style.css  
├── app.js
├── current-chore-data.json  ← Required file
└── statistics/
    ├── chore-statistics-2025-05-30.json
    └── chore-statistics-2025-06-13.json
```

### URL Format for Data Loading

The application constructs the URL as:
```
https://username.github.io/current-chore-data.json
```

Replace `username` with your actual GitHub username.

### Important Notes

- **Update Frequency**: Update this file every bi-weekly cycle (every 14 days)
- **File Size**: Keep the file under 1MB for optimal loading performance
- **CORS**: GitHub Pages automatically handles CORS for same-origin requests
- **Caching**: GitHub may cache the file for up to 10 minutes

### Automation Tips

1. **Use GitHub Actions**: Set up automated workflows to update this file
2. **Manual Updates**: Update the file manually after each cycle generation
3. **Version Control**: GitHub automatically tracks changes to this file

This integration ensures that all household members see the same current assignments when they access the application, regardless of their device or browser.