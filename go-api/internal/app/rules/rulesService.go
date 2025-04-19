<<<<<<< HEAD
package rules

import (
	"context"
	"go-api/internal/domain"
)

// RulesService define la interfaz para el servicio de reglas
type RulesService interface {
	GetRules(ctx context.Context) (*domain.WebhookContent, error)
}
=======
package rules

import (
	"context"
	"go-api/internal/domain"
)

// RulesService define la interfaz para el servicio de reglas
type RulesService interface {
	GetRules(ctx context.Context) (*domain.WebhookContent, error)
}
>>>>>>> master
