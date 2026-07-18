package config

import "os"

type Config struct {
	AppPort           string
	MongoURI          string
	MongoDatabase     string
	SecretKey         string
	DiscordWebhookURL string
	AppEnv            string
	APIToken          string
}

func LoadConfig() *Config {
	return &Config{
		AppPort:           getEnv("APP_PORT", "8080"),
		MongoURI:          os.Getenv("MONGO_URI"),
		MongoDatabase:     getEnv("MONGO_DATABASE", "bankdb"),
		SecretKey:         os.Getenv("SECRET_KEY"),
		DiscordWebhookURL: os.Getenv("DISCORD_WEBHOOK_URL"),
		AppEnv:            getEnv("APP_ENV", "development"),
		APIToken:          os.Getenv("API_TOKEN"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
