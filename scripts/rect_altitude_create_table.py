#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import psycopg2

def main(argv):
    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    cur = conn.cursor()
    
    cur.execute("""
    CREATE TABLE altitude_rects (
        altitude int -- altitude in meters
    );
    """)
    cur.execute("""
    SELECT addGeometryColumn('altitude_rects', 'the_geom', 4326, 'POLYGON', 2);
    """)
    cur.execute("""
    CREATE INDEX altitude_rect_geo_index on altitude_rects USING GIST (the_geom);
    """)
    cur.execute("""
    CREATE INDEX altitude_rect_index ON altitude_rects (altitude);
    """)
    conn.commit()
    
if __name__ == "__main__":
    main(sys.argv[1:])
    