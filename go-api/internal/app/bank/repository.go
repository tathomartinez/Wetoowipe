package bank

import (
	"context"
	"go-api/internal/domain"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type BankRepository interface {
	CreateUser(ctx context.Context, user *domain.User) error
	GetUserByAccountNumber(ctx context.Context, numeroCuenta string) (*domain.User, error)
	UpdateUserBalance(ctx context.Context, numeroCuenta string, newBalance float64) error
	GetBalanceAccount(ctx context.Context, accountNumber string) (float64, error)
	CreateTransaction(ctx context.Context, transaction *domain.Transaction) error
	GetTransactionsByAccountNumber(ctx context.Context, accountNumber string) ([]domain.Transaction, error)
	UpdateTransactionStatus(ctx context.Context, transactionID string, status string) error
	GetSession(ctx context.Context) (*mongo.Session, error)
}
