from flask import Flask, request, jsonify
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
import pandas as pd
from sklearn.linear_model import LogisticRegression
import pickle
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
CORS(app, origins=['http://localhost:3000'])
# Load the trained model
model = pickle.load(open('backend\logistic_regression_model.pkl', 'rb'))

# Load the CountVectorizer
cv = pickle.load(open('backend\count_vectorizer.pkl', 'rb'))

def clean_text(text):
    # Remove HTML tags
    text = re.sub('<.*?>', '', text)
    
    # Remove non-alphabetic characters and convert to lowercase
    text = re.sub('[^a-zA-Z]', ' ', text).lower()
    
    # Remove URLs, mentions, and hashtags from the text
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'@\S+', '', text)
    text = re.sub(r'#\S+', '', text)
    
    # Tokenize the text
    words = nltk.word_tokenize(text)
    
    # Remove stopwords
    words = [w for w in words if w not in stopwords.words('english')]
    
    # Stem the words
    stemmer = PorterStemmer()
    words = [stemmer.stem(w) for w in words]
    
    # Join the words back into a string
    text = ' '.join(words)
    return text

def predict_label(text):
    cleaned_text = clean_text(text)
    transformed_text = cv.transform([cleaned_text])
    prediction = model.predict(transformed_text)
    return prediction[0]

@app.route('/predict', methods=['POST'])
def predict():
    text = request.json.get('text', '')
    predicted_label = predict_label(text)
    print(predicted_label)
    return jsonify({'predicted_label': predicted_label})


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, threaded=True)