print ("running")
ip = "192.168.0.83"
username = "3EDLjI53lNqL14auInL0Xb7xd3Mg6inL4uc7oxTR"

import urllib.request
print ("getting sensors")
sensorRequest = urllib.request.urlopen("http://" + ip + "/api/" + username + "/sensors").read()
import json
sensorList = json.loads(sensorRequest)
for key in sensorList:
    print sensorList[key]
    #value = sensorList[key]
    #print("The key and value are ({}) = ({})".format(key, value))