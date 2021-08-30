from __future__ import division, print_function
import sys
import os
import glob
import re
import numpy as np
import tensorflow as tf

from tensorflow.compat.v1 import ConfigProto
from tensorflow.compat.v1 import InteractiveSession

config = ConfigProto()
config.gpu_options.per_process_gpu_memory_fraction = 0.2
config.gpu_options.allow_growth = True
session = InteractiveSession(config=config)
# Keras
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Flask utils
from flask import Flask, redirect, url_for, request, render_template
from werkzeug.utils import secure_filename

# Define a flask app
app = Flask(__name__)

# Model saved with Keras model.save()
MODEL_PATH ='tomato_disease_classification_model_ver2_inception.h5'

# Loading our trained model
model = load_model(MODEL_PATH)


def model_predict(img_path, model):
    print(img_path)
    img = image.load_img(img_path, target_size=(224, 224))

    # Preprocessing the image
    x = image.img_to_array(img)
    ## Scaling
    x=x/255
    x = np.expand_dims(x, axis=0)
   

    preds = model.predict(x)
    preds=np.argmax(preds, axis=1)


    if preds==0:
        preds="Bacterial spot"
    elif preds==1:
        preds="Early blight"
    elif preds==2:
        preds="Late blight"
    elif preds==3:
        preds="Leaf mold"
    elif preds==4:
        preds="Septoria leaf spot"
    elif preds==5:
        preds="Spider mites"
    elif preds==6:
        preds="Target spot"
    elif preds==7:
        preds="Yellow leaf curl virus"
    elif preds==8:
        preds="Mosaic virus"
    else:
        preds="Healthy"
    return preds


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
        result=preds
        return result
    return None


if __name__ == '__main__':
    app.run(debug=True)
