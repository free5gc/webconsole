# free5GC Web Console

## Run the Web Console Server
```
go run server.go
```

## Development

To merge the new verison of frontend part to the webconsole server
```bash
cd frontend
yarn install
yarn build
rm -rf ../public
cp -R build ../public
```

The run `go run server.go` to see the webconsole with the new frontend.
