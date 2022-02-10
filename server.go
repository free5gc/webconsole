package main

import (
	"fmt"
	"os"

	"github.com/urfave/cli"

	"github.com/free5gc/util/version"
	"github.com/free5gc/webconsole/backend/logger"
	"github.com/free5gc/webconsole/backend/webui_service"
)

var WEBUI = &webui_service.WEBUI{}

func main() {
	app := cli.NewApp()
	app.Name = "webui"
	app.Usage = "free5GC Web Console"
	app.Action = action
	app.Flags = WEBUI.GetCliCmd()
	if err := app.Run(os.Args); err != nil {
		logger.AppLog.Errorf("Web Console Run error: %v", err)
	}
}

func action(c *cli.Context) error {
	if err := initLogFile(c.String("log"), c.String("log5gc")); err != nil {
		logger.AppLog.Errorf("%+v", err)
		return err
	}

	if err := WEBUI.Initialize(c); err != nil {
		return fmt.Errorf("Failed to initialize !! %+v", err)
	}

	logger.AppLog.Infoln(c.App.Name)
	logger.AppLog.Infoln("webconsole version: ", version.GetVersion())

	WEBUI.Start()

	return nil
}

func initLogFile(logNfPath, log5gcPath string) error {
	if err := logger.LogFileHook(logNfPath, log5gcPath); err != nil {
		return err
	}
	return nil
}
