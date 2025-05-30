from datetime import datetime, timedelta
import calendar

# Current date is May 30, 2025
current_date = datetime(2025, 5, 30)
print(f"Current date: {current_date.strftime('%A, %B %d, %Y')}")

# Next cycle is June 13, 2025 as specified by user
next_cycle = datetime(2025, 6, 13)
print(f"Next cycle: {next_cycle.strftime('%A, %B %d, %Y')}")

# Calculate the difference
days_until_next = (next_cycle - current_date).days
print(f"Days until next cycle: {days_until_next}")

# Verify it's a bi-weekly (14-day) cycle
# If June 13 is the next cycle, then the previous cycle would have been
previous_cycle = next_cycle - timedelta(days=14)
print(f"Previous cycle would have been: {previous_cycle.strftime('%A, %B %d, %Y')}")

# Calculate future cycles for a year (26 cycles)
future_cycles = []
for i in range(26):  # 26 bi-weekly cycles in a year
    cycle_date = next_cycle + timedelta(days=14*i)
    future_cycles.append(cycle_date)
    if i < 5:  # Show first 5 cycles
        print(f"Cycle {i+1}: {cycle_date.strftime('%A, %B %d, %Y')}")

print(f"...")
print(f"Total cycles for year: {len(future_cycles)}")
print(f"Last cycle: {future_cycles[-1].strftime('%A, %B %d, %Y')}")