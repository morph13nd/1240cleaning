# Create a sample current-chore-data.json file with the corrected bi-weekly schedule
import json

# Sample data structure for the GitHub repository file
sample_data = {
    "metadata": {
        "lastUpdated": "2025-05-30T16:48:00.000Z",
        "version": "1.0",
        "cycleNumber": 1,
        "description": "Bi-weekly chore assignments for Shabbat cleanup"
    },
    "currentCycle": {
        "id": "cycle-2025-06-13",
        "startDate": "2025-06-10",
        "deadlineDate": "2025-06-13",
        "type": "bi-weekly",
        "assignments": [
            {
                "person": "Oliver",
                "chores": [
                    "Second-floor bathroom, mop floor & toilet",
                    "Ground-floor washing sink"
                ],
                "completed": False,
                "violations": 0,
                "lastCompleted": None
            },
            {
                "person": "Spencer",
                "chores": [
                    "Sweep kitchen",
                    "Sweep living room"
                ],
                "completed": False,
                "violations": 0,
                "lastCompleted": None
            },
            {
                "person": "Ben",
                "chores": [
                    "Ground-floor bathroom & toilet",
                    "Recycling and trash disposal (out by Thursday night)"
                ],
                "completed": False,
                "violations": 0,
                "lastCompleted": None
            },
            {
                "person": "Isaac",
                "chores": [
                    "Vacuum kitchen",
                    "Vacuum living room"
                ],
                "completed": False,
                "violations": 0,
                "lastCompleted": None
            },
            {
                "person": "Jason",
                "chores": [
                    "Mop down kitchen",
                    "Kitchen & dining-room tables: cloth replacement & wipe-down"
                ],
                "completed": False,
                "violations": 0,
                "lastCompleted": None
            },
            {
                "person": "Jonah",
                "chores": [
                    "Replace foil in cooking stove",
                    "Wipe down kitchen stove, knobs, and surfaces"
                ],
                "completed": False,
                "violations": 0,
                "lastCompleted": None
            },
            {
                "person": "Nahum",
                "chores": [
                    "General tidy-up of common spaces",
                    "Bless the home with one Psalm of choice"
                ],
                "completed": False,
                "violations": 0,
                "lastCompleted": None
            },
            {
                "person": "Adam",
                "chores": [
                    "Vacuum stairs",
                    "Hefker sweep ground floor living room - clean up items and trash"
                ],
                "completed": False,
                "violations": 0,
                "lastCompleted": None
            }
        ]
    },
    "settings": {
        "cycleLength": 14,
        "minChoresPerPerson": 2,
        "maxChoresPerPerson": 3,
        "cycleStartDay": "Tuesday",
        "deadlineDay": "Friday",
        "timezone": "America/New_York"
    },
    "nextCycles": [
        {
            "cycleNumber": 2,
            "startDate": "2025-06-24",
            "deadlineDate": "2025-06-27"
        },
        {
            "cycleNumber": 3,
            "startDate": "2025-07-08",
            "deadlineDate": "2025-07-11"
        },
        {
            "cycleNumber": 4,
            "startDate": "2025-07-22",
            "deadlineDate": "2025-07-25"
        }
    ]
}

# Convert to JSON string with proper formatting
json_content = json.dumps(sample_data, indent=2, ensure_ascii=False)

# Save to file
with open('current-chore-data.json', 'w') as f:
    f.write(json_content)

print("Created current-chore-data.json file")
print(f"File size: {len(json_content)} characters")
print("\nFile content preview:")
print(json_content[:500] + "..." if len(json_content) > 500 else json_content)