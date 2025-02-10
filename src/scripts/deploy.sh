ssh shironeko "
set -e
cd artemis.js
git pull
~/.bun/bin/bun install --frozen-lockfile
pm2 restart artemis
"