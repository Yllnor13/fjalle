import csv
import random
from datetime import date, timedelta

with open("word_list_6_work.txt", 'r', encoding='utf-8') as infile:
    words = [line.strip() for line in infile if line.strip()]

random.shuffle(words)

today = date.today()

rows = []
for i, word in enumerate(words):
    current_date = today + timedelta(days=i)
    date_str = f"{current_date.year}/{current_date.month}/{current_date.day}"
    rows.append([date_str, word])

with open("word_list_6.csv", 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerows(rows)

print("Done. Check 'word_list_6.csv'")