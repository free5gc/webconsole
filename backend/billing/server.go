// ftpserver allows to create your own FTP(S) server
package billing

import (
	"encoding/json"
	"os"
	"strconv"
	"sync"

	"github.com/fclairamb/ftpserver/config"
	"github.com/fclairamb/ftpserver/server"
	ftpserver "github.com/fclairamb/ftpserverlib"

	"github.com/free5gc/webconsole/backend/factory"
	"github.com/free5gc/webconsole/backend/logger"
)

type BillingDomain struct {
	ftpServer *ftpserver.FtpServer
	driver    *server.Server
	wg        *sync.WaitGroup
}

type Access struct {
	User   string            `json:"user"`
	Pass   string            `json:"pass"`
	Fs     string            `json:"fs"`
	Params map[string]string `json:"params"`
}

type FtpConfig struct {
	Version        int      `json:"version"`
	Accesses       []Access `json:"accesses"`
	Listen_address string   `json:"listen_address"`
}

// The ftp server is for CDR Push method, that is the CHF will send the CDR file to the FTP server
func OpenServer(wg *sync.WaitGroup) *BillingDomain {
	// Arguments vars
	confFile := "/tmp/webconsole/ftpserver.json"

	b := &BillingDomain{
		wg: wg,
	}
	if _, err := os.Stat("/tmp/webconsole"); err != nil {
		if err := os.Mkdir("/tmp/webconsole", os.ModePerm); err != nil {
			logger.BillingLog.Error(err)
		}
	}

	billingConfig := factory.WebuiConfig.Configuration.BillingServer
	addr := billingConfig.HostIPv4 + ":" + strconv.Itoa(billingConfig.ListenPort)

	params := map[string]string{
		"basePath": "/tmp/webconsole",
	}

	if billingConfig.Tls != nil {
		params["cert"] = billingConfig.Tls.Pem
		params["key"] = billingConfig.Tls.Key
	}

	ftpConfig := FtpConfig{
		Version: 1,
		Accesses: []Access{
			{
				User:   "admin",
				Pass:   "free5gc",
				Fs:     "os",
				Params: params,
			},
		},

		Listen_address: addr,
	}

	file, err := json.MarshalIndent(ftpConfig, "", " ")
	if err != nil {
		logger.BillingLog.Errorf("Couldn't Marshal conf file %v", err)
		return nil
	}

	if err := os.WriteFile(confFile, file, 0o600); err != nil { //nolint: gomnd
		logger.BillingLog.Errorf("Couldn't create conf file %v", confFile)
		return nil
	}

	conf, errConfig := config.NewConfig(confFile, logger.FtpServerLog)
	if errConfig != nil {
		logger.BillingLog.Error("Can't load conf", "Err", errConfig)
		return nil
	}
	logger.BillingLog.Warnf("conf %+v", conf.Content.Accesses[0].Params)
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

	go b.Serve()
	logger.BillingLog.Info("Billing server Start")

	return b
}

func (b *BillingDomain) Serve() {
	if err := b.ftpServer.ListenAndServe(); err != nil {
		logger.BillingLog.Error("Problem listening ", "err", err)
	}
}

func (b *BillingDomain) Stop() {
	logger.BillingLog.Infoln("Stop BillingDomain server")

	b.driver.Stop()
	if err := b.ftpServer.Stop(); err != nil {
		logger.BillingLog.Error("Problem stopping server", "Err", err)
	}

	logger.BillingLog.Infoln("BillingDomain server stopped")
	b.wg.Done()
}
