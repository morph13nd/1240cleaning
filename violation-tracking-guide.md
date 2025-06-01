# Enhanced Bi-Weekly Chore Management System

This guide explains the enhanced Bi-Weekly Chore Management System with comprehensive violation tracking and backlog management features.

## Key Enhancements

The updated application now includes:

1. **Comprehensive Violation Tracking**
   - Detailed violation history with timestamps and cycle information
   - Violation backlog system that carries over incomplete chores
   - Person-specific violation statistics and reporting

2. **Automated Backlog Management**
   - Carry-over of incomplete tasks to future cycles
   - Visual indicators for backlog items
   - Backlog severity tracking based on repetition

3. **Enhanced GitHub Integration**
   - Improved GitHub file export with complete violation details
   - Full violation history in exported files
   - Statistics and metrics for tracking performance

4. **Improved UI Experience**
   - Visual indicators for violations and backlogs
   - Comprehensive statistics display
   - Detailed violation reporting

## Files Overview

The enhanced system consists of the following files:

1. **index.html** - Main application file with updated UI elements for violation tracking
2. **assets/app.js** - Enhanced JavaScript with comprehensive violation tracking logic
3. **assets/style.css** - Existing CSS plus additional styles for violation tracking
4. **current-chore-data.json** - Enhanced data structure for GitHub Pages integration

## Updated Data Structure

The `current-chore-data.json` file now includes:

```json
{
  "violations": {
    "history": [
      {
        "id": 1748640987654,
        "person": "Name",
        "chore": "Task",
        "cycleId": 1748640309493,
        "violationDate": "2025-06-13T19:00:00.000Z",
        "violationType": "incomplete", 
        "isResolved": false,
        "carryOverToNextCycle": true
      }
    ],
    "backlog": {
      "PersonName": [
        {
          "chore": "Task name",
          "originalCycle": 1748640309493,
          "carryOverCount": 1
        }
      ]
    },
    "statistics": {
      "PersonName": {
        "totalViolations": 2,
        "currentBacklog": 2,
        "consecutiveViolations": 2
      }
    }
  }
}
```

## Installation Instructions

1. Replace the existing files with the updated versions:
   - Upload `index.html` to your GitHub repository root
   - Create an `assets` folder and upload `app.js` and `style.css`
   - Upload the enhanced `current-chore-data.json` to the repository root

2. Ensure your repository structure looks like:
```
yourusername.github.io/
├── index.html
├── current-chore-data.json
└── assets/
    ├── app.js
    └── style.css
```

3. Enable GitHub Pages in your repository settings (if not already enabled)

## Usage Instructions

### Managing Violations

1. To record a violation:
   - Select the person and chore from the violation management section
   - Click "Add Violation"
   - The system will automatically add the chore to the person's backlog

2. To resolve a violation:
   - Mark the chore as completed using the checkbox
   - The system will automatically resolve the violation and remove it from backlog

3. To remove a violation:
   - Click the "✕" button next to a violation
   - Or use the form to select the person and chore, then click "Remove Violation"

### Working with Backlogs

When generating a new cycle, the system will:
1. Include all backlog items from previous cycles
2. Assign additional chores to meet the minimum requirements
3. Visually mark backlog items in the assignments list

### GitHub Integration

1. Click "Generate GitHub Data File" to create an updated `current-chore-data.json`
2. Upload this file to your GitHub repository
3. All users will then see the same assignments, violations, and backlogs when loading the page

## Troubleshooting

If violations or backlogs aren't showing correctly:
1. Check browser console for errors (F12)
2. Ensure IndexedDB is enabled in your browser
3. Verify that `current-chore-data.json` is properly formatted
4. Try clearing browser cache and reloading the page