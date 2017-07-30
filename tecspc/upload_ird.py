import pandas as pd 
import logging
import numpy as np 
import os
import sys
from datetime import datetime
import argparse
import json
import requests

PACKAGE_PARENT = '..'
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

from generate_feature_list import setup_logger

def generate_json_body(row):
    number_cols = [
        'ACTUAL_MEASUREMENT_RESULT_DIM',
        'CAPTURED_PASS_IND',
        'SAMPLENUMBER',
        'DEVIATION',
        'EVENT_SAMPLE_QTY',
        'NOMINAL_DIM',
        'LOWER_TOLERANCE_DIM',
        'UPPER_TOLERANCE_DIM'
    ]
    date_cols = [
        'CREATED_DT',
        'PRODUCT_PULLED_DT'
    ]
    total_cols = [
        'EVENT_PLACE_ITEM_INDIVIDUAL_NM',
        'SET_LIST_ITEM_INDIVIDUAL_NM',
        'ACTUAL_MEASUREMENT_RESULT_DIM',
        'CAPTURED_PASS_IND',
        'INSPECTIONCOMMENTS',
        'CREATED_DT',
        'SAMPLENUMBER',
        'INSPECTION_OCCURRENCE_NAME',
        'PRODUCT_PULLED_DT',
        'SUPPLIER_PORTAL_USER_ID',
        'NETWORK_USER_ID',
        'BADGE_NUMBER_ID',
        'DEVIATION',
        'PLANT_ID',
        'SITE_NAME',
        'INSPECTIONTYPE',
        'INSPECTORTYPE',
        'EVENT_SAMPLE_QTY',
        'EVENTTYPE',
        'VENDOR',
        'PLANTNAME',
        'WORKCENTER',
        'WORK_ORDER_NBR',
        'FEATURE_ID',
        'FEATURE_NAME',
        'DATUM_TXT',
        'SPC',
        'CTF',
        'NOMINAL_DIM',
        'LOWER_TOLERANCE_DIM',
        'UPPER_TOLERANCE_DIM',
        'ISO_UM_CODE',
        'VISUALINSPECTIONTEXT',
        'WORKORDERSTATUS',
        'WORK_ORDER_CODE',
        'INSPECTION_DOCUMENT_NAME',
        'INSPECTION_REVISION_CODE',
        'INSPECTION_DOCUMENT_DESC',
        'TCPN',
        'TCPN_REV',
        'PART'
    ]
    
    result_list=[]
    for col in total_cols:
        #logger.info("col:{},value:{}".format(col,row[col]))
        if row[col] is None or pd.isnull(row[col]):
            continue

        if col in number_cols:
            if not is_valid_number(row[col]):
                logger.info("row includes invalid number in cell:{}, row is:{}".format(col,row))
                raise ValueError("Invalid Number")

            result_list.append('"{}":{}'.format(col,row[col])) # number doesn't need quote
            continue

        if col in date_cols:
            # created_dt has been checked already.
            if is_valid_date(row[col]):
                result_list.append('"{}":"{}"'.format(col,row[col]))
                continue
   
        result_list.append('"{}":"{}"'.format(col,row[col]))
    return "{" + ",".join(result_list) + "}"

def is_valid_number(cell_object):
    try:
        if isinstance(cell_object,(int,float)):
            return True

        if(cell_object.dtype == np.float64 or cell_object.dtype == np.int64):
            return True
            
    
        result = float(cell_object)
        return True
    except Exception as e:
        print(e)
        return False
            
def is_valid_date(cell_object):
    if cell_object is None:
        return False

    try:
        dateobj = datetime.strptime(str(cell_object),'%m/%d/%Y %H:%M')
        return True
    except:
        return False

def process_onerecord(row):
    try:
        json_body = generate_json_body(row)
        url = 'http://52.43.89.161:8080/Thingworx/Things/Oracle12Connection/Services/insert_into_ird'

        headers = {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'appKey': '0abb24ee-49c7-467e-b44e-6b1f09c7c180'
        }
        
        logger.info("json_body:{}".format(json_body))
        response = requests.post(url,data=json_body,headers=headers)
        logger.info("response:{}".format(response.json()))

    except Exception as e:
        #logger.info("this row has issue:{}".format(row))
        logger.info("exception happenned:{} in row:{}".format(e,row))


if __name__=='__main__':
    # data = [5.907,5.907,5.908,5.908,5.922,5.922,5.914,5.914,5.908,5.908,5.913,5.913,5.912,5.912,
    # 5.95,5.95,5.905,5.905,5.909,5.909,5.95,5.95,5.926,5.926,5.903,5.916,5.905,5.905,5.895,5.895]

    logger = setup_logger()

    curdir=os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
    
    datafile=os.path.join(curdir,"..","data","ird_sample.csv")
    ird_df = pd.read_csv(datafile)
    
    count=0
    total_ird = len(ird_df)
    #for index, row in feature_list_df.iterrows():
    logger.info("total:{}".format(total_ird))

    check_col = 'CREATED_DT'
    row_count=0
    for index, row in ird_df.iterrows():
        logger.info("processing index:{}".format(row_count))
        
        # if row_count>1:
        #     break;
        #logger.debug("index:{},row:{}".format(index, row))
        if is_valid_date(row[check_col]):
            process_onerecord(row)
        else:
            logger.info("Created_DT is not a valid date in format m/d/yyyy h24:mi, {}".format(row(check_col)))

        row_count += 1