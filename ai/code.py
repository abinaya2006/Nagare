import csv

def file(filename):
    f=open(filename,'r')
    fre=dict()
    for i in f:
        word=i.strip()
        if word not in fre:
            fre[word]=0
        fre[word]+=1
    f.close()
    return fre

c='co.csv'
file(c)