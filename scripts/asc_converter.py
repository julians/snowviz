#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import re
import csv
import json

def main(argv):
    mode = argv[0] # json or jsonweb or csv
    
    try:
        input_file = open("%s" % argv[1], "r")
    except:
        print "Oh noes, no input file!"
        sys.exit(1)

    if not (mode == "json" or mode == "jsonweb" or mode == "csv"):
        print "please choose a mode: either json or csv"
        sys.exit(1)
        
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
    
    i = 0
    
    rows = []
    
    for line in input_file:
        split_line = line_splitter.split(line)
        
        if len(split_line) > 1:
            if split_line[0] in variables.keys():
                variables[split_line[0]] = float(split_line[1])
                x = variables["xllcorner"]
                y = variables["yllcorner"]
            else:
                x = variables["xllcorner"]
                for item in split_line:
                    value = convert_to_value(item)
                    if value == 2:
                        if mode == "json" or mode == "jsonweb":
                            rows.append([
                                [y, x],
                                [y+variables["cellsize"], x+variables["cellsize"]]
                            ])
                        elif mode == "csv":
                            rows.append([
                                y,
                                x
                            ])
                    x += variables["cellsize"]
                    i += 1
                y += variables["cellsize"]
                                 
    print variables
    
    output_file_name = "%s" % argv[1].split("/")[-1].split(".")[0]
    
    if mode == "json":
        output_file = open("%s.%s" % (output_file_name, "json"), "w")
        output_file.write(json.dumps(rows, indent=4))
        output_file.close()        
    elif mode == "jsonweb":
        output_file = open("%s.%s" % (output_file_name, "js"), "w")
        output_file.write("var v%s = %s;" % (output_file_name, json.dumps(rows, indent=4)))
        output_file.close()
    elif mode == "csv":
        output_file = open("%s.%s" % (output_file_name, "csv"), "wb")
        csv_writer = csv.writer(output_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerows(rows)
        output_file.close()

def convert_to_value(s):
    value = None
    try:
        value = int(s)
    except:
        return None
    return value
    
if __name__ == "__main__":
    main(sys.argv[1:])
    