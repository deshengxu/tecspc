# -*- coding: utf-8 -*-
#!/usr/bin/env python
#from selenium import webdriver
import argparse
import os
import os.path
import sys
from datetime import datetime

import json
from pprint import pprint
import glob
import linecache
import logging

def get_upload_commandline_options(logger):
    parser = argparse.ArgumentParser(description="Upload IRD data file options")
    parser.add_argument('-server', action="store", dest="server", required=False,
                        default='twx8.desheng.io',
                        help="server name")
    parser.add_argument('-protocol', action="store", dest="protocol", required=False,
                        default='http',
                        help="http or https")
    parser.add_argument('-port', action="store", dest="port", required=False,
                        default='8080',
                        help="server port to access, 8080, 80, 443 etc.")
    #Thingworx/Things/Oracle12Connection/Services/insert_into_ird
    #appKey=0abb24ee-49c7-467e-b44e-6b1f09c7c180
    parser.add_argument('-thing', action="store", dest="thing", required=False,
                        default='Oracle12Connection',
                        help="thing name which holds upload service")
    parser.add_argument('-service', action="store", dest="service", required=False,
                        default='insert_into_ird',
                        help="service name in a thing to receive uploaded data")
    parser.add_argument('-filename', action="store", dest="filename", required=False,
                        default='ird_sample.csv',
                        help="relative file name inside data folder")
    parser.add_argument('-appKey', action="store", dest="appKey", required=False,
                        default='0abb24ee-49c7-467e-b44e-6b1f09c7c180',
                        help="appKey to access server")

    args = parser.parse_args()

    url = "{}://{}:{}/Thingworx/Things/{}/Services/{}".format(
        args.protocol,
        args.server,
        args.port,
        args.thing,
        args.service
    )
    logger.info("URL:{}".format(url))
    logger.info("Filename:{}".format(args.filename))

    return_options = {}
    return_options['url'] = url
    return_options['filename'] = args.filename
    return_options['appKey'] = args.appKey

    return return_options
    