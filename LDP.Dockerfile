# Use an official Python runtime as a parent image
FROM python:3.8

# Set the working directory
WORKDIR .

# Copy requirements.txt to the working directory
COPY requirements2.txt ./

# Install app dependencies
RUN pip install fastapi[all] uvicorn
RUN pip install requests sondehub

# Bundle app source
COPY . /app

# Define the command to run your app
CMD ["python3", "LDP.py"]