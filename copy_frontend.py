import shutil
import os

src = 'frontend'
dst = 'frontend_vercel'

def ignore_files(dir, files):
    return [f for f in files if f == 'node_modules']

if not os.path.exists(dst):
    shutil.copytree(src, dst, ignore=ignore_files)
    print("Copied successfully!")
else:
    print("Directory already exists")
