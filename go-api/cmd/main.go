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
	setupLogging()

	ctx := context.Background()
	mongoRepo := initializeDatabase(ctx)
	defer disconnectDatabase(ctx, mongoRepo)

	bankHandler, rulesHandler, salesLogHandler := initializeHandlers(mongoRepo)

	router := setupRouter(bankHandler, rulesHandler, salesLogHandler)

	startServer(router)
}

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

func initializeDatabase(ctx context.Context) *database.MongoDBRepository {
	mongoRepo, err := database.NewMongoDBRepository(ctx)
	if err != nil {
		log.Fatalf("Error creando el repositorio MongoDB: %v", err)
	}
	return mongoRepo
}

func disconnectDatabase(ctx context.Context, mongoRepo *database.MongoDBRepository) {
	if err := mongoRepo.Disconnect(ctx); err != nil {
		log.Printf("Error desconectando MongoDB: %v", err)
	}
}

func initializeHandlers(mongoRepo *database.MongoDBRepository) (*api.BankHandler, *api.RulesHandler, *api.SalesLogHandler) {
	secretKey := os.Getenv("SECRET_KEY")
	if secretKey == "" {
		log.Fatal("SECRET_KEY environment variable is required")
	}

	bankService := bank.NewBankService(mongoRepo)
	rulesService := rules.NewRulesService(mongoRepo)
	salesLogService := saleslog.NewSalesLogService(mongoRepo, secretKey)

	bankHandler := api.NewBankHandler(bankService)
	rulesHandler := api.NewRulesHandler(rulesService)
	salesLogHandler := api.NewSalesLogHandler(salesLogService)

	return bankHandler, rulesHandler, salesLogHandler
}

func setupRouter(bankHandler *api.BankHandler, rulesHandler *api.RulesHandler, salesLogHandler *api.SalesLogHandler) *mux.Router {
	r := mux.NewRouter()

	apiV1 := r.PathPrefix("/api/v1").Subrouter()

	apiV1.HandleFunc("/accounts", bankHandler.CreateAccount).Methods("POST")
	apiV1.HandleFunc("/accounts/{accountNumber}", bankHandler.GetAccount).Methods("GET")
	apiV1.HandleFunc("/accounts/{accountNumber}/balance", bankHandler.GetBalanceAccount).Methods("GET")
	apiV1.HandleFunc("/accounts/{accountNumber}/deposit", bankHandler.Deposit).Methods("POST")
	apiV1.HandleFunc("/accounts/{accountNumber}/transfer", bankHandler.Transfer).Methods("POST")

	apiV1.HandleFunc("/webhook", rulesHandler.GetRules).Methods("POST")

	r.HandleFunc("/", salesLogHandler.RootHandler)
	r.HandleFunc("/log", salesLogHandler.LogHandler)

	r.Use(loggingMiddleware)
	r.Use(api.AuthMiddleware)

	// Swagger only in development
	if os.Getenv("APP_ENV") != "production" {
		r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)
	}

	return r
}

func startServer(router *mux.Router) {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Servidor Go escuchando en el puerto %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request: %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
