package logger

import (
	"github.com/sirupsen/logrus"

	logger_util "github.com/free5gc/util/logger"
)

var (
	Log     *logrus.Logger
	NfLog   *logrus.Entry
	MainLog *logrus.Entry
	InitLog *logrus.Entry
	ProcLog *logrus.Entry
	CtxLog  *logrus.Entry
	CfgLog  *logrus.Entry
	GinLog  *logrus.Entry
)

func init() {
	fieldsOrder := []string{
		logger_util.FieldNF,
		logger_util.FieldCategory,
	}
	Log = logger_util.New(fieldsOrder)
	NfLog = Log.WithField(logger_util.FieldNF, "WEBUI")
	MainLog = NfLog.WithField(logger_util.FieldCategory, "Main")
	InitLog = NfLog.WithField(logger_util.FieldCategory, "Init")
	ProcLog = NfLog.WithField(logger_util.FieldCategory, "Proc")
	CtxLog = NfLog.WithField(logger_util.FieldCategory, "CTX")
	CfgLog = NfLog.WithField(logger_util.FieldCategory, "CFG")
	GinLog = NfLog.WithField(logger_util.FieldCategory, "GIN")
}
