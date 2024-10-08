from flask import Flask, render_template, request, redirect, url_for, make_response, session, Response, jsonify
from flask_session import Session
import requests
import os
from datetime import timedelta 
from dotenv import load_dotenv 

load_dotenv()

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
app.secret_key = 'Shivam@17818'

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=12)

API_URL = os.getenv('API_URL')

def call_api_request():
    try:
        response = requests.get(API_URL, verify=False)
        response.raise_for_status() 
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return None
    except ValueError as e:
        print(f"Error parsing API response: {e}")
        return None

response_data = call_api_request()

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(400)
@app.errorhandler(401)
@app.errorhandler(500)
def handle_error(error):
    return make_response(jsonify({'error': error.description}), error.code)

  
users = [{'username': 'Shivam', 'password': 'Shivam@12345'}, {'username': 'Anand', 'password': 'Anand@12345'},
{'username': 'stt_demo', 'password': 'sttdemo@123!@#'},{'username': 'TeamLead', 'password': 'Team@123!@#'}]

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        for user in users:
            if user['username'] == username and user['password'] == password:
                session['logged_in'] = True
                return redirect(url_for('index'))

        return render_template('login.html', error='Invalid credentials')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

@app.route('/')
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/api')
def api():
    if response_data:
        response = Response('', status=200)
        response.headers['subscriptionKey'] = response_data.get('subscriptionKey')
        response.headers['endPointId'] = response_data.get('endPointId')
        response.headers['region'] = response_data.get('region')
        return response
    else:
        return make_response(jsonify({'error': 'API request failed'}), 500)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3009, debug=True)
