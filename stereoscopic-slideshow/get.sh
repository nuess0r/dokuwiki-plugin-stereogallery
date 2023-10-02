#!/bin/sh

wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/gallery-controller.js -O gallery-controller.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/utils.js -O utils.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/controllers/controls.js -O controls.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/controllers/daydream-controls.js -O daydream-controls.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/controllers/gearvr-controls.js -O gearvr-controls.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/controllers/magicleap-controls.js -O magicleap-controls.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/controllers/oculus-go-controls.js -O oculus-go-controls.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/controllers/oculus-touch-controls.js -O oculus-touch-controls.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/controllers/vive-controls.js -O vive-controls.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/controllers/vive-focus-controls.js -O vive-focus-controls.js
wget https://raw.githubusercontent.com/nuess0r/stereoscopic-slideshow/master/js/controllers/windows-motion-controls.js -O windows-motion-controls.js

#sed s/\$\(/jQuery\(/ gallery-controller.js > gallery-controller-compatibility-mode.js
