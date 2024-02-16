# free5GC Web Console

### Install yarn:
```bash
sudo apt remove cmdtest yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install -y yarn
```

### Install Node.js
```bash
sudo apt remove nodejs -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update
sudo apt install nodejs -y
node -v # check that version is 18.x
```

To run free5GC webconsole server. The following steps are to be considered.
```bash
# (In directory: ~/free5gc/webconsole)
cd frontend
yarn install
yarn build
rm -rf ../public
cp -R build ../public
```

### Run the Server
```bash
# (In directory: ~/free5gc/webconsole)
go run server.go
```

### Connect to WebConsole

Enter `<WebConsole server's IP>:5000` in an internet browser URL bar

Then use the credentials below:
- Username: admin
- Password: free5gc
