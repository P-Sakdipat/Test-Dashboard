import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://api.sheety.co/0ba89f822371268e238784616b6edce5/testDashboard/sheet1'
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode())
        print(json.dumps(data, indent=2)[:500])
except Exception as e:
    print(f"Error: {e}")
