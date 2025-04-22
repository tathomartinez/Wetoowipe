package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"go-api/internal/app/bank"
	"go-api/internal/app/rules"
	"go-api/internal/app/saleslog"
	"go-api/internal/infra/api"
	"go-api/internal/infra/database"

	_ "go-api/docs"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
)

func main() {
	setupLogging() // Configurar el logging

	ctx := context.Background()
	mongoRepo := initializeDatabase(ctx)
	defer disconnectDatabase(ctx, mongoRepo)

	// Configurar servicios y handlers
	bankHandler, rulesHandler, salesLogHandler := initializeHandlers(mongoRepo)

	// Configurar enrutador
	router := setupRouter(bankHandler, rulesHandler, salesLogHandler)

	// Iniciar servidor
	startServer(router)
}

// setupLogging configura el sistema de logs
func setupLogging() {
	baseLogDir := "./logs/app"
	date := time.Now().Format("2006-01-02")
	logDir := baseLogDir + "/" + date

	if _, err := os.Stat(logDir); os.IsNotExist(err) {
		if err := os.MkdirAll(logDir, 0755); err != nil {
			log.Fatalf("No se pudo crear el directorio de logs: %v", err)
		}
	}

	logFile, err := os.OpenFile(logDir+"/app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("No se pudo abrir el archivo de log: %v", err)
	}

	log.SetOutput(logFile)
	log.Println("Logging configurado correctamente")
}

// initializeDatabase inicializa la conexión a la base de datos
func initializeDatabase(ctx context.Context) *database.MongoDBRepository {
	mongoRepo, err := database.NewMongoDBRepository(ctx)
	if err != nil {
		log.Fatalf("Error creando el repositorio MongoDB: %v", err)
	}
	return mongoRepo
}

// disconnectDatabase cierra la conexión a la base de datos
func disconnectDatabase(ctx context.Context, mongoRepo *database.MongoDBRepository) {
	if err := mongoRepo.Disconnect(ctx); err != nil {
		log.Printf("Error desconectando MongoDB: %v", err)
	}
}

// initializeHandlers configura los servicios y handlers
func initializeHandlers(mongoRepo *database.MongoDBRepository) (*api.BankHandler, *api.RulesHandler, *api.SalesLogHandler) {
	secretKey := "12345678" // En producción usa os.Getenv("SECRET_KEY")

	// Servicios
	bankService := bank.NewBankService(mongoRepo)
	rulesService := rules.NewRulesService(mongoRepo)
	salesLogService := saleslog.NewSalesLogService(mongoRepo, secretKey)

	// Handlers
	bankHandler := api.NewBankHandler(bankService)
	rulesHandler := api.NewRulesHandler(rulesService)
	salesLogHandler := api.NewSalesLogHandler(salesLogService)

	return bankHandler, rulesHandler, salesLogHandler
}

// setupRouter configura las rutas y middlewares
func setupRouter(bankHandler *api.BankHandler, rulesHandler *api.RulesHandler, salesLogHandler *api.SalesLogHandler) *mux.Router {
	r := mux.NewRouter()

	// API versionada
	apiV1 := r.PathPrefix("/api/v1").Subrouter()

	// Rutas bancarias
	apiV1.HandleFunc("/accounts", bankHandler.CreateAccount).Methods("POST")
	apiV1.HandleFunc("/accounts/{accountNumber}", bankHandler.GetAccount).Methods("GET")
	apiV1.HandleFunc("/accounts/{accountNumber}/balance", bankHandler.GetBalanceAccount).Methods("GET")
	apiV1.HandleFunc("/accounts/{accountNumber}/deposit", bankHandler.Deposit).Methods("POST")
	apiV1.HandleFunc("/accounts/{accountNumber}/transfer", bankHandler.Transfer).Methods("POST")
	// apiV1.HandleFunc("/accounts/{accountNumber}/withdraw", bankHandler.Withdraw).Methods("POST") // Descomentar si es necesario
	// apiV1.HandleFunc("/accounts/{accountNumber}/transactions", bankHandler.GetTransactions).Methods("GET") // Descomentar si es necesario

	// Rutas de reglas
	apiV1.HandleFunc("/webhook", rulesHandler.GetRules).Methods("POST")

	// Rutas de saleslog
	r.HandleFunc("/", salesLogHandler.RootHandler)
	r.HandleFunc("/log", salesLogHandler.LogHandler)

	// Middleware
	r.Use(loggingMiddleware)

	// Swagger
	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	return r
}

// startServer inicia el servidor HTTP
func startServer(router *mux.Router) {
	port := "8080" // En producción usa os.Getenv("APP_PORT")
	fmt.Printf("Servidor Go escuchando en el puerto %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

// loggingMiddleware es un middleware para registrar las solicitudes
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request: %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
