# !/bin/bash

if [ "$CF_PAGES_BRANCH" == "feat/streamhelperassets" ]; then
  git clone https://github.com/joaorb64/StreamHelperAssets --depth 1 -b main
  node generatePath.js
else
  node generateJsonAlts.js
fi