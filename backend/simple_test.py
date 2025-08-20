from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/test')
def test():
    return jsonify({"message": "Flask server is working"})

if __name__ == '__main__':
    print("Starting simple Flask server...")
    app.run(debug=True, host='127.0.0.1', port=5002)
