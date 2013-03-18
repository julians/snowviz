Setzt glaube ich, aufgrund von Postgres.app, mindestens Mac OS 10.7 vorraus.

### Postgres installieren

1. [Postgres.app](http://postgresapp.com/) runterladen und installieren
2. `/Applications/Postgres.app/Contents/MacOS/bin` zum `PATH` hinzufügen, z. B. durch Hinzufügen von 

	`export PATH="/Applications/Postgres.app/Contents/MacOS/bin:$PATH"`
	
	zu `~/.bash_login` oder was auch immer für euch die richtige Datei ist. Danach dann das Terminal neu starten.

### tilestream installieren

1. [homebrew](http://mxcl.github.com/homebrew/) installieren (unten auf der Seite steht ziemlich fett, wie man das macht)
2. Eventuell braucht man dafür XCode bzw. zumindest die Command Line Tools.
3. [tilestream](https://github.com/mapbox/tilestream) installieren (steht auch auf der Seite)

### Python-Abhängigkeiten installieren

1. `sudo easy_install pip`
	
	pip ist son Installationsprogramm, damit lassen sich Dinge schöner installieren, irgendwie, hab ich mal gelesen

2. `sudo pip install psycopg2`

	PostgreSQL-Library für Python
	
3. `sudo pip install flask`
	
	Mini-Framework für die API

### PostGIS-Abhängigkeiten installieren

1. `brew install libjpeg`

### Datenbank einrichten
	
1. Mit Postgres verbinden

	`psql`
	
2. User julian erstellen, weil ich zu faul bin, alle Skripte zu ändern

	`CREATE USER julian WITH SUPERUSER;`
	
3. Neue Datenbank für user julian erstellen:
	
	`CREATE DATABASE julian;`
	
4. Abmelden

	`\q`
	
5. Als User julian anmelden

	`psql -U julian`
	   
6. Datenbank erstellen

	`CREATE DATABASE snow;`
 
7. Zur Datenbank wechseln

	`\connect snow`
 
8. Postgis-Erweiterung zur Datenbank hinzufügen

	`CREATE EXTENSION postgis;`
	
9. Abmelden

	`\q`
	
Danach kann man sich mit `psql -U julian -d snow` auch direkt bei der Datenbank snow anmelden.

### Tabellen erstellen, Datenbanken importieren etc.

1. `cd scripts`
2. `python altitude_create_table.py`

	Erstellt die Tabelle für die Höhendaten

3. `python altitude_import.py [richtiger Pfad]/DEM/zerafshan_mod_dem.asc`

	Importiert die Höhendaten aus der Datei. Nicht, dass wir im Moment was damit machen würden, aber egal.

4. `python snow_create_table.py`

	Tabelle für Schneedaten.

5. `python snow_import.py [richtiger Pfad]/CloudFree`

	Importiert alle Dateien im Order der Schneedaten. Kann durchaus ne Viertelstunde dauern.
	
	*Anmerkung: bei langen Pfadnamen oder welchen mit Leerzeichen kommt’s anscheinend zu Problemen. Am besten den CloudFree-Ordner in den scripts-Ordner kopieren und dann `python snow_import CloudFree/`. Danach den CloudFree-Ordner wieder löschen.*
	
6. `python altitude_map_create_table.py`
	
	Erstellt eine Tabelle, die die Schneekoordinaten auf die Höhendaten mapt.
	
7. `python altitude_map_update.py`
	
	Mapt die Höhen der Schneepunkte auf die der Höhendaten und speichert das ganze in einer Tabelle.
	
8. `python snow_update_altitudes.py`
	
	Schreibt die Höhendaten in die snow_points-Tabelle.
	
8. `python vacuum.py`

	Optimiert die Datenbank, damit alles ein wenig schneller läuft. Dauert auch ein wenig.
	
### API starten

1. `cd Skripte/api`
2. `python api.py`
3. Das Konsolenfenster offen lassen, mit `ctrl+c` kann die API wieder beendet werden

API = »API«, also sehr stark in Anführungszeichen.

### Tilestream starten

1. Die Tiles müssen unter `Dokumente/MapBox/tiles` sein.
2. Ins Tilestream-Verzeichnis wechseln
3. `node ./index.js`

### Fertig