# free5GC Web Console

### Install yarn:
```bash
sudo apt remove cmdtest yarn
```

### Install Node.js
```bash
sudo apt remove nodejs -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update
sudo apt install nodejs -y
node -v # check that version is 20.x
```

### Build the Server

To be able to run free5gc's webconsole server, consider building its source through the following steps:

```bash
# (In directory: ~/free5gc/webconsole)
cd frontend
yarn install
yarn build
rm -rf ../public
cp -R build ../public
```

### Run the Server

To run free5gc's webconsole server, use:

```bash
# (In directory: ~/free5gc/webconsole)
go run server.go
```

### Connect to WebConsole

Enter `<WebConsole server's IP>:5000` in an internet browser URL bar

Then use the credentials below:
- Username: admin
- Password: free5gc
