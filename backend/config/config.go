package config

import (
	"os"
	"strings"
)

type Config struct {
	Port                string
	Env                 string
	MongoDBURI          string
	MongoDBDatabase     string
	JWTSecret           string
	JWTExpiry           string
	RefreshTokenExpiry  string
	CORSOrigins         []string
}

func LoadConfig() *Config {
	corsOrigins := os.Getenv("CORS_ORIGINS")
	origins := []string{"http://localhost:5173"}
	if corsOrigins != "" {
		origins = strings.Split(corsOrigins, ",")
	}

	return &Config{
		Port:               getEnv("PORT", "8080"),
		Env:                getEnv("ENV", "development"),
		MongoDBURI:         getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		MongoDBDatabase:    getEnv("MONGODB_DATABASE", "learn_app"),
		JWTSecret:          getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiry:          getEnv("JWT_EXPIRY", "1h"),
		RefreshTokenExpiry: getEnv("REFRESH_TOKEN_EXPIRY", "720h"),
		CORSOrigins:        origins,
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
