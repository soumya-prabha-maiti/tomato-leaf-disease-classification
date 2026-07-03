# Base image
FROM python:3.11

# Set the working directory 
WORKDIR /app

# Install dependencies
COPY requirements.txt /app
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app

# Create the uploads directory
RUN mkdir /app/uploads

# Set permissions for uploads directory
RUN chmod 777 /app/uploads

# Expose port 7680
EXPOSE 7680

# Start the gunicorn server
CMD ["gunicorn", "-b", "0.0.0.0:7680","app:app"]