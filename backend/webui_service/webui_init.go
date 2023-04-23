package webui_service

import (
	"bufio"
	"errors"
	"fmt"
	"io/ioutil"
	"os/exec"
	"path/filepath"
	"runtime/debug"
	"sync"
	"unsafe"

	"github.com/VJoes/webconsole/backend/geth"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-contrib/cors"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli"

	"github.com/VJoes/webconsole/backend/WebUI"
	"github.com/VJoes/webconsole/backend/factory"
	"github.com/VJoes/webconsole/backend/logger"
	"github.com/VJoes/webconsole/backend/webui_context"
	"github.com/free5gc/util/mongoapi"
)

type WEBUI struct{}

type (
	// Commands information.
	Commands struct {
		config string
		public string
	}
)

var commands Commands

var cliCmd = []cli.Flag{
	cli.StringFlag{
		Name:  "public, p",
		Usage: "Load public path from `FOLDER`",
	},
	cli.StringFlag{
		Name:  "config, c",
		Usage: "Load configuration from `FILE`",
	},
	cli.StringFlag{
		Name:  "log, l",
		Usage: "Output NF log to `FILE`",
	},
	cli.StringFlag{
		Name:  "log5gc, lc",
		Usage: "Output free5gc log to `FILE`",
	},
}

var initLog *logrus.Entry

var (
	gethClient *ethclient.Client
)

func (*WEBUI) GetCliCmd() (flags []cli.Flag) {
	return cliCmd
}

func (webui *WEBUI) Initialize(c *cli.Context) error {
	commands = Commands{
		config: c.String("config"),
		public: c.String("public"),
	}

	initLog = logger.InitLog

	if commands.config != "" {
		if err := factory.InitConfigFactory(commands.config); err != nil {
			return err
		}
	} else {
		if err := factory.InitConfigFactory("./config/webuicfg.yaml"); err != nil {
			return err
		}
	}

	if commands.public != "" {
		PublicPath = filepath.Clean(commands.public)
	}

	webui.setLogLevel()

	return nil
}

func (webui *WEBUI) setLogLevel() {
	if factory.WebUIConfig.Logger == nil {
		initLog.Warnln("Webconsole config without log level setting!!!")
		return
	}

	if factory.WebUIConfig.Logger.WEBUI != nil {
		if factory.WebUIConfig.Logger.WEBUI.DebugLevel != "" {
			if level, err := logrus.ParseLevel(factory.WebUIConfig.Logger.WEBUI.DebugLevel); err != nil {
				initLog.Warnf("WebUI Log level [%s] is invalid, set to [info] level",
					factory.WebUIConfig.Logger.WEBUI.DebugLevel)
				logger.SetLogLevel(logrus.InfoLevel)
			} else {
				initLog.Infof("WebUI Log level is set to [%s] level", level)
				logger.SetLogLevel(level)
			}
		} else {
			initLog.Warnln("WebUI Log level not set. Default set to [info] level")
			logger.SetLogLevel(logrus.InfoLevel)
		}
		logger.SetReportCaller(factory.WebUIConfig.Logger.WEBUI.ReportCaller)
	}
}

func (webui *WEBUI) FilterCli(c *cli.Context) (args []string) {
	for _, flag := range webui.GetCliCmd() {
		name := flag.GetName()
		value := fmt.Sprint(c.Generic(name))
		if value == "" {
			continue
		}

		args = append(args, "--"+name, value)
	}
	return args
}

func (webui *WEBUI) Start() {
	// connect to geth
	if e := chooseDB(factory.WebUIConfig); e != nil {
		logger.InitLog.Errorf(e.Error())
	}
	// get config file info from WebUIConfig
	mongodb := factory.WebUIConfig.Configuration.Mongodb

	// Connect to MongoDB
	if err := mongoapi.SetMongoDB(mongodb.Name, mongodb.Url); err != nil {
		initLog.Errorf("Server start err: %+v", err)
		return
	}

	initLog.Infoln("Server started")

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

	self := webui_context.WEBUI_Self()
	self.UpdateNfProfiles()

	router.NoRoute(ReturnPublic())

	initLog.Infoln(router.Run(":5000"))
}

func chooseDB(config factory.Config) error {
	gethConfig := config.Configuration.GethConfig
	gethClient, _ = ethclient.Dial(gethConfig.Url)
	if gethClient == nil {
		logger.InitLog.Errorf("geth 连接错误")
		return errors.New("geth 连接错误")
	}

	contractAddress := gethConfig.ContractAddress
	coreNetworkAddress := gethConfig.CoreNetworkAddress
	password := gethConfig.GethPassword

	gethToken, errCon := geth.NewMain(common.HexToAddress(contractAddress), gethClient)
	if errCon != nil {
		logger.InitLog.Errorf("Failed to instantiate a Token contract: %v", errCon)
		return errors.New("failed to instantiate a Token contract")
	}
	self := webui_context.WEBUI_Self()
	self.GethClientToken = gethToken
	self.ContractAddress = contractAddress
	self.CoreNetworkAddress = coreNetworkAddress
	self.GethPassword = password

	keyStoreByte, _ := ioutil.ReadFile("./config/keystore.txt")
	keyStore := (*string)(unsafe.Pointer(&keyStoreByte))
	self.KeyStore = *keyStore

	return nil
}

func (webui *WEBUI) Exec(c *cli.Context) error {
	initLog.Traceln("args:", c.String("webuicfg"))
	args := webui.FilterCli(c)
	initLog.Traceln("filter: ", args)
	command := exec.Command("./webui", args...)

	if err := webui.Initialize(c); err != nil {
		return err
	}

	stdout, err := command.StdoutPipe()
	if err != nil {
		initLog.Fatalln(err)
	}
	wg := sync.WaitGroup{}
	wg.Add(3)
	go func() {
		defer func() {
			if p := recover(); p != nil {
				// Print stack for panic to log. Fatalf() will let program exit.
				logger.InitLog.Fatalf("panic: %v\n%s", p, string(debug.Stack()))
			}
		}()

		in := bufio.NewScanner(stdout)
		for in.Scan() {
			fmt.Println(in.Text())
		}
		wg.Done()
	}()

	stderr, err := command.StderrPipe()
	if err != nil {
		initLog.Fatalln(err)
	}
	go func() {
		defer func() {
			if p := recover(); p != nil {
				// Print stack for panic to log. Fatalf() will let program exit.
				logger.InitLog.Fatalf("panic: %v\n%s", p, string(debug.Stack()))
			}
		}()

		in := bufio.NewScanner(stderr)
		for in.Scan() {
			fmt.Println(in.Text())
		}
		wg.Done()
	}()

	go func() {
		defer func() {
			if p := recover(); p != nil {
				// Print stack for panic to log. Fatalf() will let program exit.
				logger.InitLog.Fatalf("panic: %v\n%s", p, string(debug.Stack()))
			}
		}()

		if errCmd := command.Start(); errCmd != nil {
			fmt.Println("command.Start Fails!")
		}
		wg.Done()
	}()

	wg.Wait()

	return err
}
