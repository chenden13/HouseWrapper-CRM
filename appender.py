import base64, sys
path = sys.argv[1]
b64 = sys.argv[2]
open(path, " ab\).write(base64.b64decode(b64.encode(\ascii\)))
