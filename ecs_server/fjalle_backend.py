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
    #0 = gray squares, 1 = yellow squares, 2 = green squares
    for x in range(len(data)):
        if data[x] == get_days_word(day_str)[x]:
            vals.append(2)
        elif x in get_days_word(day_str):
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

@app.route('/', methods=['GET'])
def handle_get():
    data = request.get_json()

# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=port, debug=False)