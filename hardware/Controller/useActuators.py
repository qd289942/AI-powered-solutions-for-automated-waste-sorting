import socketio
import RPi.GPIO as GPIO
import time
import argparse
import logging

actuator1Pin = 17
actuator2Pin = 27

sio = socketio.Client(ssl_verify=False, )

def setup():
    logging.info(f"Setup")
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(actuator1Pin, GPIO.OUT, initial=GPIO.HIGH)
    GPIO.setup(actuator2Pin, GPIO.OUT, initial=GPIO.HIGH)

@sio.event
def connect():
    logging.info(f"Verbindung hergestellt")

@sio.event
def my_message(data):
    logging.info(f"Nachricht erhalten: ", data)

@sio.event
def disconnect():
    logging.info(f"Verbindung zum Server verloren")

def n1(data):
    logging.info(f"{data['predictionClass']} start")
    GPIO.output(actuator1Pin, GPIO.LOW)
    time.sleep(1.5)
    logging.info(f"{data['predictionClass']} end")
    GPIO.output(actuator1Pin, GPIO.HIGH)

def n2(data):
    logging.info(f"{data['predictionClass']} start")
    GPIO.output(actuator2Pin, GPIO.LOW)
    time.sleep(1.5)
    logging.info(f"{data['predictionClass']} end")
    GPIO.output(actuator2Pin, GPIO.HIGH)

def main(actuatorId1, actuatorId2):
    sio.connect('http://192.168.22.24:3000', )
    sio.on(f"trash_detected/{actuatorId1}", n1)
    sio.on(f"trash_detected/{actuatorId2}", n2)
    sio.wait()

def destroy():
    GPIO.output(actuator1Pin, GPIO.HIGH)
    GPIO.output(actuator2Pin, GPIO.HIGH)

    GPIO.cleanup()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Stellt Verbindung zwischen Actuators und Backend her und gibt Auslösesignal an Actuators.')
    parser.add_argument('--actuatorId1', type=str, default='1', help='Die Id des ersten Actuators.')
    parser.add_argument('--actuatorId2', type=str, default='2', help='Die Id des zweiten Actuators.')
    
    args = parser.parse_args()

    logging.basicConfig(
    format='[%(asctime)s] %(message)s',
    datefmt='%d.%m.%Y %H:%M:%S',
    level=logging.INFO)

    logging.info(args)

    setup()
    try:
        main(args.actuatorId1, args.actuatorId2)
    except KeyboardInterrupt:
        destroy()