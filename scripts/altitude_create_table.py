#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import psycopg2

def main(argv):
    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    cur = conn.cursor()
    
    cur.execute("""
    CREATE TABLE altitude_points (
        altitude int -- altitude in meters
    );
    """)
    cur.execute("""
    SELECT addGeometryColumn('altitude_points', 'the_geom', 4326, 'POINT', 2);
    """)
    cur.execute("""
    CREATE INDEX altitude_geo_index on altitude_points USING GIST (the_geom);
    """)
    cur.execute("""
    CREATE INDEX altitude_index ON altitude_points (altitude);
    """)
    conn.commit()
    
if __name__ == "__main__":
    main(sys.argv[1:])
    