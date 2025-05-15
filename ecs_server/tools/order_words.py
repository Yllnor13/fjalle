import csv

with open("word_list_6.csv", 'r', newline='') as wordslist:
    reader = csv.reader(wordslist)
    words = [line[1] for line in reader if len(line) > 1 and line[1]]

words.sort()

print("done reading and sorting the words, on to writing")

with open("word_list_6_work.txt", 'w', newline='') as wordslist:
    writer = csv.writer(wordslist)
    for word in words:
        writer.writerow([word])

print("done writing, check the txt")

