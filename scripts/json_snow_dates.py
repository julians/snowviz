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
    SELECT date, sum(value)
    FROM snow_points
    GROUP BY date
    ORDER BY date;
    """)
    
    data = {
        "datapoints": [],
        "max_value": 0
    }
    
    for row in cursor.fetchall():
        data["datapoints"].append([row[0], int(row[1])])
        if int(row[1]) > data["max_value"]:
            data["max_value"] = int(row[1])
 
    if web:
        output_file_name = "data_snow_dates.js"
    else:
        output_file_name = "data_snow_dates.json"
        
    output_file = open(output_file_name, "w")
    if web:
        output_file.write("var %s = %s;" % ("data_snow_dates", json.dumps(data, indent=4, default=date_handler)))
    else:
        output_file.write(json.dumps(data, indent=4, default=date_handler))
    output_file.close()

def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj
    
if __name__ == "__main__":
    main(sys.argv[1:])
    