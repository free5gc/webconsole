package webui_service

import (
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

var PublicPath = "public"

func ReturnPublic() gin.HandlerFunc {
	return func(context *gin.Context) {
		method := context.Request.Method
		if method == "GET" {
			destPath := PublicPath + context.Request.RequestURI
			if destPath[len(destPath)-1] == '/' {
				destPath = destPath[:len(destPath)-1]
			}
			destPath = verifyDestPath(destPath)
			context.File(destPath)
		} else {
			context.Next()
		}
	}
}

func verifyDestPath(requestedURI string) string {
	destPath := filepath.Clean(requestedURI)
	// if destPath contains ".." then it is not a valid path
	if strings.Contains(destPath, "..") {
		return PublicPath
	}
	return destPath
}
