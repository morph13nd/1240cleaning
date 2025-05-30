# Let's manually calculate the bi-weekly cycles
print("Current date: Friday, May 30, 2025")
print("Next cycle: Friday, June 13, 2025")
print("This is a 14-day (bi-weekly) interval")

# Calculate some future dates manually
print("\nBi-weekly cycle dates:")
print("Cycle 1: Friday, June 13, 2025")
print("Cycle 2: Friday, June 27, 2025")
print("Cycle 3: Friday, July 11, 2025")
print("Cycle 4: Friday, July 25, 2025")
print("Cycle 5: Friday, August 8, 2025")
print("...")
print("This continues every 14 days (2 weeks) indefinitely")

# Create list of people and chores
people = ['Oliver', 'Spencer', 'Ben', 'Isaac', 'Jason', 'Jonah', 'Nahum', 'Adam']

chores = [
    'Second-floor bathroom, mop floor & toilet',
    'Ground-floor washing sink',
    'Sweep kitchen',
    'Sweep living room',
    'Ground-floor bathroom & toilet',
    'Recycling and trash disposal (out by Thursday night)',
    'Vacuum kitchen',
    'Vacuum living room',
    'Mop down kitchen',
    'Kitchen & dining-room tables: cloth replacement & wipe-down',
    'Replace foil in cooking stove',
    'Wipe down kitchen stove, knobs, and surfaces',
    'Wipe down kitchen countertops',
    'General tidy-up of common spaces',
    'Bless the home with one Psalm of choice',
    'Vacuum stairs',
    'Hefker sweep ground floor living room - clean up items and trash'
]

print(f"\nNumber of people: {len(people)}")
print(f"Number of chores: {len(chores)}")
print("Each person gets at least 2 chores per cycle")
print("No person gets the same chore as their previous cycle")