package saleslog

import "go-api/internal/domain" // Reemplaza con la ruta correcta

type Repository interface {
	SaveLog(logEntry domain.SaleLogEntry) error
    GetLogByID(id string) (*domain.SaleLogEntry, error)
}