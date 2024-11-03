# !/bin/bash

if [ "$CF_PAGES_BRANCH" == "feat/streamhelperassets" ]; then
  git clone https://github.com/joaorb64/StreamHelperAssets --depth 1 -b main
  rm -rf StreamHelperAssets/scripts
  node generatePath.js
else
  node generateJsonAlts.js
fi