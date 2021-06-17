# Attack Log Webhook
 Notify when your server gets attacked using discord webhooks by reading emails.

**Install Node (ubuntu):**
```
sudo apt update
sudo apt -y upgrade

sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt -y install nodejs
```

**Verify install:**
```
Command: node -v

$ node --version
v12.x
```

**After installing Node:**
```
Upload the files into a folder on your vps then:

cd foldername

npm i gradient-string
npm i node-imap
npm i discord-webhook-node
OR
npm i

node index.js
```

**NOTE:** Change the settings to your email login, etc.
