#!/bin/bash
cd ~/blind-mon/
echo `pwd` 

RETRY_LIMIT=3
retry=1
echo "Polling for battery data"
while [ $retry -le $RETRY_LIMIT ]
do
  echo "Attempt $retry)"
  node index.js 
  [ $? -eq 0 ]  && retry=$(( $retry + $RETRY_LIMIT )) || retry=$(( $retry + 1 )) && sleep 10 
done
echo ""
echo "Finished"

