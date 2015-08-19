@script = <<SCRIPT
apt-get update
apt-get install -y nodejs npm sqlite3

ln -sf /usr/bin/nodejs /usr/bin/node

# We want to use the local deployment-tracker, not the npm version, so that we can iterate on changes
mkdir -p /usr/local/lib/node_modules
ln -sf /vagrant /usr/local/lib/node_modules/deployment-tracker
npm install

# Create init script for deployment-tracker
cat <<EOF >/etc/init/deployment-tracker.conf
# deployment-tracker Agent (Upstart unit)
description "deployment-tracker service"
start on runlevel [2345]
stop on runlevel [!2345]
chdir /usr/local/lib/node_modules/deployment-tracker

respawn
respawn limit 10 10
kill timeout 10

script
  exec node app.js
end script
EOF
sudo service deployment-tracker start

# Redis
apt-get install -y redis-server
sed -i '/bind 127.0.0.1/c\\#bind 127.0.0.1' /etc/redis/redis.conf
service redis-server restart
SCRIPT

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provision :shell, inline: @script
  config.vm.network "forwarded_port", guest: 6379, host: 6379
  config.vm.network "forwarded_port", guest: 8080, host: 8080
end
