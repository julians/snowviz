#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import re
import psycopg2

def main(argv):
    try:
        input_file = open(argv[0], "r")
    except:
        print "Elevation data file not found"
        sys.exit(1)
    
    data = read_lines(input_file)
    print len(data["data"])

    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    cur = conn.cursor()
    
    for item in data["data"]:
        cur.execute("""INSERT INTO altitude_points (altitude, the_geom) VALUES (%s, ST_GeomFromText(%s, 4326))""", (item[2], 'POINT(%s %s)' % (item[0], item[1])))
    
    conn.commit()

def read_lines(input_file):
    variables = {
        "ncols": 0,
        "nrows": 0,
        "xllcorner": 0,
        "yllcorner": 0,
        "cellsize": 0,
        "NODATA_value": 0
    }
    
    line_splitter = re.compile(r"\s+")
    
    x = None
    y = None
    
    rows = []
    
    for line in input_file:
        split_line = line_splitter.split(line.strip())
        
        if len(split_line) > 1:
            if split_line[0] in variables.keys():
                variables[split_line[0]] = float(split_line[1])
                x = variables["xllcorner"]
                y = variables["yllcorner"]
            else:
                x = variables["xllcorner"]
                for item in split_line:
                    if item != variables["NODATA_value"]:
                        rows.append([
                            x,
                            y,
                            convert_to_value(item)
                        ])
                    else:
                        print "no data for this item"
                    x += variables["cellsize"]
                y += variables["cellsize"]
    
    return {
        "variables": variables,
        "data": rows
    }
    
def convert_to_value(s):
    value = None
    try:
        value = int(s)
    except:
        return None
    return value
    
if __name__ == "__main__":
    main(sys.argv[1:])
    