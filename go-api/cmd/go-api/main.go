package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"go-api/internal/app/bank" // Nuevo paquete para el banco
	"go-api/internal/app/rules"
	"go-api/internal/app/saleslog"
	"go-api/internal/infra/api"
	"go-api/internal/infra/database"

	"github.com/gorilla/mux" // Importamos gorilla/mux para enrutamiento
)

func setupLogging() {
	// Crear el directorio base de logs
	baseLogDir := "./logs/app"
	date := time.Now().Format("2006-01-02") // Formato YYYY-MM-DD
	logDir := baseLogDir + "/" + date

	// Crear el directorio de logs si no existe
	if _, err := os.Stat(logDir); os.IsNotExist(err) {
		err := os.MkdirAll(logDir, 0755)
		if err != nil {
			log.Fatalf("No se pudo crear el directorio de logs: %v", err)
		}
	}

	// Crear el archivo de log
	logFile, err := os.OpenFile(logDir+"/app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("No se pudo abrir el archivo de log: %v", err)
	}

	// Configurar el logger para escribir en el archivo
	log.SetOutput(logFile)
	log.Println("Logging configurado correctamente")
}

func main() {
	setupLogging() // Configurar el logging
	ctx := context.Background()

	// Inicializar repositorio MongoDB
	mongoRepo, err := database.NewMongoDBRepository(ctx)
	if err != nil {
		log.Fatalf("Error creating MongoDB repository: %v", err)
	}
	defer func() {
		if err := mongoRepo.Disconnect(ctx); err != nil {
			log.Printf("Error disconnecting MongoDB: %v", err)
		}
	}()

	// Configurar servicios
	secretKey := "12345678" // En producción usa os.Getenv("SECRET_KEY")

	// Servicio de logs de ventas (existente)
	salesLogService := saleslog.NewSalesLogService(mongoRepo, secretKey)
	salesLogHandler := api.NewSalesLogHandler(salesLogService)

	// Servicio bancario (nuevo)
	bankService := bank.NewBankService(mongoRepo)
	rulesService := rules.NewRulesService(mongoRepo)

	bankHandler := api.NewBankHandler(bankService)
	rulesHandler := api.NewRulesHandler(rulesService)

	// Configurar enrutador
	r := mux.NewRouter()

	// API versionada
	apiV1 := r.PathPrefix("/api/v1").Subrouter()

	// Rutas bancarias
	apiV1.HandleFunc("/accounts", bankHandler.CreateAccount).Methods("POST")
	apiV1.HandleFunc("/accounts/{accountNumber}", bankHandler.GetAccount).Methods("GET")
	apiV1.HandleFunc("/accounts/{accountNumber}/balance", bankHandler.GetBalanceAccount).Methods("GET")
	apiV1.HandleFunc("/accounts/{accountNumber}/deposit", bankHandler.Deposit).Methods("POST")
	// TODO: Descomentar las siguientes líneas si necesitas las funcionalidades de retiro y transferencia
	// apiV1.HandleFunc("/accounts/{accountNumber}/withdraw", bankHandler.Withdraw).Methods("POST")
	apiV1.HandleFunc("/accounts/{accountNumber}/transfer", bankHandler.Transfer).Methods("POST")
	// apiV1.HandleFunc("/accounts/{accountNumber}/transactions", bankHandler.GetTransactions).Methods("GET")

	apiV1.HandleFunc("/webhook", rulesHandler.GetRules).Methods("POST")

	// Rutas existentes de saleslog (si las necesitas mantener)
	r.HandleFunc("/", salesLogHandler.RootHandler)
	r.HandleFunc("/log", salesLogHandler.LogHandler)

	// Configurar middleware
	r.Use(loggingMiddleware)

	fmt.Println("Servidor Go escuchando en el puerto 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request: %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
