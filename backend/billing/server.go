// ftpserver allows to create your own FTP(S) server
package billing

import (
	"io/ioutil"
	"os"
	"sync"
	"time"

	"github.com/fclairamb/ftpserver/config"
	"github.com/fclairamb/ftpserver/server"
	ftpserver "github.com/fclairamb/ftpserverlib"
	"github.com/free5gc/webconsole/backend/logger"
)

type BillingDomain struct {
	ftpServer *ftpserver.FtpServer
	driver    *server.Server
}

// The ftp server is for CDR Push method, that is the CHF will send the CDR file to the FTP server
func OpenServer(wg *sync.WaitGroup) *BillingDomain {
	// Arguments vars
	var confFile string
	var autoCreate bool

	b := &BillingDomain{}
	if _, err := os.Stat("/tmp/webconsole"); err != nil {
		os.Mkdir("/tmp/webconsole", os.ModePerm)
	}

	if confFile == "" {
		confFile = "/tmp/webconsole/ftpserver.json"
		autoCreate = true
	}

	if autoCreate {
		if _, err := os.Stat(confFile); err != nil && os.IsNotExist(err) {
			logger.BillingLog.Warn("No conf file, creating one", confFile)

			if err := ioutil.WriteFile(confFile, confFileContent(), 0600); err != nil { //nolint: gomnd
				logger.BillingLog.Warn("Couldn't create conf file", confFile)
			}
		}
	}

	conf, errConfig := config.NewConfig(confFile, logger.FtpServerLog)
	if errConfig != nil {
		logger.BillingLog.Error("Can't load conf", "Err", errConfig)

		return nil
	}

	// Loading the driver
	var errNewServer error
	b.driver, errNewServer = server.NewServer(conf, logger.FtpServerLog)

	if errNewServer != nil {
		logger.BillingLog.Error("Could not load the driver", "err", errNewServer)

		return nil
	}

	// Instantiating the server by passing our driver implementation
	b.ftpServer = ftpserver.NewFtpServer(b.driver)

	// Setting up the ftpserver logger
	b.ftpServer.Logger = logger.FtpServerLog

	go b.Serve(wg)
	logger.BillingLog.Info("Billing server Start")

	return b
}

func (b *BillingDomain) Serve(wg *sync.WaitGroup) {
	defer func() {
		logger.BillingLog.Error("Billing server stopped")
		b.Stop()
		wg.Done()
	}()

	if err := b.ftpServer.ListenAndServe(); err != nil {
		logger.BillingLog.Error("Problem listening", "err", err)
	}

	// We wait at most 1 minutes for all clients to disconnect
	if err := b.driver.WaitGracefully(time.Minute); err != nil {
		logger.BillingLog.Warn("Problem stopping server", "Err", err)
	}
}

func (b *BillingDomain) Stop() {
	b.driver.Stop()

	if err := b.ftpServer.Stop(); err != nil {
		logger.BillingLog.Error("Problem stopping server", "Err", err)
	}
}

func confFileContent() []byte {
	str := `{
  "version": 1,
  "accesses": [
    {
      "user": "admin",
      "pass": "free5gc",
      "fs": "os",
      "params": {
        "basePath": "/tmp/webconsole"
      }
    }
  ],
  "listen_address": "127.0.0.1:2122"
}`

	return []byte(str)
}
