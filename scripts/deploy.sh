#!/bin/zsh

blue_mon_host=$BM_HOST
blue_mon_user=$BM_USER
blue_mon_pass=$BM_PASS
 
tar cf dist.tar *.js package.json .env scripts/cron.sh yarn.lock
sshpass -p "$BM_PASS" ssh $BM_USER@$blue_mon_host "cd blind-mon && mv node_modules ../  && rm -rf * && mv ../node_modules ."
sshpass -p "$BM_PASS" scp dist.tar $BM_USER@$blue_mon_host:blind-mon
sshpass -p "$BM_PASS" ssh $BM_USER@$blue_mon_host "cd blind-mon && tar xf dist.tar && rm dist.tar && yarn" 
rm dist.tar
