ssh lia "
set -e
cd artemis.js
git pull
docker compose up -d --build
"