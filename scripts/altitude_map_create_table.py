#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import psycopg2

def main(argv):
    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    cur = conn.cursor()
    
    cur.execute("""
    CREATE TABLE altitude_map (
        altitude int -- altitude in meters
    );
    """)
    cur.execute("""
    SELECT addGeometryColumn('altitude_map', 'the_geom', 4326, 'POINT', 2);
    """)
    cur.execute("""
    ALTER TABLE altitude_map ADD CONSTRAINT alt_map_unique UNIQUE (the_geom);
    """)
    cur.execute("""
    CREATE INDEX alt_map_geo_index on altitude_map USING GIST (the_geom);
    """)
    conn.commit()
    
if __name__ == "__main__":
    main(sys.argv[1:])
    