package api

import (
	"encoding/json"
	"fmt"
	"go-api/internal/app/rules"
	"go-api/internal/domain"
	"go-api/internal/infra/webhook"
	"net/http"
	"os"
)

type RulesHandler struct {
	service rules.RulesService
}

func NewRulesHandler(service rules.RulesService) *RulesHandler {
	return &RulesHandler{service: service}
}

func (h *RulesHandler) GetRules(w http.ResponseWriter, r *http.Request) {
	// Obtener las reglas desde el servicio
	rules, err := h.service.GetRules(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Construir el payload del webhook
	payload := webhook.WebhookPayload{
		Content: "¡Aquí están las reglas del gremio!",
		Embeds: []webhook.Embed{
			{
				Title:       rules.Title,
				Description: rules.Description,
				Color:       rules.Color,
				Fields:      convertFields(rules.Fields),
				Footer: webhook.Footer{
					Text:    rules.Footer.Text,
					IconURL: rules.Footer.IconURL,
				},
				Timestamp: rules.Timestamp,
			},
		},
		// Components: []webhook.ActionRow{
		// 	{
		// 		Type:       1,
		// 		Components: convertButtons(rules.Buttons),
		// 	},
		// },
	}

	// Obtener la URL del webhook desde las variables de entorno
	webhookURL := os.Getenv("DISCORD_WEBHOOK_URL")
	if webhookURL == "" {
		respondWithError(w, http.StatusInternalServerError, "Webhook URL no configurada")
		return
	}

	// Imprimir la URL del webhook
	fmt.Println("Webhook URL:", webhookURL)

	// Serializar el payload a JSON con indentación para imprimirlo
	payloadJSON, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error al serializar el payload: "+err.Error())
		return
	}

	// Imprimir el payload en formato JSON legible
	fmt.Println("Payload que se enviará al webhook:")
	fmt.Println(string(payloadJSON))

	// Enviar el payload al webhook
	err = webhook.SendWebhookMessage(webhookURL, payload)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error al enviar el webhook: "+err.Error())
		return
	}

	// Responder con éxito
	respondWithJSON(w, http.StatusOK, rules)
}

// Función para convertir los campos de las reglas al formato del webhook
func convertFields(fields []domain.Field) []webhook.Field {
	webhookFields := make([]webhook.Field, len(fields))
	for i, field := range fields {
		webhookFields[i] = webhook.Field{
			Name:  field.Name,
			Value: field.Value,
		}
	}
	return webhookFields
}

// // Función para convertir los botones de las reglas al formato del webhook
// func convertButtons(buttons []rules.Button) []webhook.Component {
// 	webhookButtons := make([]webhook.Component, len(buttons))
// 	for i, button := range buttons {
// 		webhookButtons[i] = webhook.Component{
// 			Type:     button.Type,
// 			Label:    button.Label,
// 			Style:    button.Style,
// 			CustomID: button.CustomID,
// 		}
// 	}
// 	return webhookButtons
// }
