import glob
import os
import re
import sys

import numpy as np
from flask import Flask, jsonify, redirect, render_template, request, url_for
from tensorflow.compat.v1 import ConfigProto, InteractiveSession
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename

config = ConfigProto()
config.gpu_options.per_process_gpu_memory_fraction = 0.2
config.gpu_options.allow_growth = True
session = InteractiveSession(config=config)

# Define a flask app
app = Flask(__name__)

# Model saved with Keras model.save()
MODEL_PATH = 'tomato_disease_classification.h5'

# Loading our trained model
model = load_model(MODEL_PATH)


def model_predict(img_path, model):
    # Defining the labels
    labels=['Bacterial spot', 'Early blight', 'Late blight', 'Leaf mold', 'Septoria leaf spot', 'Spider mites', 'Target spot', 'Yellow leaf curl virus', 'Mosaic virus', 'Healthy']
    
    # Loading and preprocessing the image
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    # Scaling
    x = x/255
    x = np.expand_dims(x, axis=0)

    # Prediction
    preds = model.predict(x)

    # Generating output from predictions
    most_probable_index = np.argmax(preds, axis=1).item()
    percentages={}
    for i in range(len(labels)):
        percentages[labels[i]]=preds[0][i]*100
    result={
        'prediction':labels[most_probable_index],
        'percentages':percentages
    }
    return result


@app.route('/', methods=['GET'])
def index():
    # Main page
    return render_template('index.html')


@app.route('/predict', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        # Get the file from post request
        f = request.files['file']

        # Save the file to ./uploads
        basepath = os.path.dirname(__file__)
        file_path = os.path.join(
            basepath, 'uploads', secure_filename(f.filename))
        f.save(file_path)

        # Make prediction
        preds = model_predict(file_path, model)
        result = preds

        return jsonify(result)
    return jsonify({'error': 'Invalid request'})


if __name__ == '__main__':
    app.run(debug=True)
