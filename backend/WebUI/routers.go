package WebUI

import (
	"net/http"

	"github.com/gin-gonic/gin"

	logger_util "github.com/free5gc/util/logger"
	"github.com/free5gc/webconsole/backend/logger"
)

// Route is the information for every URI.
type Route struct {
	// Name is the name of this Route.
	Name string
	// Method is the string for the HTTP method. ex) GET, POST etc..
	Method string
	// Pattern is the pattern of the URI.
	Pattern string
	// HandlerFunc is the handler function of this route.
	HandlerFunc gin.HandlerFunc
}

// Routes is the list of the generated Route.
type Routes []Route

// NewRouter returns a new router.
func NewRouter() *gin.Engine {
	router := logger_util.NewGinWithLogrus(logger.GinLog)
	AddService(router)
	return router
}

func AddService(engine *gin.Engine) *gin.RouterGroup {
	group := engine.Group("/api")

	for _, route := range routes {
		switch route.Method {
		case http.MethodGet:
			group.GET(route.Pattern, route.HandlerFunc)
		case http.MethodPost:
			group.POST(route.Pattern, route.HandlerFunc)
		case http.MethodPut:
			group.PUT(route.Pattern, route.HandlerFunc)
		case http.MethodDelete:
			group.DELETE(route.Pattern, route.HandlerFunc)
		case http.MethodPatch:
			group.PATCH(route.Pattern, route.HandlerFunc)
		}
	}

	return group
}

var routes = Routes{
	{
		"GetExample",
		http.MethodGet,
		"/sample",
		GetSampleJSON,
	},

	{
		"Login",
		http.MethodPost,
		"/login",
		Login,
	},

	{
		"Logout",
		http.MethodPost,
		"/logout",
		Logout,
	},

	{
		"GetTenants",
		http.MethodGet,
		"/tenant",
		GetTenants,
	},

	{
		"GetTenantByID",
		http.MethodGet,
		"/tenant/:tenantId",
		GetTenantByID,
	},

	{
		"PostTenant",
		http.MethodPost,
		"/tenant",
		PostTenant,
	},

	{
		"PutTenantByID",
		http.MethodPut,
		"/tenant/:tenantId",
		PutTenantByID,
	},

	{
		"DeleteTenantByID",
		http.MethodDelete,
		"/tenant/:tenantId",
		DeleteTenantByID,
	},

	{
		"GetUsers",
		http.MethodGet,
		"/tenant/:tenantId/user",
		GetUsers,
	},

	{
		"GetUserByID",
		http.MethodGet,
		"/tenant/:tenantId/user/:userId",
		GetUserByID,
	},

	{
		"PostUserByID",
		http.MethodPost,
		"/tenant/:tenantId/user",
		PostUserByID,
	},

	{
		"PutUserByID",
		http.MethodPut,
		"/tenant/:tenantId/user/:userId",
		PutUserByID,
	},

	{
		"DeleteUserByID",
		http.MethodDelete,
		"/tenant/:tenantId/user/:userId",
		DeleteUserByID,
	},

	{
		"GetSubscribers",
		http.MethodGet,
		"/subscribers",
		GetSubscribers,
	},

	{
		"GetSubscriberByID",
		http.MethodGet,
		"/subscribers/:supi/:plmnId",
		GetSubscriberByID,
	},

	{
		"PostSubscriberByID",
		http.MethodPost,
		"/subscribers/:supi/:plmnId",
		PostSubscriberByID,
	},

	{
		"PostMultipleSubscribersByID",
		http.MethodPost,
		"/subscribers/:supi/:plmnId/:userNumber",
		PostMultipleSubscribersByID,
	},

	{
		"PutSubscriberByID",
		http.MethodPut,
		"/subscribers/:supi/:plmnId",
		PutSubscriberByID,
	},

	{
		"DeleteSubscriberByID",
		http.MethodDelete,
		"/subscribers/:supi/:plmnId",
		DeleteSubscriberByID,
	},

	{
		"PatchSubscriberByID",
		http.MethodPatch,
		"/subscribers/:supi/:plmnId",
		PatchSubscriberByID,
	},

	// AMF currently returns all contexts at once
	{
		"GetAmfUeContexts",
		http.MethodGet,
		"/amf-ue-contexts",
		GetAmfUeContexts,
	},

	// AMF currently returns all contexts at once
	//{
	//	"GetAmfUeContextByID",
	//	http.MethodGet,
	//	"/amf-ue-contexts/:supi",
	//	GetAmfUeContextByID,
	//},

	// not implemented, as not required, only need a single context
	//{
	//	"GetSmfUeContexts",
	//	http.MethodGet,
	//	"/ue-session-contexts",
	//	GetSmfUeContexts,
	//},

	{
		"GetUeSessionContextByID",
		http.MethodGet,
		"/ue-session-contexts/:smContextRef",
		GetUeSessionContextByID,
	},
}
