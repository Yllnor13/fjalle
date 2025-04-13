from flask import Flask, request, jsonify, make_response, abort
from csv import reader
from datetime import date

import os

# CORS configuration
from flask_cors import CORS
base_dir = os.path.dirname(__file__)
words = "word_list_6.csv"
words_path = os.path.join("/app/data/", words)
words_file = words_path if os.path.exists(words_path) else os.path.join(base_dir, words)

def get_days_word(day_str):
    with open(words_file, 'r', newline='') as file:
        datereader = reader(file)
        for line in datereader:
            if line[0] == day_str:
                return line[1].strip()

def check_letters(data, day_str):
    vals = []
    #word myst be the exact length that is accepted
    if len(data) != 6:
        return []
    #0 = gray squares, 1 = yellow squares, 2 = green squares
    for x in range(len(data)):
        if data[x] == get_days_word(day_str)[x]:
            vals.append(2)
        elif data[x] in get_days_word(day_str):
            vals.append(1)
        else:
            vals.append(0)
    return vals

app = Flask(__name__)

app.config['TOGGLE_TITLE'] = True

allowed_origins = ["http://localhost:3000"]

# Get port from environment variable or use 8080 as default
port = int(os.environ.get('PORT', 8080))
CORS(app, resources={
    r"/*": {  # Match all routes
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

@app.route('/', methods=['OPTIONS'])
def handle_options():
    response = make_response()
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response

@app.route('/', methods=['POST'])
def handle_post():
    if request.method == 'OPTIONS':
        return handle_options()
    data = request.get_json()

    today = date.today()
    today_str = f"{today.year}/{today.month}/{today.day}"

    #find out how the letters the user gave us matches with todays word
    numbers = "".join(str(num) for num in check_letters(data["data"], today_str))
    
    #return todays word to user if they got everything correct
    #hides what todays word is from the frontend until the end
    response_data = {
        "data": numbers if numbers != [] else 0
    }
    
    return jsonify(response_data), 200

@app.route('/', methods=['GET'])
def handle_get():
    today = date.today()
    today_str = f"{today.year}/{today.month}/{today.day}"
    response_data = {
        "data": get_days_word(today_str)
    }

    return jsonify(response_data), 200

# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=port, debug=False)