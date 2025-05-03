import socketio

sio = socketio.Client(ssl_verify=False, )

@sio.event
def connect():
    print('connection established')

@sio.event
def trigger_actuator(data):
    print('message received with ', data)

@sio.event
def disconnect():
    print('disconnected from server')

sio.connect('http://localhost:3000', )
sio.on('trash_detected/1', trigger_actuator)
sio.wait()