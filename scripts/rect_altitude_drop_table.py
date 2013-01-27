#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import psycopg2

def main(argv):
    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    cur = conn.cursor()
    
    cur.execute("""
    DROP TABLE altitude_rects
    """)
    conn.commit()
    
if __name__ == "__main__":
    main(sys.argv[1:])
    