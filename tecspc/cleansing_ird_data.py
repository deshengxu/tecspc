#!/usr/bin/env python
import numpy as np
import matplotlib.mlab as mlab
import matplotlib.pyplot as plt


test_data = [
    5.907,5.907,5.908,5.908,5.922,5.922,5.914,5.914,5.908,5.908,5.913,5.913,5.912,5.912,5.95,5.95,5.905,
5.905,5.909,5.909,5.95,5.95,5.926,5.926,5.903,5.916,5.905,5.905,5.895,5.895]

target = 5.905
mu = np.mean(test_data)
ltd = -0.03
utd = 0.08

sigma = (utd-ltd)/10.0
num_bins = 10
hist, bins = np.histogram(test_data, num_bins)
width = 0.7 * (bins[1] - bins[0])
center = (bins[:-1] + bins[1:])/2
print(bins)

fig,ax = plt.subplots()

# delta = max(test_data) - min(test_data)
# bin_width = delta/20.0
# bins = [(min(test_data)+bin_width * i ) for i in range(20)]
# print(bins)

# n, bins, patches = plt.hist(test_data,bins=bins, normed=1, facecolor = 'green', alpha = 0.05)

y = mlab.normpdf(bins, mu, np.std(test_data))
ax.plot(bins, y, '--')
ax.bar(center,hist,align='center',width=width)

ax.set_xlabel('Row data')
ax.set_ylabel('Probability density')
title = r'Histogram of U1: $\mu=' + "{}".format(mu) + r'$, $\sigma=' + "{}".format(sigma) + r'$'
#print(title)
ax.set_title(title)

# Tweak spacing to prevent clipping of ylabel
fig.tight_layout()
plt.show()
