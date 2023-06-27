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

### Run for Usage

If you just want to use the free5gc webconsole, use the binary. 

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


### Run for Development

For development, you can run the backend and frontend separately and use the hot-reload feature of ReactJS.

To do this,

1. Navigate to `~/free5gc/webconsole` folder.
1. Change the URL of the backend webserver to your external IP address. Change the frontend API URL to the same address. See [Configure Webserver and Frontend Parameters](#configure-webserver-and-frontend-parameters).
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

To configure the URL for the webconsole server, open `~/free5gc/webconsole/config/webuicfg.yaml` and modify the `webserver` settings:
```yaml
  webserver:
    host: localhost
    port: 5000
```

For the frontend, the configuration is done via environment variables. 

Open `~/free5gc/webconsole/frontend/.env` and modify the settings.
