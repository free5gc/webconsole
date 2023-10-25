# free5GC Web Console

### Install yarn:
```bash
sudo apt remove cmdtest yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update
sudo apt-get install -y nodejs yarn
```

### Install Node.js
```bash
sudo apt remove nodejs -y
curl -s https://deb.nodesource.com/setup_16.x | sudo bash
sudo apt install nodejs -y
node -v # check version is 16.x
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

Enter <WebConsole server's IP>:5000 in URL bar.

Username: admin
Password: free5gc

## Run the Frontend Dev Web Server
Run the frontend development server with file watcher
```bash
cd frontend/
yarn start
```

To specify backend server api url
```bash
cd frontend/
REACT_APP_HTTP_API_URL=http://127.0.0.1:5000/api PORT=3000 yarn start
```