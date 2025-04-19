<<<<<<< HEAD
package rules

import (
	"context"
	"fmt"
	"go-api/internal/domain"
)

type RulesServiceImpl struct {
	repo RulesRepository
}

func NewRulesService(repo RulesRepository) *RulesServiceImpl {
	return &RulesServiceImpl{repo: repo}
}
func (s *RulesServiceImpl) GetRules(ctx context.Context) (*domain.WebhookContent, error) {
	// Obtener las reglas desde el repositorio
	rules, err := s.repo.GetRules(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get rules: %w", err)
	}

	// Log para verificar los datos obtenidos desde el repositorio
	fmt.Printf("Datos obtenidos desde el repositorio: %+v\n", rules)

	// Convertir las reglas al formato WebhookContent
	webhookContent := &domain.WebhookContent{
		Title:       rules.Embed.Title,
		Description: rules.Embed.Description,
		Color:       rules.Embed.Color,
		Fields:      convertFields(rules.Embed.Fields),
		Footer: domain.Footer{
			Text:    rules.Embed.Footer.Text,
			IconURL: rules.Embed.Footer.IconURL,
		},
		Timestamp: rules.Embed.Timestamp,
		// Buttons:   convertButtons(rules.Buttons),
	}

	// Log para verificar los datos convertidos
	fmt.Printf("Datos convertidos a WebhookContent: %+v\n", webhookContent)

	return webhookContent, nil
}

func convertFields(fields []domain.Field) []domain.Field {
	converted := make([]domain.Field, len(fields))
	for i, field := range fields {
		converted[i] = domain.Field{
			Name:  field.Name,
			Value: field.Value,
		}
	}
	return converted
}
=======
package rules

import (
	"context"
	"fmt"
	"go-api/internal/domain"
)

type RulesServiceImpl struct {
	repo RulesRepository
}

func NewRulesService(repo RulesRepository) *RulesServiceImpl {
	return &RulesServiceImpl{repo: repo}
}
func (s *RulesServiceImpl) GetRules(ctx context.Context) (*domain.WebhookContent, error) {
	// Obtener las reglas desde el repositorio
	rules, err := s.repo.GetRules(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get rules: %w", err)
	}

	// Log para verificar los datos obtenidos desde el repositorio
	fmt.Printf("Datos obtenidos desde el repositorio: %+v\n", rules)

	// Convertir las reglas al formato WebhookContent
	webhookContent := &domain.WebhookContent{
		Title:       rules.Embed.Title,
		Description: rules.Embed.Description,
		Color:       rules.Embed.Color,
		Fields:      convertFields(rules.Embed.Fields),
		Footer: domain.Footer{
			Text:    rules.Embed.Footer.Text,
			IconURL: rules.Embed.Footer.IconURL,
		},
		Timestamp: rules.Embed.Timestamp,
		// Buttons:   convertButtons(rules.Buttons),
	}

	// Log para verificar los datos convertidos
	fmt.Printf("Datos convertidos a WebhookContent: %+v\n", webhookContent)

	return webhookContent, nil
}

func convertFields(fields []domain.Field) []domain.Field {
	converted := make([]domain.Field, len(fields))
	for i, field := range fields {
		converted[i] = domain.Field{
			Name:  field.Name,
			Value: field.Value,
		}
	}
	return converted
}
>>>>>>> master
