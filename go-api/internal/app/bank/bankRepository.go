package bank

import (
	"context"
	"go-api/internal/domain"
)

type BankRepository interface {
	CreateUser(ctx context.Context, user *domain.User) error
	GetUserByAccountNumber(ctx context.Context, numeroCuenta string) (*domain.User, error)
	UpdateUserBalance(ctx context.Context, numeroCuenta string, newBalance float64) error
	GetBalanceAccount(ctx context.Context, accountNumber string) (float64, error)
	CreateTransaction(ctx context.Context, transaction *domain.Transaction) error
	GetTransactionsByAccount(ctx context.Context, numeroCuenta string) ([]domain.Transaction, error)
	GetTransactionsByAccountNumber(ctx context.Context, accountNumber string) ([]domain.Transaction, error)
}
