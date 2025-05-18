words_to_remove = "".split()

words_to_add = "medina dafina".split()

with open("word_list_6_work.txt", 'r', newline='') as wordslist:
    words = [line.strip() for line in wordslist if line.strip()]

for word in words_to_remove:
    if word in words:
        words.remove(word)

for word in words_to_add:
    words.append(word)

words = sorted(set(words))

with open("word_list_6_work.txt", 'w', newline='') as wordslist:
    for word in words:
        wordslist.write(word + '\n')

print("Done writing, check 'word_list_6_work.txt'")
