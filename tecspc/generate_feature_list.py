import numpy as np
import scipy.stats as stats 
import pandas as pd
import uuid
import matplotlib.pyplot as plt
import logging
import matplotlib.mlab as mlab
import os
import sys

def Cp(mylist, usl, lsl):
    arr = np.array(mylist)
    arr = arr.ravel()
    sigma = np.std(arr)
    Cp = float(usl - lsl) / (6*sigma)
    return Cp

def Cpk(mylist, usl, lsl):
    arr = np.array(mylist)
    arr = arr.ravel()
    sigma = np.std(arr)
    m = np.mean(arr)

    Cpu = float(usl - m) / (3*sigma)
    Cpl = float(m - lsl) / (3*sigma)
    Cpk = np.min([Cpu, Cpl])
    return Cpk

def get_hist(data, nominal, utl, ltl, bins_integer, normed=True,feature_id='',filename=None,suptitle=None,logger=None):
    mu = np.mean(data)  # single list of floating data.
    sigma = np.std(data,ddof=1) # divide by N-1 when ddof is 1
    weights = np.ones_like(data)/float(len(data))   # to get y axis to total in 1

    n, bins_value, patches = plt.hist(data,bins=bins_integer,weights= weights, rwidth = 1.0, normed=0)
    logger.info("n={}".format(n))   #n should be normalized already.
    #n, bins_value, patches = plt.hist(data,bins=bins_integer, rwidth = 1.0, normed=1)

    usl = nominal + utl     # 5.905 + 0.08, upper specification limit
    lsl = nominal + ltl     # 5.905 + (-0.03) lower specification limit

    cp = (usl-lsl) / (6.0 * sigma)  
    cpk = min( (usl-mu)/(3.0*sigma), (mu-lsl)/(3.0*sigma))

    ucl = mu + 3.0 * sigma  #upper control limit, mu + 3 sigma
    lcl = mu - 3.0 * sigma  #lower control limit, mu - 3 sigma

    r_bound =max(ucl, max(usl, max(data)))   # right bound, max value of usl or max of data.
    l_bound = min(lcl,min(lsl, min(data)))   # left bound, min value of lsl or min of data.

    total_gap = r_bound - l_bound 
    step_gap = total_gap / bins_integer
    r_edge = r_bound + step_gap/2.0 # add half step to both side for better looking
    l_edge = l_bound - step_gap/2.0 

    #plt.set_autoscale_on(False)
    yMax = max(n)   #top value
    yTop = yMax * 1.2   # expand area
    plt.axis([l_edge, r_edge, 0.0, yTop])   #[xmin,xmax,ymin,ymax]

    notes = ("Nominal:\n{:9.5f}\n\nCp:\n{:9.5f},\n\nCpk:\n{:9.5f},\n\nUCL:\n{:9.5f},\n\nLCL:\n{:9.5f},\n\nUSL:\n{:9.5f},\n\nLSL:\n{:9.5f}\n\nUTL:\n{:9.5f}\n\nLTL:\n{:9.5f}".format(
        nominal,cp,cpk,ucl,lcl,usl,lsl,utl,ltl
    ))
    legend = ("Cp:{:9.5f}; Cpk:{:9.5f};\nUCL:{:9.5f}; LCL:{:9.5f};\nUSL:{:9.5f}; LSL:{:9.5f};\nUTL:{:9.5f}; LTL:{:9.5f}".format(
        cp,cpk,ucl,lcl,usl,lsl,utl,ltl
    ))
    plt.text(total_gap * 0.75+l_bound, yTop * 0.8, legend,fontsize=6)

    logger.info("bins:{}".format(bins_value))
    [logger.info(patch) for patch in patches]

    #usl line
    speclinecolor='#00ff00'
    controlinecolor='#ff0000'
    speclinescale = 0.972
    controlinescale = 0.945
    plt.axvline(x=usl,ymax = speclinescale, color = speclinecolor)
    plt.text(usl,yTop * speclinescale ,'USL', fontsize=7)
    #plt.plot((usl,usl),(0,yMax),'r-')   #plt.plot((x1, x2), (y1, y2), 'k-')
    #lsl line
    plt.axvline(x=lsl,ymax = speclinescale, color = speclinecolor)
    plt.text(lsl,yTop * speclinescale ,'LSL', fontsize=7)
    #plt.plot((lsl,lsl),(0,yMax),'r-')

    #ucl/lcl line
    #plt.plot((ucl,ucl),(0,yMax),'g-')
    #plt.plot((lcl,lcl),(0,yMax),'g-')

    # Garth asks to remove UCL/LCL from chart 7/26/2017
    # plt.axvline(x=ucl,ymax = controlinescale, color = controlinecolor)
    # plt.text(ucl,yTop * controlinescale ,'UCL', fontsize=7)
    # plt.axvline(x=lcl,ymax = controlinescale, color = controlinecolor)
    # plt.text(lcl,yTop * controlinescale ,'LCL', fontsize=7)

    #mean, nominal
    #plt.plot((mu,mu),(0,yMax),'r-')
    plt.axvline(x=mu,ymax = controlinescale, color = controlinecolor)
    plt.text(mu,yTop * controlinescale ,'Mean', fontsize=7)
    #plt.plot((nominal,nominal),(0,yMax),'g-')
    plt.axvline(x=nominal,ymax = speclinescale, color = speclinecolor)
    plt.text(nominal,yTop * speclinescale ,'Nominal', fontsize=7)

    # fit curve with existing bins only.
    x_step = 0.001
    if (l_bound - r_bound) / x_step < 100:
        x_step = 0.0001

    x = np.arange(l_bound, r_bound,x_step).tolist()
    y = mlab.normpdf(x,mu,sigma)
    y_normalized = y * float(max(n))/float(max(y))
    l = plt.plot(x,y_normalized, 'r--',linewidth=1)

    # y = mlab.normpdf(bins_value,mu,sigma)
    # l = plt.plot(bins_value,y, 'r--',linewidth=1)

    # fit curve with node on screen
    # fit = stats.norm.pdf(data,mu,sigma) 
    # plt.plot(data,fit,'-o')

    #title = "Total Test:{}, Mean:{:9.5f}, Sigma:{:9.5f}".format(len(data), mu, sigma)
    title = r'Total:{}, Nominal:{:9.5f},  $\mu={:9.5f}$, $\sigma={:9.5f}$'.format(len(data),nominal, mu,sigma)
    if suptitle:
        plt.suptitle(suptitle,fontsize=14,fontweight='bold')
        #plt.title(suptitle)

    plt.title(title)
    #plt.text(r_edge,0,notes, fontsize=7)

    plt.xlabel("{} value distribution".format(feature_id))
    plt.ylabel("Probability")
    
    # lables = [item.get_text() for item in plt.get_yticklabels()]
    # print("Labels:{}".format(labels))

    if filename is None:
        filename = str(uuid.uuid1())+".png"

    plt.savefig(filename)
    # plt.show()
    plt.clf()
    return (mu,sigma,cp,cpk,ucl,lcl,usl,lsl)

