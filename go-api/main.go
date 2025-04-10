package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	//"time"
)

// Define la estructura para los datos del log
type LogData struct {
	Fecha         string `json:"fecha"`
	Valor         int    `json:"valor"`
	Destinatario  string `json:"destinatario"`
	DestinatarioID string `json:"destinatario_id"`
	SHA           string `json:"sha"`
}

// Handler para la ruta raíz ("/") - Devuelve "Hola Mundo"
func rootHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hola Mundo desde Go!")
}

// Handler para la ruta "/log" - Recibe y loguea los datos
func logHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var logData LogData
	err := json.NewDecoder(r.Body).Decode(&logData)
	if err != nil {
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}

	// Aquí puedes agregar validaciones adicionales si es necesario, como verificar el SHA.
	// Por ejemplo:
	// expectedSHA := calculateSHA(logData.Fecha, logData.Valor, logData.DestinatarioID, os.Getenv("SECRET_KEY"))
	// if logData.SHA != expectedSHA {
	// 	http.Error(w, "SHA no válido", http.StatusUnauthorized)
	// 	return
	// }

	logFilePath := "/app/api_logs.txt" // Ruta dentro del contenedor
	file, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("Error al abrir el archivo de log: %v", err)
		http.Error(w, "Error al escribir el log", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	logEntry := fmt.Sprintf("[%s] Valor: %d, Destinatario: %s (%s), SHA: %s\n",
		logData.Fecha, logData.Valor, logData.Destinatario, logData.DestinatarioID, logData.SHA)

	if _, err := file.WriteString(logEntry); err != nil {
		log.Printf("Error al escribir en el archivo de log: %v", err)
		http.Error(w, "Error al escribir el log", http.StatusInternalServerError)
		return
	}

	fmt.Println("API Go: Transacción recibida y logueada:", logData)
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Log registrado exitosamente")
}

func main() {
	http.HandleFunc("/", rootHandler)     // Manejador para la ruta raíz
	http.HandleFunc("/log", logHandler) // Manejador para la ruta /log
	fmt.Println("Servidor Go escuchando en el puerto 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Ejemplo de función para calcular el SHA en Go (debería coincidir con la lógica en Node.js)
// import "crypto/sha256"
// import "encoding/hex"
// func calculateSHA(fecha string, valor int, destinatarioID string, secretKey string) string {
// 	dataToHash := fmt.Sprintf("%s-%d-%s-%s", fecha, valor, destinatarioID, secretKey)
// 	hash := sha256.Sum([]byte(dataToHash))
// 	return hex.EncodeToString(hash[:])
// }