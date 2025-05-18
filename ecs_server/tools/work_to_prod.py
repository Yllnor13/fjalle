import csv
import random
from datetime import date, timedelta

with open("word_list_6_work.txt", 'r', encoding='utf-8') as infile:
    words = [line.strip() for line in infile if line.strip()]

pinned_dates = {
    "2025/11/28": "flamur",
    "2026/2/17": "kosova",
    "2026/3/1": "bosnia",
    "2026/5/4": "gëzuar",
    "2026/5/10": "bukuri",
    "2026/10/16": "bunker",
}

# Remove pinned words from the word list (if present) to avoid duplicates
remaining_words = [word for word in words if word not in pinned_dates.values()]
random.shuffle(remaining_words)

today = date.today()

rows = []
i = 0
while remaining_words or pinned_dates:
    current_date = today + timedelta(days=i)
    date_str = f"{current_date.year}/{current_date.month}/{current_date.day}"
    
    if date_str in pinned_dates:
        word = pinned_dates.pop(date_str)
    else:
        word = remaining_words.pop()
    
    rows.append([date_str, word])
    i += 1

with open("word_list_6.csv", 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerows(rows)

print("Done. Check 'word_list_6.csv'")