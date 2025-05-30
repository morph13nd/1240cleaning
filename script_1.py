from datetime import datetime, timedelta

# Current date is May 30, 2025
current_date = datetime(2025, 5, 30)
print("Current date:", current_date.strftime('%A, %B %d, %Y'))

# Next cycle is June 13, 2025 as specified by user
next_cycle = datetime(2025, 6, 13)
print("Next cycle:", next_cycle.strftime('%A, %B %d, %Y'))

# Calculate the difference
days_until_next = (next_cycle - current_date).days
print("Days until next cycle:", days_until_next)

# Calculate future cycles for a year (26 cycles)
future_cycles = []
for i in range(26):  # 26 bi-weekly cycles in a year
    cycle_date = next_cycle + timedelta(days=14*i)
    future_cycles.append(cycle_date)

print("\nFirst 5 future cycles:")
for i in range(min(5, len(future_cycles))):
    print(f"Cycle {i+1}: {future_cycles[i].strftime('%A, %B %d, %Y')}")

print(f"\nTotal cycles for year: {len(future_cycles)}")
print(f"Last cycle: {future_cycles[-1].strftime('%A, %B %d, %Y')}")