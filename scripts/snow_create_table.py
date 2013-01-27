#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import psycopg2

def main(argv):
    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    cur = conn.cursor()
    
    cur.execute("""
    CREATE TABLE snow_points (
        altitude int, -- altitude in meters
        date date, -- date, as a date
        value real -- snow coverage
    );
    """)
    cur.execute("""
    SELECT addGeometryColumn('snow_points', 'the_geom', 4326, 'POINT', 2);
    """)
    cur.execute("""
    ALTER TABLE snow_points ADD CONSTRAINT date_geo UNIQUE (date, the_geom);
    """)
    cur.execute("""
    CREATE INDEX geo_index on snow_points USING GIST (the_geom);
    """)
    cur.execute("""
    CREATE INDEX date_index ON snow_points (date);
    """)
    conn.commit()
    
if __name__ == "__main__":
    main(sys.argv[1:])
    