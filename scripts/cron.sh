#!/bin/bash
PATH=$PATH:/usr/local/bin/
cd ~/blind-mon/
echo `pwd` 

TIMEOUT=20

RETRY_LIMIT=3
retry=1
echo "Polling for battery data"
while [ $retry -le $RETRY_LIMIT ]
do
  echo "Attempt $retry)"
  node index.js &
  sleep $TIMEOUT
  process=`pgrep node`
  [ -z "$process" ] && retry=$(( $retry + $RETRY_LIMIT )) || pkill node && retry=$(( $retry + 1 )) && sleep 10 
  echo ""
  done
echo ""
echo "Finished"

