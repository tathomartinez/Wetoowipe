package api

import (
	"encoding/json"
	"fmt"
	"go-api/internal/app/saleslog" // Reemplaza con la ruta correcta
	"go-api/internal/domain"       // Reemplaza con la ruta correcta
	"log"                          // Importa el paquete log
	"net/http"
)

type SalesLogHandler struct {
	service *saleslog.SalesLogService
}

func NewSalesLogHandler(service *saleslog.SalesLogService) *SalesLogHandler {
	return &SalesLogHandler{
		service: service,
	}
}

func (h *SalesLogHandler) RootHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Petición recibida en la ruta raíz (%s %s)", r.Method, r.URL.Path) // Log al acceder a la raíz
	fmt.Fprintf(w, "Hola Mundo desde Go!")
}

func (h *SalesLogHandler) LogHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Petición recibida en la ruta /log (%s %s)", r.Method, r.URL.Path) // Log al acceder a /log

	if r.Method != http.MethodPost {
		log.Printf("Método no permitido en /log: %s", r.Method)
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var logEntry domain.SaleLogEntry
	err := json.NewDecoder(r.Body).Decode(&logEntry)
	if err != nil {
		log.Printf("Error al decodificar el JSON en /log: %v", err)
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}

	log.Printf("Datos JSON recibidos en /log: %+v", logEntry) // Log de los datos recibidos

	err = h.service.LogSale(logEntry)
	if err != nil {
		if err.Error() == "SHA no válido" {
			log.Printf("SHA no válido recibido en /log: %s", logEntry.SHA)
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		log.Printf("Error al procesar el log en /log: %v", err)
		http.Error(w, "Error al procesar el log", http.StatusInternalServerError)
		return
	}

	log.Println("Log registrado exitosamente para:", logEntry.DestinatarioID) // Log de éxito

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Log registrado exitosamente",
	})

}
