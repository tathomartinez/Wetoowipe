package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID            bson.ObjectID `bson:"_id,omitempty"`
	NumeroCuenta  string        `bson:"numero_cuenta"`
	Nombre        string        `bson:"nombre"`
	Saldo         float64       `bson:"saldo"`
	FechaCreacion time.Time     `bson:"fecha_creacion"`
}

type TransactionType string

const (
	TransactionTypeDeposito      TransactionType = "deposito"
	TransactionTypeRetiro        TransactionType = "retiro"
	TransactionTypeTransferencia TransactionType = "transferencia"
)

type TransactionStatus string

const (
	TransactionStatusProcesada TransactionStatus = "procesada"
	TransactionStatusFallida   TransactionStatus = "fallida"
	TransactionStatusPendiente TransactionStatus = "pendiente"
)

type Transaction struct {
	ID            bson.ObjectID     `bson:"_id,omitempty"`
	Tipo          TransactionType   `bson:"tipo"`
	CuentaOrigen  string            `bson:"cuenta_origen,omitempty"`  // Opcional para depósitos
	CuentaDestino string            `bson:"cuenta_destino,omitempty"` // Opcional para retiros
	Monto         float64           `bson:"monto"`
	Fecha         time.Time         `bson:"fecha"`
	Referencia    string            `bson:"referencia"`
	Descripcion   string            `bson:"descripcion"`
	Estado        TransactionStatus `bson:"estado"`
}
