with open("word_list_6_work.txt", 'r', encoding='utf-8') as infile:
    words = [line.strip() for line in infile if line.strip()]

words_sorted = sorted(words, key=lambda w: w[::-1])

with open("word_list_6_work.txt", 'w', encoding='utf-8') as outfile:
    for word in words_sorted:
        outfile.write(word + '\n')

print("Done. Check 'word_list_6_work.txt'")
