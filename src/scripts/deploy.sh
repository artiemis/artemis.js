ssh lia "
set -e
export PATH=\"\$HOME/.local/share/pnpm:\$PATH\"
eval \"\`\$HOME/.local/share/fnm/fnm env --shell=bash\`\"

cd artemis.js
git pull
~/.bun/bin/bun install --frozen-lockfile
pm2 restart artemis
"