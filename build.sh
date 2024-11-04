# !/bin/bash

if [ "$CF_PAGES_BRANCH" == "feat/streamhelperassets" ]; then
  node generatePath.mjs
else
  node generateJsonAlts.js
fi