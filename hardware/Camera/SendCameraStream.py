import os
import requests
import time
import argparse
import cv2

# Main
def main(url, operation_section_id, time_to_wait, token):
    # Kamera settings
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 640)

    # Ende, wenn Kamera nicht erreicht wird
    if not cap.isOpened():
        print("Kamera konnte nicht geöffnet werden.")
        exit()
    
    # Verzeichnes, in dem das Skript liegt
    current_directory = os.path.dirname(os.path.abspath(__file__))
    # Verzeichnis, in dem die Bilder liegen
    images_directory = os.path.join(current_directory, 'Bilder')
    # Verzeichnis erstellen, falls es nicht existiert
    os.makedirs(images_directory, exist_ok=True)

    try:
        while True:
            if save_image(images_directory, cap):
                send_image(images_directory, url, operation_section_id, token)
            time.sleep(time_to_wait)

    except KeyboardInterrupt:
        print("Abbruch")

    finally:
        cap.release()
        cv2.destroyAllWindows()

# Save image
def save_image(images_directory, cap):
    ret, frame = cap.read()
    if not ret:
        print("Fehler beim Lesen des Frames")
        return False
    img_name = os.path.join(images_directory, f"image.jpg")
    cv2.imwrite(img_name, frame)
    print(f"{img_name} gespeichert")
    return True

# Send image
def send_image(images_directory, url, operation_section_id, token):
    newest_file = find_newest_jpg_file(images_directory)
    if newest_file is None:
        print("Kein Bild gefunden. Warte aufs nächste Bild ...")
        return
    files = {'image_file': open(newest_file, 'rb')}
    data = {'operationSectionId': operation_section_id}
    headers = {'authorization': token}

    try:
        response = requests.post(url, files=files, data=data, headers=headers)
    finally:
        files['image_file'].close()
    
    if response.status_code == 200:
        print(f"Datei {newest_file} erfolgreich versendet.")
        os.remove(newest_file)
        print(f"Datei {newest_file} gelöscht.")
    else:
        print(f"Fehler beim Senden von Datei {newest_file} an die API. Status Code: {response.status_code}. Status Text: {response.text}")

# Find newest image in directory
def find_newest_jpg_file(directory):
    files = [os.path.join(directory, f) for f in os.listdir(directory) if f.lower().endswith('.jpg') and os.path.isfile(os.path.join(directory, f))]
    if not files:
        return None
    newest_file = max(files, key=os.path.getctime)
    return newest_file

# Start
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Nimmt Frame vom Kamera Stream und sendet es an den Backend API Endpunkt.')
    parser.add_argument('--url', type=str, default='http://localhost:3000/object-detection/detect', help='Die URL des API Endpunktes.')
    parser.add_argument('--operationSectionId', type=str, default='2', help='Die Nummer der operationSectionId. Standardwert ist 2.')
    parser.add_argument('--ttw', type=float, default='0.001', help='Zeit in Sekunden, bis das nächste Kamerabild verarbeitet wird.')
    parser.add_argument('--token', type=str, default='eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzIxMjM1NzcxfQ.EwMd7QQZUOEAteHzw27nGxAzNtALuPJOinV1zpWiDz7XLIit40kAEA4sPrEpKD5PhwEHv-lfh2dhKGRBplefNtCyuinrAd3d-loaF21GVD4ba-5ykXgqad0u3sTZIcJDBn19m01fa6nS2ClkEXOTd5seyxbAfuUeC5PBQEaVdl8rVg5edZLXizoix2tuGy1CTmrNRIF7X-5rEiNmga0l14Zf46ulVe7O9ssnNYh9ElWX7P30tYRFH_dJgxtEHBMcM5qu3levI1Gouh0VY5bO2SHIV_Q5XtXPRkksFNOJbeDDNmkfzrY2WGT8UvzSMcZkkAxHeEpkf45v8BauxkNfqeQfSNex0gdPB7fAtOSjfp01UOT6LjIbwQUPGiki65V0D7UhVor19ebUlkJMPbjnQdtUPNN4TyKgr-0fOAG-4w7WC9aocQy51FsOcRt-MYcpjSs_2sp67Kirv5rv3-FatT_v054QkNRSwFsZ2zcpav55eIyJVeYuOq1L-o74Te3T2mnHQQ2ez7xPQJniR1iscoo1fzK-PxdvEc6WrsGVea9x9Q6N-OfVuSXfpAEqD0yGki785kh4wQKNh-JkuUmmiBMY-lmyXwIZKdxVSpQnv7zfAynfafzazIle-A27fi0_nmW38Y6_3QJaCngUbcpQBDxMVdZaC56RbmOFAaGBsyI', help='Der Authentifizierunstoken.')

    args = parser.parse_args()

    print(args)
    main(args.url, args.operationSectionId, args.ttw, args.token)