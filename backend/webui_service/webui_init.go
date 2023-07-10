package webui_service

import (
	"io/ioutil"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"

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

	// Connect to MongoDB
	if err := mongoapi.SetMongoDB(mongodb.Name, mongodb.Url); err != nil {
		logger.InitLog.Errorf("Server start err: %+v", err)
		return
	}

	// Create admin account
	filter := bson.M{"email": "admin"}
	hash, err := bcrypt.GenerateFromPassword([]byte("free5gc"), 12)
	if err != nil {
		logger.InitLog.Errorf("GenerateFromPassword err: %+v", err)
	}

	data := bson.M{
		"userId":            "1",
		"tenantId":          "1",
		"email":             "admin",
		"encryptedPassword": string(hash),
	}

	existed, err := mongoapi.RestfulAPIPutOne("userData", filter, data)
	if err != nil {
		logger.InitLog.Errorf("RestfulAPIPutOne err: %+v", err)
	}

	if existed {
		logger.InitLog.Infof("Admin existed.")
	}

	logger.InitLog.Infoln("Server started")

	router := WebUI.NewRouter()

	router.Use(cors.New(cors.Config{
		AllowMethods: []string{"GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"},
		AllowHeaders: []string{
			"Origin", "Content-Length", "Content-Type", "User-Agent",
			"Referrer", "Host", "Token", "X-Requested-With",
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowAllOrigins:  true,
		MaxAge:           86400,
	}))

	self := webui_context.GetSelf()
	self.UpdateNfProfiles()

	router.NoRoute(ReturnPublic())

	logger.InitLog.Infoln(router.Run(":5000"))
}
