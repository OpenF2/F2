#!/bin/bash

#find docs "src" parent directory
cd ~/Sites/github/OpenF2/docs

#markitdown
markitdown ./src --output-path ../../OpenF2_HTML/docs --header ./src/template/header.html --footer ./src/template/footer.html --head ./src/template/style.html --title "F2 Documentation"

#copy output to correct location in repo
cp -rf ~/Sites/github/OpenF2_HTML/docs/src/ ~/Sites/github/OpenF2/docs/html/

#open browser, enjoy.
open http://localhost/github/OpenF2/docs/html/