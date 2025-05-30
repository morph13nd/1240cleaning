# Quick Reference: Bi-Weekly Chore Manager Corrections

## Key Corrections Made

### 1. **Bi-Weekly Schedule (Every 14 Days)**
- ✅ **CORRECTED**: Cycles now properly repeat every 14 days (2 weeks)
- ❌ **Previous Error**: Application was calculating weekly cycles
- **Current Schedule**:
  - Current Date: Friday, May 30, 2025
  - Next Cycle Start: Tuesday, June 10, 2025  
  - Next Deadline: Friday, June 13, 2025 (before Shabbat)
  - Subsequent cycles: June 27, July 11, July 25, etc.

### 2. **GitHub Repository File for Data Loading**

#### **Required File**: `current-chore-data.json`
- **Location**: Root directory of your GitHub Pages repository
- **Purpose**: Provides current chore assignments for all users
- **URL**: `https://yourusername.github.io/current-chore-data.json`

#### **File Update Process**:
1. Use the "Generate GitHub Data File" button in the application
2. Download the generated `current-chore-data.json` file
3. Upload it to your GitHub repository's root folder
4. Commit the changes

#### **Repository Structure**:
```
yourusername.github.io/
├── index.html
├── style.css
├── app.js
├── current-chore-data.json  ← **THIS FILE IS REQUIRED**
└── statistics/
    └── (statistics files)
```

## What Happens When Users Load the Page

1. **Automatic Data Loading**: App tries to fetch `current-chore-data.json` from GitHub
2. **Shared State**: All users see the same current assignments
3. **Fallback**: If file missing, uses local storage or defaults
4. **Manual Updates**: Users can manually import/export data

## Implementation Steps

1. **Deploy Application**: Upload HTML, CSS, and JS files to GitHub Pages
2. **Create Data File**: Generate or manually create `current-chore-data.json`
3. **Upload Data**: Place the JSON file in repository root
4. **Test Loading**: Verify all users see shared data

## Bi-Weekly Cycle Calendar (2025)

| Cycle | Start Date | Deadline | 
|-------|------------|----------|
| 1 | June 10 | June 13 |
| 2 | June 24 | June 27 |
| 3 | July 8 | July 11 |
| 4 | July 22 | July 25 |
| 5 | August 5 | August 8 |

*Continues every 14 days indefinitely*

## Important Notes

- ⏰ **Timing**: All cleaning must be completed before Shabbat (Friday evening)
- 🔄 **Frequency**: Every 14 days (bi-weekly), not weekly
- 📊 **Data Sharing**: `current-chore-data.json` enables shared state across all users
- 💾 **Updates**: Update the GitHub file after each new cycle generation