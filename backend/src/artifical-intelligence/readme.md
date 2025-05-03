# Aufbau des Interfaces

Das Interface IArtificialIntelligence besteht aus den zwei öffentlichen Methoden getDetectionCapabilities und detectImage.
Die Methode getDetectionCapabilieties dient dazu abzufragen, welche Trashlabels die KI erzeugen kann. Dies kann sinnvoll sein,
wenn mehrere KIs vorhanden sind, die auf die auf verschiedene Arten von Müll spezialisiert wurden. Beispielsweise könnte man
eine KI dazu verwenden, um explizit Plastik zu erkennen. Eine andere Hingegen für Glas und eine weitere für Metall.
Über die detectionCapabilites kann also ausgewertet werden, auf welche Arten von Müll die KI reagiert.
In dem Fall unseres selbst trainierten Yolo-Modells sind diese: 

   * cardboard
   * glass
   * metal
   * paper
   * plastic
   * trash

Die zweite Methode detectImage dient der eigentlichen Auswertung des Bildes durch die KI. 
