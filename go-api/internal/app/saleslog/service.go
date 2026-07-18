package saleslog

import (
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"go-api/internal/domain"
)

type SalesLogService struct {
	repo      Repository
	secretKey string
}

func NewSalesLogService(repo Repository, secretKey string) *SalesLogService {
	return &SalesLogService{
		repo:      repo,
		secretKey: secretKey,
	}
}

func (s *SalesLogService) LogSale(logEntry domain.SaleLogEntry) error {
	expectedSHA := calculateSHA(logEntry.Fecha, logEntry.Valor, logEntry.DestinatarioID, s.secretKey)
	if logEntry.SHA != expectedSHA {
		return fmt.Errorf("SHA no válido")
	}
	return s.repo.SaveLog(logEntry)
}

func calculateSHA(fecha string, valor int, destinatarioID string, secretKey string) string {
	dataToHash := fmt.Sprintf("%s-%d-%s-%s", fecha, valor, destinatarioID, secretKey)
	hash := sha512.Sum512([]byte(dataToHash))
	return hex.EncodeToString(hash[:])
}
