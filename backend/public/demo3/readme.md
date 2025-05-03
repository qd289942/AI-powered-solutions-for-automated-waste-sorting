# Socket.IO Demo
Dies ist nur eine Demo, um die Arbeitsweise von Socket.IO zu veranschaulichen und eine Integration bestehnde Projekt zu demonstrieren.

Um die Demo zu testen muss das Projekt geklont werden, und die npm module installiert werden, siehe dazu readme für das Backend [klick](../../readme.md)

Anschließend muss der server gestartet werden `npm start`
Dann ruft man über einen Webbrowser die beiden folgenden links auf (der Port muss ggf. geändert werden, falls nicht der default Port verwendet wurde.)
* [https://localhost:3000/demo1](https://localhost:3000/demo1)
* [https://localhost:3000/demo3](https://localhost:3000/demo3)

Wenn man nun in Demo 1 ein Bild hochlädt und dort Müll erkannt wird, erhält Demo 3 ein Signal und Schaltet seinen Aktor an. Dieser wird dann automatisch nach 3 Sekunden wieder ausgeschaltet, um den Luftstoß zu signalisieren.
Derzeit ist noch zu definieren, wie die Das Objekt des Servers aussehen soll. Hier sollten wir uns auf einen Interface einigen. 
Anschließend stellt sich noch die Frage, ob für alle Aktoren Befehle empfangen möchte, oder ob das Backend für einen Aktor eine
eigene Route erstellen soll, auf die man sich dann verbindet. 


# Socket.IO Python Demo

Für die Python Version muss natürlich Pyhton installiert sein.
Anschließend muss noch das Socket.IO Modul installiert werden `pip install "python-socketio[client]"`.
Bevor nun der Python client gestartet wird sollte das Backend gestartet werden, dazu wie in der [Readme des backends verfahren](../../readme.md)
anschließend kann der test mittels `py.exe .\socketio-test.py` aus dem order backend\public\demo3 getartet werden.

Die Konsole sollte offen bleiben.
Öffnet man nun [https://localhost:3000/demo3](https://localhost:3000/demo3)

Weitere Referenzen unter: 
https://python-socketio.readthedocs.io/en/latest/client.html#installation


# Registrierung eines Aktores auf eine Socket.IO Route
Damit ein Aktor über eine erkannte Müllklasse informiert werden kann, muss sich dieser auf seine eigene Socket verbinden.
Jeder Aktor erhält somit seine eigene Socket.io Route, über die informiert wird. 
Die Route ist wie folgt aufgebaut: 

```trash_detected/${actuatorId}```

Ein Beispiel für den Aktor mit der ID 1 wäre

trash_detected/1

Ein Beispiel für den Aktor mit der ID 15 wäre
trash_detected/15

in form von Python Code könnte dies so aussehen: 
```python
sio.on('trash_detected/1', trigger_actuator)
```



