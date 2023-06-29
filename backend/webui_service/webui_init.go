package webui_service

import (
	"io/ioutil"
	"os"

	"github.com/sirupsen/logrus"

	"github.com/free5gc/util/mongoapi"
	"github.com/free5gc/webconsole/backend/WebUI"
	"github.com/free5gc/webconsole/backend/factory"
	"github.com/free5gc/webconsole/backend/logger"
	"github.com/free5gc/webconsole/backend/webui_context"
)

type WebuiApp struct {
	cfg      *factory.Config
	webuiCtx *webui_context.WEBUIContext
}

func NewApp(cfg *factory.Config) (*WebuiApp, error) {
	webui := &WebuiApp{cfg: cfg}
	webui.SetLogEnable(cfg.GetLogEnable())
	webui.SetLogLevel(cfg.GetLogLevel())
	webui.SetReportCaller(cfg.GetLogReportCaller())

	webui.webuiCtx = webui_context.GetSelf()
	return webui, nil
}

func (a *WebuiApp) SetLogEnable(enable bool) {
	logger.MainLog.Infof("Log enable is set to [%v]", enable)
	if enable && logger.Log.Out == os.Stderr {
		return
	} else if !enable && logger.Log.Out == ioutil.Discard {
		return
	}
	a.cfg.SetLogEnable(enable)
	if enable {
		logger.Log.SetOutput(os.Stderr)
	} else {
		logger.Log.SetOutput(ioutil.Discard)
	}
}

func (a *WebuiApp) SetLogLevel(level string) {
	lvl, err := logrus.ParseLevel(level)
	if err != nil {
		logger.MainLog.Warnf("Log level [%s] is invalid", level)
		return
	}
	logger.MainLog.Infof("Log level is set to [%s]", level)
	if lvl == logger.Log.GetLevel() {
		return
	}
	a.cfg.SetLogLevel(level)
	logger.Log.SetLevel(lvl)
}

func (a *WebuiApp) SetReportCaller(reportCaller bool) {
	logger.MainLog.Infof("Report Caller is set to [%v]", reportCaller)
	if reportCaller == logger.Log.ReportCaller {
		return
	}
	a.cfg.SetLogReportCaller(reportCaller)
	logger.Log.SetReportCaller(reportCaller)
}

func (a *WebuiApp) Start(tlsKeyLogPath string) {
	// get config file info from WebUIConfig
	mongodb := factory.WebuiConfig.Configuration.Mongodb
	webserver := factory.WebuiConfig.Configuration.Webserver

	// Connect to MongoDB
	if err := mongoapi.SetMongoDB(mongodb.Name, mongodb.Url); err != nil {
		logger.InitLog.Errorf("Server start err: %+v", err)
		return
	}

	router := WebUI.NewRouter()

	self := webui_context.GetSelf()
	self.UpdateNfProfiles()

	var url string
	if webserver.Host == "localhost" {
		url = ":" + webserver.Port
	} else {
		url = webserver.Host + ":" + webserver.Port
	}

	logger.InitLog.Infoln(router.Run(url))
}
