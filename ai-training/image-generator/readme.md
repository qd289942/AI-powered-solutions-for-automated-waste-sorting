# Kurzbeschreibung

Der Imagegenerator erzeugt jede Sekunde einen Screenshot, von dem Bild, welches die Kamera gerade aufnimmt und speichert es im Format
640x640 px im Backend im unterordner ./images.

# Installation
1. Navigieren Sie in den Unterordner image-generator
2. führen Sie ein `npm i` aus, um die Node-Moduels zu installieren
3. Starten des Image-Generators mittels `npm start`
4. Der Image-Generator ist nun unter https://localhost:3001/ erreichbar


# Wechseln der Kamera
Der Image-Generator selbst besitzt keine eigene möglichkeit die Ausgewählte Kamera zu ädern. Hierfür muss auf die eingebauten funktionen des Browsers zurückgegriffen werden.

1. Google Chrome starten
2. https://localhost:3001 aufrufen
3. Richtige Kamera auswäheln
   1. Auf Kamera Symbol in der URL Leiste klicken

    ![alt text](docs/images/Kamera-Symbol.png)

   2. Manage
   
   ![alt text](docs/images/Manage.png)

   3. Auf das Kamera Dropdown klicken
   
   ![alt text](docs/images/Kamera-Dropdown.png)

   4. Richtige Kamera auswählen
   
   ![alt text](docs/images/richtige-kamera-auswählen.png)
   
   5. Seite neu laden