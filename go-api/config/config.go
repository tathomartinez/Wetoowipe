package config

import "os"

// Config estructura para almacenar configuraciones
type Config struct {
	AppPort string
}

// LoadConfig carga las configuraciones desde variables de entorno
func LoadConfig() *Config {
	return &Config{
		AppPort: os.Getenv("APP_PORT"),
	}
}
