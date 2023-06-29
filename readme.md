# free5GC Webconsole

The free5gc webconsole provides a backend API and a frontend to add subscribers to the free5gc core network. It also provides insights on the connected UEs and other information.

## Requirements

Install nodejs and yarn package first. E.g. on Ubuntu, run:
```bash
sudo apt remove cmdtest
sudo apt remove yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update
sudo apt-get install -y nodejs yarn
```

## Run the Webconsole

### Simple Usage

Th easiest way to use the webconsole is via the binary.

Navigate to the free5gc main folder `~/free5gc`. Build the webconsole binary with 
```bash
make webconsole
```

Move to `~/free5gc/webconsole` and run 
```bash
./bin/webconsole
```
in your terminal. This will start the webconsole server.

Open a browser and go to <server-ip>:5000. The <server-ip> is the IP address of the host that runs the webconsole.

```
Username: admin
Password: free5gc
```


### Run for Development (hot-reload frontend)

For development, you can run the backend and frontend separately and use the hot-reload feature of ReactJS.

Info for beginners: The golang webserver serves both static (frontend) and API on port `5000` (per default). Currently, urls with prefix `/api` are considered as API calls, the rest leads to the frontend. The static files are served from `~/free5gc/webconsole/public`. The frontend is developed in `~/free5gc/webconsole/frontend`, therefore, changes to these files have no effect in the webconsole shown in your browser. But you can start the frontend separately on a development webserver with a different port with `yarn` to use hot-reload (auto-refresh on changes). It will access the API at port `5000` (per default) and itself is accessed on port `3000`.

To start a separate frontend webserver,

1. Navigate to `~/free5gc/webconsole` folder.
1. Change the URL of the backend webserver to your external IP address. Change the frontend API URL to the same external IP address. See [Configure Webserver and Frontend Parameters](#configure-webserver-and-frontend-parameters).
1. Start the backend server with 
   ```bash
   go run server.go
   ```
1. Move to `~/free5gc/webconsole/frontend`. 
1. (If you open the webconsole for the first time, run 
   ```bash
   yarn install
   ```
   to install the node modules.)
1. Start the frontend with 
   ```bash
   yarn start
   ```

Open a browser and go to <server-ip>:3000. 

**Note**: the port is changed to `3000` for the frontend.

```
Username: admin
Password: free5gc
```


## Configure Webserver and Frontend Parameters

Let's assume your externally reachable IP is `172.16.5.60`.

To configure the URL for the golang server, open `~/free5gc/webconsole/config/webuicfg.yaml` and modify the `webserver` settings:
```yaml
  webserver:
    host: 172.16.5.60
    port: 5000
```

For the frontend, the configuration is done via environment variables. 

Open `~/free5gc/webconsole/frontend/.env` and modify the `REACT_APP_API_URL` to `172.16.5.60:5000/api`.


## Troubleshooting

This is a collection of common issues and suggested fixes:

- 404 not found when starting webconsole with `go run server.go`
  - check the `~/free5gc/webconsole/public` folder exisis
  - the webserver tries to serve its static files from this folder
  - create it using the Makefile in the free5gc parent directory

- "NetworkError when attempting to fetch resource" or "Failed to fetch" error
  - this likely is a problem with CORS
  - if you run the webconsole with `yarn start` and `go run server.go`, this means you forgot to change the server's IP in `webuicfg.yaml` and `.env` to the same IP.
  - alternatively, your `REACT_APP_API_URL` does not start with `http(s)://`; this is required by cors

- "/bin/sh: 1: react-scripts: not found" when running `yarn start`
  - the required node modules are not installed yet
  - run `yarn install` in the `~/free5gc/webconsole/frontend` folder to install them

- "error Couldn't find a package.json" when running `yarn start`
  - you are not in the `~/free5gc/webconsole/frontend` folder
