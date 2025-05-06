import csv
import random

with open("gptlist.txt", "r") as f:
    nouns = [line.strip().lower() for line in f if len(line.strip()) == 6 and "'" not in line.strip()]

with open("words.csv", 'r', newline='') as wordslist:
    reader = csv.reader(wordslist)
    rows = list(reader)
    for lines in rows:
        if not lines[1]:
            if nouns:
                random_word = random.choice(nouns)
                lines[1] = nouns.pop(nouns.index(random_word))
        elif lines[1] in nouns:
            nouns.remove(lines[1])

print("done reading and setting up the rows, on to writing")
with open("word_list.csv", 'w', newline='') as wordslist:
    writer = csv.writer(wordslist)
    for row in rows:
        writer.writerow(row)
print("done writing, check the csv")