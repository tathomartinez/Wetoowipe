package domain

type WebhookContent struct {
	Title       string
	Description string
	Color       int
	Fields      []Field
	Footer      Footer
	Timestamp   string
	Buttons     []Button
}

type Rules struct {
	ID      string   `bson:"_id"`     // Identificador del documento
	Embed   Embed    `bson:"embed"`   // Contenido del embed
	Buttons []Button `bson:"buttons"` // Lista de botones interactivos
}

type Embed struct {
	Title       string  `bson:"title"`       // Título del embed
	Description string  `bson:"description"` // Descripción del embed
	Color       int     `bson:"color"`       // Color del embed (en formato decimal)
	Fields      []Field `bson:"fields"`      // Lista de campos del embed
	Footer      Footer  `bson:"footer"`      // Pie de página del embed
	Timestamp   string  `bson:"timestamp"`   // Marca de tiempo del embed
}

type Field struct {
	Name  string `bson:"name"`  // Nombre del campo
	Value string `bson:"value"` // Valor del campo
}

type Footer struct {
	Text    string `bson:"text"`     // Texto del pie de página
	IconURL string `bson:"icon_url"` // URL del ícono del pie de página
}

type Button struct {
	Type     int    `bson:"type"`      // Tipo de botón (2 para botones interactivos)
	Label    string `bson:"label"`     // Texto del botón
	Style    int    `bson:"style"`     // Estilo del botón (1 = azul, 3 = verde, 4 = rojo, etc.)
	CustomID string `bson:"custom_id"` // Identificador único del botón
}
