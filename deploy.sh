sudo systemctl start redis-server.service

echo "Deleting backend and frontend processes"
pm2 delete all

echo "Installing dependencies"
pnpm add -g pnpm pm2
pm2 update
pnpm install

echo "Stopping nginx and cleaning nginx cache"
sudo rm -rf /var/cache/nginx/*
sudo systemctl stop nginx.service

cd backend
rm -rf dist/
pnpm build
pm2 start "pnpm run start:prod"

cd ../frontend
rm -rf .next/
pnpm build
pm2 start "pnpm start"

cd ..
sudo systemctl restart nginx.service