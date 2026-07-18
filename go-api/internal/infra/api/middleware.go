package api

import (
	"log"
	"net/http"
	"os"
	"strings"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip auth for root, swagger, and health check
		if r.URL.Path == "/" || strings.HasPrefix(r.URL.Path, "/swagger/") || r.URL.Path == "/health" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respondWithError(w, http.StatusUnauthorized, "Missing authorization header")
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		expectedToken := os.Getenv("API_TOKEN")
		if expectedToken == "" {
			log.Printf("WARNING: API_TOKEN not configured, skipping auth")
			next.ServeHTTP(w, r)
			return
		}

		if token != expectedToken {
			respondWithError(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		next.ServeHTTP(w, r)
	})
}
