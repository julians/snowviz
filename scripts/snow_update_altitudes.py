#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import psycopg2
import random

def main(argv):
    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    cur = conn.cursor()
    
    cur.execute("""
    UPDATE snow_points
    SET altitude = (
        SELECT altitude
        FROM altitude_map
        WHERE altitude_map.the_geom = snow_points.the_geom
    )
    WHERE snow_points.altitude IS NULL;
    """)
    
    conn.commit()
    
if __name__ == "__main__":
    main(sys.argv[1:])
    