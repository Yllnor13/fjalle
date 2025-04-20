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


def encode_data(data: str, exist: bool) -> int:
    """
    Encodes a 6-digit base-3 string and a boolean flag into an integer.
    Assumes data is exactly 6 digits ('0', '1', or '2').
    """
    val = 0
    # Ensure the input data string is exactly 6 characters long
    if len(data) != 6:
        raise ValueError("Input data string must be exactly 6 characters long.")

    for i in range(6):
        try:
            digit = int(data[i])
            if not (0 <= digit <= 2):
                raise ValueError(f"Invalid digit '{data[i]}' at index {i}. Only '0', '1', '2' are allowed.")
            val = val * 3 + digit # base-3 encode
        except ValueError:
            raise ValueError(f"Invalid character '{data[i]}' at index {i}. Only digits '0', '1', '2' are allowed.")

    # Add the "exist" bit: Shift left by 1 and OR with 1 if exist is True, else 0
    val = (val << 1) | (1 if exist else 0)
    return val

def decode_data(val: int) -> dict:
    """
    Decodes an integer back into a 6-digit base-3 string and a boolean flag.

    Args:
        val: The encoded integer value.

    Returns:
        A dictionary containing:
            'data': The decoded 6-digit base-3 string.
            'exist': The decoded boolean flag.
    """
    # Extract the last bit for the 'exist' flag
    exist = bool(val & 1)

    # Right-shift to remove the 'exist' bit
    val = val >> 1

    data = ''
    for _ in range(6): # We need to loop 6 times
        # Get the last base-3 digit (remainder of division by 3)
        digit = val % 3
        # Prepend the digit (as a string) to the data string
        data = str(digit) + data
        # Integer division by 3 to remove the last base-3 digit
        val = val // 3 # Use floor division //

    return {"data": data, "exist": exist}

def load_word_data():
    with open(words_file, 'r', newline='') as file:
        datereader = reader(file)
        return [tuple(line) for line in datereader]

word_data = load_word_data()

def get_days_word(day_str):
    for line in word_data:
        if line[0] == day_str:
            return line[1].strip()
    return None  # Optional fallback

def is_word_in_list(word):
    return any(line[1] == word for line in word_data)

def check_letters(data, day_str):
    vals = []
    if len(data) != 6:
        return []

    word_of_day = get_days_word(day_str)
    if not word_of_day:
        return []  # Optional: handle missing day

    for i in range(len(data)):
        if data[i] == word_of_day[i]:
            vals.append(2)
        elif data[i] in word_of_day:
            vals.append(1)
        else:
            vals.append(0)
    return "".join(map(str, vals))

app = Flask(__name__)

app.config['TOGGLE_TITLE'] = True

allowed_origins = [
    "http://localhost:3000",       # Windows frontend
    "http://192.168.10.161:3000",  # LAN frontend (mobile, etc.)
    "http://172.24.229.75:5000",   # WSL backend (if necessary)
]

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
    print(data)

    submitted_word = data["data"].lower()
    day_str = data["date"]

    # Find out how the letters the user gave us matches with today's word
    numbers = check_letters(submitted_word, day_str)
    print("numbers " + numbers)
    daily_word = get_days_word(day_str)
    print("Daily word: " + daily_word)

    is_valid_word = is_word_in_list(submitted_word)

    encoded_numbers = encode_data(numbers, is_valid_word)

    response_data = {
        "data": encoded_numbers
    }

    return jsonify(response_data), 200

@app.route('/', methods=['GET'])
def handle_get():
    today = date.today()
    today_str = f"{today.year}/{today.month}/{today.day}"
    daily_word = get_days_word(today_str)

    if daily_word:
        is_valid = True # Assuming the daily word is always in the list
        encoded_word = encode_data("222222", is_valid) # Encode as all correct for revealing
        response_data = {
            "data": encoded_word
        }
        return jsonify(response_data), 200
    else:
        return jsonify({"error": "Word for today not found"}), 404

# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=port, debug=False)