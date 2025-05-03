# Installation des Backends

> Voraussetzungen für die Installation:
> * [Node.js](https://nodejs.org/en/download)
> * [Docker](https://www.docker.com/products/docker-desktop/)

1. Klonen Sie das Repository mittels git clone
```bash
git clone https://code.dbis-pro1.fernuni-hagen.de/fpniteus/63184-fapra-ki-thema-1.git
```

2. Navigieren Sie in das Verzeichnis backend 
```bash
cd backend
```

3. Installieren Sie die Node-Modules mittels
```bash
npm install
```

4. Kopieren einer benötigten dll in das ein Tensorflow unterverzeichnis. Weitere Informationen können diesbezüglich [Fehler-nach-Installation](#Fehler-nach-Installation)
```bash
cp .\node_modules\@tensorflow\tfjs-node\deps\lib\tensorflow.dll .\node_modules\@tensorflow\tfjs-node\lib\napi-v8\
cp .\node_modules\@tensorflow\tfjs-node\deps\lib\tensorflow.dll .\node_modules\@tensorflow\tfjs-node-gpu\lib\napi-v8\
```

Die folgenden Schritte sind Optional und werden nur benötigt, wenn die KIs auf der GPU Laufen sollen.

Voraussetzungen: 
* NVIDIA Grafikkarte
The following NVIDIA® software are only required for GPU support.

* Windows Native Requires Microsoft Visual C++ Redistributable for Visual Studio 2015, 2017 and 2019
NVIDIA® GPU drivers
* >= 525.60.13 for Linux
* >= 528.33 for WSL on Windows (Falls keine native Ausführung auf Windows gewünscht ist.)
* CUDA® Toolkit 12.3.
* cuDNN SDK 8.9.7.
* (Optional) TensorRT to improve latency and throughput for inference.

[Eine Installationsanleitung für CUDA kann hier entnommen werden](https://www.tensorflow.org/install/pip#windows-native_1)

# Starten des Backends
Nach der [Installation](#Installation-des-Backends) sollte zuerst die Datenbank gestartet werden. Navigieren Sie hierzu in den Unterordner backend und führen `docker-compose up` aus. Es sollte nun ein docker-container mit der Datenbank gestartet werden. Anschlißeend kann mittels `npm start` das Node.js backend gestartet werden.

# Ausführen von Testfällen
Die Testfälle können mittels des Befehls `npm test` im Untterordner backend ausgeführt werden.

# Fehler nach Installation
Dieser Fehler trat nur unter Windows (x86_64) auf. Die Installation unter macOS M1 ARM verlief fehlerfrei.


```
node:internal/modules/cjs/loader:1189
return process.dlopen(module, path.toNamespacedPath(filename));
```

Nach der Installation wurde ein Fehler angezeigt, dass ein Modul nicht geladen werden konnte.

hierzu muss eine dll in den Entsprechenden Ordner kopiert werden.

```bash
cp .\node_modules\@tensorflow\tfjs-node\deps\lib\tensorflow.dll .\node_modules\@tensorflow\tfjs-node\lib\napi-v8\
```

[Quelle](https://github.com/tensorflow/tfjs/issues/8176)

# Docker einrichten & DB aufsetzen

`docker compose up -d`

DB Index über Kibana http://127.0.0.1:5601/app/dev_tools#/console anlegen:

```http request
PUT detected_garbage
{
  "mappings": {
    "properties": {
      "bounding_box": {
        "properties": {
          "height": {
            "type": "float"
          },
          "width": {
            "type": "float"
          },
          "x": {
            "type": "float"
          },
          "y": {
            "type": "float"
          }
        }
      },
      "detection_certainty": {
        "type": "float"
      },
      "detection_class": {
        "type": "keyword"
      },
      "detection_timestamp": {
        "type": "date"
      },
      "img_path": {
        "type": "keyword"
      },
      "tracking_id": {
        "type": "keyword"
      },
      "x_detection_threshold" : {
        "type": "float"
      },
      "ai_id" : {
        "type": "long"
      },
      "operation_section_id" : {
        "type": "long"
      }
    }
  }
}
```

Ist der Index bereits vorhanden, kann er mithilfe des folgendes Requests gelöscht werden,
dabei gehen alle bereits gespeicherten Daten verloren:

```http request
DELETE detected_garbage
```

Möchte man nur die gespeicherten Daten entfernen ohne den Index selbst zu entfernen kann folgender Request genutzt werden:

```
POST detected_garbage/_delete_by_query
{
    "query": {
        "match_all": {}
    }
}
```

## Rebuild der Container durchführen
Falls Änderungen an den Cotnainers durchgeführt werden kann es notwendig sein einen rebuild durchzuführen.
Dies ist beispielsweise der Fall, wenn das KI-Modell ausgetauscht wurde, jedoch noch den gleichen Namen besitzt.
Führen Sie in diesem Fall folgenden Befehl aus: 

`npm run rebuild-container`

# Eindung weiterer KI-Modelle

Zur Einbinden weiterer KI-Modelle müssen in das Tensorflow.JS-Format konvertiert werden.
Hierfür kann der Konverter unter ai-training/converter genutzt werden. Lesen Sie die dort vonrhandene [readme.md](../ai-training/converter/readme.md)
für die Konvertierung.

Anschließend erhalten Sie ein verzeichnis mit dem Namen des exportierten Modells. Dieses sollte einer gewissen Anzahl an shard-Dateinen bestehen, eine metadata.yml sowie eine model.json enthalten.

Kopieren Sie dieses Verzeichnis nach `backend/src/models/`
Anschließend kann eine neue Instanz der Klasse YoloV8 erzeugt werden.
Übergeben Sie dem Konstruktor den Namen des Ordners (modelName).
Zuletzt muss das erzeugte Objekt, dem ObjectDetectionRouter mit den anderen KIs übergeben werden.

