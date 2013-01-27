#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division

import sys
import psycopg2

def main(argv):
    conn = psycopg2.connect(database="snow", user="julian", host="/tmp/")
    conn.set_session(autocommit=True)
    cur = conn.cursor()
    
    print "Vacuuming table"
    cur.execute("""
    VACUUM FULL;
    """)
    print "done!"
    
if __name__ == "__main__":
    main(sys.argv[1:])
    