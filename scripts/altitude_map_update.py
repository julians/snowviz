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
    DELETE FROM altitude_map;
    """)
    
    conn.commit()
    
    cur.execute("""
    INSERT INTO altitude_map (the_geom)
    SELECT DISTINCT ON (the_geom) the_geom
    FROM snow_points
    """)
    
    cur.execute("""
    UPDATE altitude_map
    SET altitude = (
        select altitude from altitude_points ORDER BY altitude_map.the_geom <-> altitude_points.the_geom LIMIT 1
    )
    WHERE altitude_map.altitude IS NULL;
    """)
    
    conn.commit()
    
if __name__ == "__main__":
    main(sys.argv[1:])
    