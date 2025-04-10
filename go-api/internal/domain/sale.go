package domain

type SaleLogEntry struct {
	Fecha         string `json:"fecha"`
	Valor         int    `json:"valor"`
	Destinatario  string `json:"destinatario"`
	DestinatarioID string `json:"destinatario_id"`
	SHA           string `json:"sha"`
}