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

To run free5GC webconsole, either the binary or `yarn` and `go` can be used. Choose one of the alternatives.

1. Build the webconsole binary with `make webconsole` in the free5gc main folder (in directory `~/free5gc`). Move to `~/free5gc/webconsole` and run `./bin/webconsole` in your terminal. This will start the webconsole server.

1. To manually run the backend and frontend parts of the webconsole:
   1. Staying in the `~/free5gc/webconsole` folder, start the backend server with `go run server.go`.
   1. Move to `~/free5gc/webconsole/frontend`. Run `yarn install` if you open the webconsole for the first time to install the node modules.
   1. Start the frontend with `yarn start`.

After starting the webconsole, you can now connect to it (see below).


## Connect to Webconsole

Enter <WebConsole server's IP>:5000 in your browser's URL bar.

Username: admin
Password: free5gc
