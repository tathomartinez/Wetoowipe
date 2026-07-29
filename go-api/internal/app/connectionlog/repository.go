package connectionlog

import "go-api/internal/domain"

type Repository interface {
	InsertConnectionLog(entry domain.ConnectionLogEntry) error
}
