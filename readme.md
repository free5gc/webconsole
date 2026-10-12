# free5GC Web Console

### Install Node.js

Node.js 22 is required. You can install it using either **nvm** or **NodeSource**.

#### Option 1: Using nvm

Using [nvm](https://github.com/nvm-sh/nvm) makes it easier to install and switch between different Node.js versions.

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash

# Reload the shell
source ~/.bashrc

# Install and use Node.js 22
nvm install 22
nvm use 22

# Set Node.js 22 as the default version
nvm alias default 22

# Verify the Node.js version
node -v
```

To switch Node.js versions later:

```bash
nvm install <version>  # Example: nvm install 20
nvm use <version>      # Example: nvm use 20
```

If you do not want to use nvm, you can install Node.js 22 directly using NodeSource instead.

#### Option 2: Using NodeSource

```bash
sudo apt remove nodejs -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt update
sudo apt install nodejs -y

# Verify that the version is 22.x
node -v

sudo corepack enable
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
