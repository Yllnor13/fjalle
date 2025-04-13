from flask import Flask, request, jsonify, make_response, abort
from csv import reader
from datetime import date

import os

# CORS configuration
from flask_cors import CORS

words = "fjale.csv"
words_path = f"/app/data/{words}"
words_file = words_path if os.path.exists(words_path) else words

#   today = date.today()
#   today_str = f"{today.month}/{today.day}/{today.year}"

def get_days_word(day_str):
    with open(words_file, 'r', newline='') as file:
        datereader = reader(file)
        for line in datereader:
            if line[0] == day_str:
                return line[1]

def check_letters(data, day_str):
    vals = []
    for x in range(len(data)):
        if data[x] == get_days_word(day_str)[x]:
            vals.append(2)
        elif get_days_word(day_str).contains(x):
            vals.append(1)
        else:
            vals.append(0)
    return vals