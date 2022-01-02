# Wipelot

# How to run

docker-compose up --build

Web server runs on port 3000.
The page will be available at localhost:3000

# Description

### Simulator

Simulator simulating the IoT devices which produce socketUniqueNumber, value and timestamp each second. The device count can be changed by passing parameter as environment variables.

### Listener

Listener has two purposes; Listening to IoT devices over a socket connection and inserting them into the queue on RabbitMQ Server.

### Middleware

Middleware has also two purposes; Consuming queues on RabbitMQ Server and sending them to the clients.

### User Interface

Users can view connected devices and data produced by them.
Once the user connects the page, all incoming data will be saved in order to show them, mean and standard deviation of the data.

### Logs

Log files will be created at the root directory after containers are up and running.
