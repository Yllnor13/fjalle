import csv

with open("word_list_6.csv", 'r', newline='') as wordslist:
    reader = csv.reader(wordslist)
    # Extract only non-empty second-column values
    words = [line[1] for line in reader if len(line) > 1 and line[1]]

# Sort the words alphabetically
words.sort()

print("done reading and sorting the words, on to writing")

with open("word_list_6_alphabet.txt", 'w', newline='') as wordslist:
    writer = csv.writer(wordslist)
    # Write each word in its own row
    for word in words:
        writer.writerow([word])

print("done writing, check the txt")

