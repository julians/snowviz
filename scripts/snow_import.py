#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import re
import psycopg2
import glob
import datetime

def main(argv):
    # connect to the database
    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    
    # get all files for the given path
    globpath = argv[0].strip("/")
    
    # loop through and import them
    for filename in glob.glob("%s/*.asc" % globpath):
        import_file(filename, conn)
    
def import_file(filename, conn):
    print "Importing %s" % filename
    
    # get the cursor for the database connection
    cursor = conn.cursor()
    
    # figure out what date the data is for
    year = int(filename.split("/")[-1][0:4])
    day = int(filename.split("/")[-1][4:7])
    start = datetime.date(year, 1, 1)
    filedate = start + datetime.timedelta(days=day-1)
    print "data is for %s" % filedate.isoformat()
    
    # try to open the file
    try:
        input_file = open(filename, "r")
    except:
        print "could not open file"
        sys.exit()
    
    # variables such as grid size etc,
    # to be filled from the file    
    variables = {
        "ncols": 0,
        "nrows": 0,
        "xllcorner": 0,
        "yllcorner": 0,
        "cellsize": 0,
        "NODATA_value": 0
    }
    
    x = None
    y = None
    i = 0
    
    # we use this regex to split up the line into individual strings
    line_splitter = re.compile(r"\s+")
    
    placeholders = []
    values = []
    unsaved = False
    
    for line in input_file:
        # strip away superflous spaces and newlines,
        # split line by spaces
        split_line = line_splitter.split(line.strip())
        
        if len(split_line) > 1:
            if split_line[0] in variables.keys():
                # check if the first string from the split line is one of the variables we’re looking for,
                # if so, set it
                variables[split_line[0]] = float(split_line[1])
                # set the x and y coords for the first point
                x = variables["xllcorner"]
                y = variables["yllcorner"]
            else:
                # this is a line with data points
                # the grid is ordered left to right, top down,
                # one line in the file equals one row in the grid.
                # We’re at the beginning of the row, so set x to the leftmost point
                x = variables["xllcorner"]
                # loop through the columns in the row:
                for item in split_line:
                    # if the value is valid, convert it to a number and save it to the db
                    if item != variables["NODATA_value"]:
                        value = convert_to_value(item)
                        if value == 2:
                            placeholders.append("(%s, %s, ST_GeomFromText(%s, 4326))")
                            values.extend([filedate, 1, 'POINT(%s %s)' % (x, y)])
                            unsaved = True
                            
                            # and also count how many values we got
                            i += 1
                    else:
                        print "no data for this item"
                    # increment x, because we’re looping through the columns
                    x += variables["cellsize"]
                # increment y, because the next line’s gonna be one row down
                y += variables["cellsize"]
                
                if (i % 5000 == 0) and unsaved:
                    save_to_db(cursor, placeholders, values)
                    unsaved = False
                    placeholders = []
                    values = []
                    
    if unsaved:
        save_to_db(cursor, placeholders, values)
    # commit the changes we made to the database
    conn.commit()
    print "%d coordinates imported" % i    

def save_to_db(cursor, placeholders, values):
    placeholder_string = ",".join(placeholders)
    query = """
        INSERT INTO snow_points (date, value, the_geom)
        VALUES %s
    """ % placeholder_string
    
    cursor.execute(query, values)
    
def convert_to_value(s):
    value = None
    try:
        value = int(s)
    except:
        return None
    return value
    
if __name__ == "__main__":
    main(sys.argv[1:])
    