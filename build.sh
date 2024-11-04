# !/bin/bash

if [ "$CF_PAGES_BRANCH" == "feat/streamhelperassets" ]; then
  node generatePath.js
else
  node generateJsonAlts.js
fi