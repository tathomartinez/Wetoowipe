package webhook

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type Component struct {
	Type     int    `json:"type"`      // Tipo de componente (2 para botones)
	Label    string `json:"label"`     // Texto del botón
	Style    int    `json:"style"`     // Estilo del botón (1 = azul, 2 = gris, 3 = verde, 4 = rojo, 5 = enlace)
	CustomID string `json:"custom_id"` // ID único para identificar el botón
}

type ActionRow struct {
	Type       int         `json:"type"`       // Tipo de fila (1 para ActionRow)
	Components []Component `json:"components"` // Lista de componentes (botones)
}

type Field struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type Footer struct {
	Text    string `json:"text"`
	IconURL string `json:"icon_url"`
}

type Embed struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Color       int     `json:"color"`
	Fields      []Field `json:"fields,omitempty"`
	Footer      Footer  `json:"footer,omitempty"`
	Timestamp   string  `json:"timestamp,omitempty"`
}

type WebhookPayload struct {
	Content    string      `json:"content,omitempty"`    // Mensaje que se enviará al canal de Discord
	Embeds     []Embed     `json:"embeds,omitempty"`     // Embeds que se enviarán al canal de Discord
	Components []ActionRow `json:"components,omitempty"` // Lista de filas de componentes
}

func SendWebhookMessage(webhookURL string, payload WebhookPayload) error {
	payloadBytes, err := json.Marshal(payload)

	// Convertir el payload a JSON
	if err != nil {
		return fmt.Errorf("error al serializar el payload: %w", err)
	}

	// Enviar la solicitud POST al webhook
	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return fmt.Errorf("error al enviar el webhook: %w", err)
	}
	defer resp.Body.Close()

	// Verificar si la solicitud fue exitosa
	if resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("error en el webhook, código de estado: %d", resp.StatusCode)
	}

	return nil
}
