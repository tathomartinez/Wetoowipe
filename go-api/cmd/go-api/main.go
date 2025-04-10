package main

import (
    "context"
    "log"
    "net/http"
    "os"
	"fmt"
	"go-api/internal/app/saleslog"      // Reemplaza con la ruta correcta
	"go-api/internal/infra/api"         // Reemplaza con la ruta correcta
	"go-api/internal/infra/database"    // Reemplaza con la ruta correcta
)

func main() {
	ctx := context.Background()
	mongoRepo, err := database.NewMongoDBRepository(ctx)
	if err != nil {
		log.Fatalf("Error creating MongoDB repository: %v", err)
	}
	// defer mongoRepo.client.Disconnect(ctx) // Elimina esta línea

	secretKey := os.Getenv("SECRET_KEY")

	salesLogService := saleslog.NewSalesLogService(mongoRepo, secretKey)
	salesLogHandler := api.NewSalesLogHandler(salesLogService)

	http.HandleFunc("/", salesLogHandler.RootHandler)
	http.HandleFunc("/log", salesLogHandler.LogHandler)

	fmt.Println("Servidor Go escuchando en el puerto 8080 (con MongoDB)")
	log.Fatal(http.ListenAndServe(":8080", nil))
}