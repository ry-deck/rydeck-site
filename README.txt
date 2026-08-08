PORTFOLIO STARTER
=================

PROJECTS
--------
Put your project photos in /projects:

    Mudlark 1.jpg
    Mudlark 2.jpg
    Mudlark 3.jpg
    Mudlark.txt

Only "Mudlark 1.jpg" appears on the homepage.
2, 3, 4, etc. are available in the gallery.

The first numbered image is the representative image.

After changing the project folder, run:

    python build.py

Then upload the updated site.


FRAMES
------
Put your transparent PNG frames in /frames.

The starter includes:

    frame01.png
    frame02.png
    frame03.png
    frame04.png
    frame05.png

Replace these with your own frames. The site assigns them
to projects automatically.


SITE IMAGES
-----------
Replace:

    assets/background.jpg
    assets/logo.png
    assets/me.jpg

Your biography goes in:

    assets/bio.txt


LOCAL TESTING
-------------
If Python is installed, open a terminal in this folder and run:

    python -m http.server

Then visit:

    http://localhost:8000

Double-clicking index.html may prevent the bio text from
loading because browsers restrict local file access.


UPDATING
--------
Whenever you add or remove project files:

    python build.py

Then upload the folder to your host.

There is no database, CMS, or server-side code.
