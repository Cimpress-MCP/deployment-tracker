@script = <<SCRIPT
apt-get update
apt-get install -y nodejs npm sqlite3

ln -sf /usr/bin/nodejs /usr/bin/node

# We want to use the local deployment-tracker, not the npm version, so that we can iterate on changes
mkdir -p /usr/local/lib/node_modules
ln -sf /vagrant /usr/local/lib/node_modules/deployment-tracker

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

SCRIPT

required_plugins = %w( vagrant-hostmanager )
required_plugins.each do |plugin|
  system "vagrant plugin install #{plugin}" unless Vagrant.has_plugin? plugin
end

Vagrant.configure(2) do |config|
  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true

  config.vm.define "app" do |appconfig|
    appconfig.vm.box = "ubuntu/trusty64"
    appconfig.vm.network "private_network", ip: "192.168.10.118"
    appconfig.vm.hostname = "loclocicedtr001"
    appconfig.vm.provision :shell, inline: @script
  end

#  config.vm.define "database" do |dbconfig|
#    dbconfig.vm.box = "nickcharlton/postgres"
#    dbconfig.vm.network "private_network", ip: "192.168.10.120"
#    dbconfig.vm.hostname = "loclocdbatrd001"
#  end
end
