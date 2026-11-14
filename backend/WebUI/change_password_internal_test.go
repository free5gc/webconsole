package WebUI

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"
	"golang.org/x/crypto/bcrypt"

	"github.com/free5gc/util/mongoapi"
)

func TestChangePasswordInfo(t *testing.T) {
	const (
		tenantID = "tenant-a"
		userID   = "user-a"
		email    = "a@example.com"
		password = "new-password"
		database = "change_password_test"
	)

	oldKey, oldClient := jwtKey, mongoapi.Client
	jwtKey = "change-password-test-key"
	// Set the database name without connecting to a real MongoDB server.
	mongoapi.Client = nil
	require.NoError(t, mongoapi.SetMongoDB(database, "mongodb://localhost:27017"))
	client := mongoapi.Client
	t.Cleanup(func() {
		jwtKey, mongoapi.Client = oldKey, oldClient
		require.NoError(t, client.Disconnect(context.Background()))
	})

	router := gin.New()
	AddService(router)
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	tests := []struct {
		name       string
		subject    interface{}
		body       string
		missing    bool
		unsigned   bool
		wantStatus int
	}{
		{
			name: "own email", subject: userID,
			body:       `{"email":"a@example.com","encryptedPassword":"new-password"}`,
			wantStatus: http.StatusOK,
		},
		{
			name: "other user identity in body", subject: userID,
			body: `{"email":"b@example.com","userId":"user-b","tenantId":"tenant-b",` +
				`"encryptedPassword":"new-password"}`,
			wantStatus: http.StatusOK,
		},
		{
			name: "email omitted", subject: userID,
			body: `{"encryptedPassword":"new-password"}`, wantStatus: http.StatusOK,
		},
		{name: "missing subject", wantStatus: http.StatusUnauthorized},
		{name: "empty subject", subject: "", wantStatus: http.StatusUnauthorized},
		{name: "non-string subject", subject: 123, wantStatus: http.StatusUnauthorized},
		{name: "no token", unsigned: true, wantStatus: http.StatusUnauthorized},
		{name: "deleted user", subject: userID, missing: true, wantStatus: http.StatusNotFound},
	}

	for _, tt := range tests {
		mt.Run(tt.name, func(mt *mtest.T) {
			mongoapi.Client = mt.Client
			user := bson.D{
				{Key: "tenantId", Value: tenantID},
				{Key: "userId", Value: userID},
				{Key: "email", Value: email},
				{Key: "encryptedPassword", Value: "old-hash"},
			}
			if tt.wantStatus == http.StatusOK {
				// The handler reads the user, then RestfulAPIPost checks existence before updating.
				response := mtest.CreateCursorResponse(0, database+"."+userDataColl, mtest.FirstBatch, user)
				mt.AddMockResponses(response, response,
					mtest.CreateSuccessResponse(bson.E{Key: "n", Value: 1}, bson.E{Key: "nModified", Value: 1}))
			} else if tt.missing {
				mt.AddMockResponses(mtest.CreateCursorResponse(0, database+"."+userDataColl, mtest.FirstBatch))
			}

			body := tt.body
			if body == "" {
				body = `{"encryptedPassword":"new-password"}`
			}
			req := httptest.NewRequestWithContext(context.Background(), http.MethodPost,
				"/api/change-password", strings.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			if !tt.unsigned {
				claims := jwt.MapClaims{"tenantId": tenantID, "email": email, "exp": time.Now().Add(time.Hour).Unix()}
				if tt.subject != nil {
					claims["sub"] = tt.subject
				}
				token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(jwtKey))
				require.NoError(mt, err)
				req.Header.Set("Token", token)
			}
			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, req)
			require.Equal(mt, tt.wantStatus, recorder.Code, recorder.Body.String())

			events := mt.GetAllStartedEvents()
			if tt.wantStatus == http.StatusUnauthorized {
				require.Empty(mt, events, "unauthorized requests must not access the database")
				return
			}
			wantFilter := bson.M{"tenantId": tenantID, "userId": userID}
			for _, event := range events {
				if event.CommandName == "find" {
					require.Equal(mt, userDataColl, event.Command.Lookup("find").StringValue())
					var filter bson.M
					require.NoError(mt, bson.Unmarshal(event.Command.Lookup("filter").Document(), &filter))
					require.Equal(mt, wantFilter, filter)
				}
			}
			if tt.missing {
				require.Len(mt, events, 1, "a missing user must not cause a write")
				return
			}

			require.Len(mt, events, 3)
			require.Equal(mt, "update", events[2].CommandName)
			require.Equal(mt, userDataColl, events[2].Command.Lookup("update").StringValue())
			update := events[2].Command.Lookup("updates").Array().Index(0).Value().Document()
			var filter bson.M
			require.NoError(mt, bson.Unmarshal(update.Lookup("q").Document(), &filter))
			require.Equal(mt, wantFilter, filter, "only the token owner's password may be updated")
			var written bson.M
			require.NoError(mt, bson.Unmarshal(update.Lookup("u").Document().Lookup("$set").Document(), &written))
			require.Equal(mt, userID, written["userId"])
			require.Equal(mt, tenantID, written["tenantId"])
			require.Equal(mt, email, written["email"])
			hash, ok := written["encryptedPassword"].(string)
			require.True(mt, ok)
			require.NoError(mt, bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)))
			var returned User
			require.NoError(mt, json.Unmarshal(recorder.Body.Bytes(), &returned))
			require.Equal(mt, userID, returned.UserId)
		})
	}
}
