#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import psycopg2
import datetime
from collections import defaultdict
from dateutil import parser
from flask import Flask
from flask import request
app = Flask(__name__)

# should eventually be calculated from the area
max_snow_points = 169996
cellsize = 0.0050865689142654

@app.route("/")
def hello():
    return "Hello!"
    
@app.route('/date/<datestring>')
def bydate(datestring):
    thedate = parser.parse(datestring).date()
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("""
    SELECT ST_AsLatLonText(the_geom, 'D.DDDDDDDDDDD') AS coords FROM snow_points WHERE date = %s;
    """, (thedate,))
    
    data = {
        "date": thedate,
        "cellsize": cellsize,
        "points": []
    }
    for row in cur.fetchall():
        coords = row[0].split()
        data["points"].append([
            float(coords[0]),
            float(coords[1]),
            1
        ])
    
    output = json.dumps(data, indent=4, default=date_handler)
    if request.args.get("callback"):
        output = "%s(%s);" % (request.args.get("callback"), output)
    
    return output

@app.route("/daterange")
def bydaterange():
    startdate = request.args.get("startdate", False)
    enddate = request.args.get("enddate", False)
    
    try:
        startdate = parser.parse(startdate).date()
    except Exception, e:
        return "error"
    
    try:
        enddate = parser.parse(enddate).date()
    except Exception, e:
        return "error"
    
    delta = enddate - startdate
    # need to add one day because it’s a range *including* both days
    delta += datetime.timedelta(days=1)
    
    days = [startdate + datetime.timedelta(days=x) for x in range(0, delta.days)]
    
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT ST_AsLatLonText(the_geom, 'D.DDDDDDDDDDD') AS coords, SUM(value)
        FROM snow_points
        WHERE date BETWEEN %s AND %s
        GROUP BY coords;
    """, (startdate, enddate))
    
    data = {
        "startdate": startdate,
        "enddate": enddate,
        "max_snow_absolute": None,
        "max_snow_relative": None,
        "days": days,
        "number_of_days": delta.days,
        "cellsize": cellsize,
        "points": []
    }
    
    for row in cur.fetchall():
        coords = row[0].split()
        data["points"].append([
            float(coords[0]),
            float(coords[1]),
            int(row[1]),
            row[1]/delta.days
        ])
        if data["max_snow_absolute"] < row[1]:
            data["max_snow_absolute"] = int(row[1])
            data["max_snow_relative"] = row[1]/delta.days
    
    output = json.dumps(data, indent=4, default=date_handler)
    if request.args.get("callback"):
        output = "%s(%s);" % (request.args.get("callback"), output)
    
    return output

@app.route("/graph")
def graph():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT date, CAST(FLOOR(altitude / 500)*500 AS INT) as altitude_group, SUM(value)
        FROM snow_points
        GROUP BY date, altitude_group
        ORDER BY date;
    """)
    
    data = {
        "startdate": None,
        "enddate": None,
        "altitude_ranges": None,
        "max_absolute_snow": None,
        "max_relative_snow": None,
        "days": [],
        "max_possible_snow_points": max_snow_points
    }
    
    current_date = None
    snow_for_current_date = 0
    max_snow = 0
    altitude_ranges = set()
    
    for row in cur.fetchall():
        if row[0] != current_date:
            if snow_for_current_date > max_snow: max_snow = snow_for_current_date
            snow_for_current_date = 0
            current_date = row[0]
            data["days"].append({"date": row[0]})

        data["days"][-1][row[1]] = {
            "absolute": row[2],
            "relative_to_area": row[2]/max_snow_points
        }
        altitude_ranges.add(int(row[1]))
        snow_for_current_date += row[2]
    
    data["max_absolute_snow"] = max_snow
    data["max_relative_snow"] = max_snow/max_snow_points
    data["altitude_ranges"] = sorted(list(altitude_ranges))
    data["startdate"] = data["days"][0]["date"]
    data["enddate"] = data["days"][-1]["date"]
    
    output = json.dumps(data, indent=4, default=date_handler)
    if request.args.get("callback"):
        output = "%s(%s);" % (request.args.get("callback"), output)
    
    return output

@app.route('/altitudes')
def altitudes():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("""
    SELECT ST_AsLatLonText(the_geom, 'D.DDDDDDDDDDD') AS coords FROM altitude_points;
    """)
    
    data = {
        "cellsize": 0.005086568914237,
        "points": []
    }
    for row in cur.fetchall():
        coords = row[0].split()
        data["points"].append([
            float(coords[0]),
            float(coords[1])
        ])
    
    output = json.dumps(data, indent=4)
    if request.args.get("callback"):
        output = "%s(%s);" % (request.args.get("callback"), output)
    
    return output


def connect_db():
    return psycopg2.connect(database="snow", user="julian", host="/tmp/")

def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj
    
if __name__ == "__main__":
    app.debug = True
    app.run()