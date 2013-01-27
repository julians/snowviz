#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import psycopg2
import datetime
import json

def main(argv):
    web = (len(argv) and argv[0] == "web")
    
    # connect to the database
    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT ST_AsLatLonText(the_geom, 'D.DDDDDDDDDD') AS coords, sum(value)
    FROM snow_points
    GROUP BY the_geom
    """)
    
    data = {
        "datapoints": [],
        "max_value": 0
    }
    
    for row in cursor.fetchall():
        coords = row[0].split()
        data["datapoints"].append([
            float(coords[0]),
            float(coords[1]),
            row[1]
        ])
        if row[1] > data["max_value"]:
            data["max_value"] = row[1]
        
    if web:
        output_file_name = "data_snow_coords.js"
    else:
        output_file_name = "data_snow_coords.json"
        
    output_file = open(output_file_name, "w")
    if web:
        output_file.write("var %s = %s;" % ("data_snow_coords", json.dumps(data, indent=4)))
    else:
        output_file.write(json.dumps(data, indent=4))
    output_file.close()
    
if __name__ == "__main__":
    main(sys.argv[1:])
    