# Prototyp Objektverfolgung (object-tracking)

In diesem Teilprojekt sollen Lösungsansätze für das Problem object-tracking (Wiederkennung von Objekten über mehrere Frames hinweg) evaluiert werden.

Da dieses Teilprojekt einen reinen Prototyp-Charakter hat wurden die Skripte unter zuhilfenahme von ChatGPT 4o von OpenAI in Grundzügen erstellt und händisch
in seiner Funktionsweise komplettiert.

Beim Ordner 

## Vorbereitung der Umgebung

Das Projekt muss in `PyCharm Professional` geöffnet werden, dieses sollte nach dem öffnen automatisch, eine virtuelle Umgebung `venv` erstellen,

Falls dies nicht der Fall ist muss diese manuell erstellt werden, Python `3.12.3` ist Voraussetzung.

Für die Evaluation wurde yolov5 (Ein vortrainiertes Model mit niedriger Inferenzzeit) verwendet, dies muss mittels folgendem Befehl ins Hauptverzeichnis gecloned werden:

`git clone https://github.com/ultralytics/yolov5`

Dann müssen Folgende Abhängigkeiten müssen mittels folgender Befehle unter Verwendung von `pip` installiert werden

```
pip install -r yolov5/requirements.txt
pip install opencv-python opencv-python-headless ultralytics deep_sort_realtime
pip install numpy opencv-python
pip install torch torchvision
```

Nach diesem Schritt sind alle Abhängigkeiten installiert.

## Vorbereitung und Ausführung der Evaluation mittels Projekt-Skripten

Um das Projekt zu benutzen müssen zunächst 3 Videos unter `./video` abgelegt werden.

Es gibt folgende Python-Skripte mit ihren jeweiligen Teilaufgaben welche in der folgenden Reihenfolge ausgeführt werden müssen:

* `split_to_frames.py`
  * zerschneidet die in `video` abgelegten Videos in einzelne Frames, welche unter `./frames` abgelegt werden
* `detect_objects.py`
  * Nutzt ein KI-Model um object-detection auf die in `./frames` gespeicherten Bilder auszuführen und schreibt die Bilder inklusive Klassifizierung
und bounding-box in `./detection`. Hierbei handelt es sich lediglich um einen Schritt der bessere Nachvollziehbarkeit der Effektivität des object-trackings gewährleisten soll.
* `track_objects.py`
  * Nutzt ein KI-Model (es muss dasselbe wie im vorherigen Schritt sein) um object-detection und anschließend object-tracking durchzuführen.
  * Das Ergebnis (Bilder mit BBoxes und IDs) wird unter `./tracking` abgelegt.
* `create_videos.py`
  * Nutzt die unter `./tracking` abgelegten Bilder und erstellt daraus Videos zur besseren Veranschaulichung 

Am Ende stehen die im letzten Schritt erzeugten Videos unter `end_results` zur Verfügung.

In diesem Teilprojekt geht es aktuell um die qualitative Evaluation von object-tracking Ansätzen, daher werden aktuell keine Metriken zur Präzision
ermittelt.

## Quick-Demo

Unter dem Link https://drive.google.com/drive/folders/12NR1LaL0RtI5wm9HxKmUK7CR1UAvKl8M?usp=drive_link#
gibt es alle Dateien welche während einem Probelauf entstanden sind.

## Aktueller Stand

Zunächst wurde die Evaluation mittels einem nicht nachtrainierten `yolov5` durchgeführt.

Dabei zeigte sich, dass der bisherige Ansatz `DeepSort` qualitativ erfolgversprechend aussieht.

Der nächste Schritt besteht nun das object-tracking mittels eines angepassten models zu trainieren.

Die dafür nötigen Anpassungen sind zum jetzigen Zeitpunkt noch nicht final, aktuelle Versionen der modifizierten Skripte werden
unter `wip_aligned` abgelegt.