def setup_logger():
    logger = logging.getLogger(__name__)
    logger.setLevel('INFO')

    curdir=os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
    logfile=os.path.join(curdir,"..","data","convert_service.log")

    file_handler = logging.FileHandler(logfile)
    file_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    screen_handler = logging.StreamHandler()
    screen_handler.setLevel('INFO')
    logger.addHandler(screen_handler)

    return logger

if __name__=='__main__':
    # data = [5.907,5.907,5.908,5.908,5.922,5.922,5.914,5.914,5.908,5.908,5.913,5.913,5.912,5.912,
    # 5.95,5.95,5.905,5.905,5.909,5.909,5.95,5.95,5.926,5.926,5.903,5.916,5.905,5.905,5.895,5.895]

    logger = setup_logger()

    curdir=os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
    png_dir = os.path.join(curdir,"..","png")
    if not os.path.exists(png_dir):
        os.makedirs(png_dir)

    datafile=os.path.join(curdir,"..","data","ird_sample.csv")
    feature_list_file = os.path.join(curdir,"..","data","feature_list.csv")
    ird_df = pd.read_csv(datafile)
    feature_cols=['TCPN', 'TCPN_REV','INSPECTION_DOCUMENT_NAME','FEATURE_ID','NOMINAL_DIM','LOWER_TOLERANCE_DIM','UPPER_TOLERANCE_DIM','INSPECTION_REVISION_CODE']
    feature_list_df = ((ird_df.drop_duplicates(subset=feature_cols))[feature_cols]).copy()

    logger.info("Found unique feature ID:")
    logger.info(feature_list_df)
    # mu,sigma,cp,cpk,ucl,lcl,usl,lsl, filename
    feature_list_df['filename'] = np.NaN 
    feature_list_df['filename'] = feature_list_df['filename'].astype('float').astype('str')
    feature_list_df['mean'] = np.NaN 
    feature_list_df['std'] = np.NaN 
    feature_list_df['cp'] = np.NaN 
    feature_list_df['cpk'] = np.NaN 
    feature_list_df['ucl'] = np.NaN 
    feature_list_df['lcl'] = np.NaN 
    feature_list_df['usl'] = np.NaN 
    feature_list_df['lsl'] = np.NaN 
    #print(feature_list_df)
    
    count=0
    total_feature_ID = len(feature_list_df)
    for index, row in feature_list_df.iterrows():
        # if count>0:
        #     break

        count += 1
        
        tcpn = row['TCPN']
        tcpn_rev = row['TCPN_REV']
        qip = row['INSPECTION_DOCUMENT_NAME']
        qip_rev = row['INSPECTION_REVISION_CODE']
        feature_id = row['FEATURE_ID']
        nominal = row['NOMINAL_DIM']
        utl = row['UPPER_TOLERANCE_DIM']
        ltl = row['LOWER_TOLERANCE_DIM']

        feature_ird_df = ird_df.loc[
            (ird_df['TCPN']== tcpn) & 
            (ird_df['TCPN_REV']== tcpn_rev) & 
            (ird_df['INSPECTION_DOCUMENT_NAME']== qip) & 
            (ird_df['FEATURE_ID'] == feature_id) &
            (ird_df['INSPECTION_REVISION_CODE']== qip_rev)]['ACTUAL_MEASUREMENT_RESULT_DIM']

        logger.info("\n\n\n")
        logger.info("Start to process unique feature ID {} of {}".format(count, total_feature_ID))

        logger.info("{}->{}:{}:{}:{}:{}->{:9.5f}:{:9.5f}:{:9.5f}".format(
            index,
            tcpn,
            tcpn_rev,
            qip,
            qip_rev,
            feature_id,
            nominal,
            utl,
            ltl
        ))
        #print(feature_ird_df)

        data = sorted(feature_ird_df.tolist())
        #print(data) 

        if utl and ltl and utl>0 and ltl<0 and nominal:
            #filename = str(uuid.uuid1())+".png"
            filename = "{}_{}_{}_{}_{}_{:0.5f}_{:0.5f}_{:0.5f}.png".format(
                tcpn,
                tcpn_rev,
                qip,
                qip_rev,
                feature_id,
                nominal,
                utl,
                ltl
            )
            fullname = os.path.join(png_dir,filename)
            suptitle = "({} {}) ({} {}) {}".format(
                tcpn,
                tcpn_rev,
                qip,
                qip_rev,
                feature_id
            )
            mu,sigma,cp,cpk,ucl,lcl,usl,lsl=get_hist(data,nominal,utl, ltl,8,True,feature_id,fullname,suptitle,logger)
            logger.info(filename)
            logger.info("{},{},{},{},{},{},{},{}".format(mu,sigma,cp,cpk,ucl,lcl,usl,lsl))

            feature_list_df.set_value(index,'filename',filename)
            feature_list_df.set_value(index,'mean',mu)
            feature_list_df.set_value(index,'std',sigma)
            feature_list_df.set_value(index,'cp',cp)
            feature_list_df.set_value(index,'cpk',cpk)
            feature_list_df.set_value(index,'ucl',ucl)
            feature_list_df.set_value(index,'lcl',lcl)
            feature_list_df.set_value(index,'usl',usl)
            feature_list_df.set_value(index,'lsl',lsl)
        else:
            logger.info("UTL or LTL or NOMINAL doesn't exist, pass now!")
    
    feature_list_df.to_csv(feature_list_file, index=False)