package bank

import (
	"context"
	"testing"

	"go-api/internal/domain"
)

type mockRepository struct {
	users        map[string]*domain.User
	transactions []domain.Transaction
}

func newMockRepository() *mockRepository {
	return &mockRepository{
		users:        make(map[string]*domain.User),
		transactions: []domain.Transaction{},
	}
}

func (m *mockRepository) CreateUser(ctx context.Context, user *domain.User) error {
	m.users[user.NumeroCuenta] = user
	return nil
}

func (m *mockRepository) GetUserByAccountNumber(ctx context.Context, numeroCuenta string) (*domain.User, error) {
	user, ok := m.users[numeroCuenta]
	if !ok {
		return nil, nil
	}
	return user, nil
}

func (m *mockRepository) UpdateUserBalance(ctx context.Context, numeroCuenta string, newBalance float64) error {
	if user, ok := m.users[numeroCuenta]; ok {
		user.Saldo = newBalance
	}
	return nil
}

func (m *mockRepository) GetBalanceAccount(ctx context.Context, accountNumber string) (float64, error) {
	if user, ok := m.users[accountNumber]; ok {
		return user.Saldo, nil
	}
	return 0, nil
}

func (m *mockRepository) CreateTransaction(ctx context.Context, transaction *domain.Transaction) error {
	m.transactions = append(m.transactions, *transaction)
	return nil
}

func (m *mockRepository) GetTransactionsByAccountNumber(ctx context.Context, accountNumber string) ([]domain.Transaction, error) {
	return m.transactions, nil
}

func (m *mockRepository) UpdateTransactionStatus(ctx context.Context, transactionID string, status string) error {
	return nil
}

func (m *mockRepository) GetSession(ctx context.Context) (interface{}, error) {
	return nil, nil
}

func TestCreateAccount(t *testing.T) {
	repo := newMockRepository()
	service := NewBankService(repo)
	ctx := context.Background()

	t.Run("creates account successfully", func(t *testing.T) {
		user := &domain.User{
			NumeroCuenta: "user123",
			Nombre:       "TestUser",
			Saldo:        100,
		}
		err := service.CreateAccount(ctx, user)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if repo.users["user123"] == nil {
			t.Error("user was not created")
		}
	})

	t.Run("fails with empty account number", func(t *testing.T) {
		user := &domain.User{
			NumeroCuenta: "",
			Nombre:       "TestUser",
			Saldo:        100,
		}
		err := service.CreateAccount(ctx, user)
		if err == nil {
			t.Error("expected error for empty account number")
		}
	})

	t.Run("fails with negative balance", func(t *testing.T) {
		user := &domain.User{
			NumeroCuenta: "user456",
			Nombre:       "TestUser",
			Saldo:        -50,
		}
		err := service.CreateAccount(ctx, user)
		if err == nil {
			t.Error("expected error for negative balance")
		}
	})
}

func TestDeposit(t *testing.T) {
	repo := newMockRepository()
	service := NewBankService(repo)
	ctx := context.Background()

	repo.users["user123"] = &domain.User{
		NumeroCuenta: "user123",
		Nombre:       "TestUser",
		Saldo:        100,
	}

	t.Run("deposits successfully", func(t *testing.T) {
		tx, err := service.Deposit(ctx, "user123", 50, "test deposit")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if tx.Monto != 50 {
			t.Errorf("expected amount 50, got %f", tx.Monto)
		}
		if repo.users["user123"].Saldo != 150 {
			t.Errorf("expected balance 150, got %f", repo.users["user123"].Saldo)
		}
	})

	t.Run("fails with negative amount", func(t *testing.T) {
		_, err := service.Deposit(ctx, "user123", -10, "invalid")
		if err == nil {
			t.Error("expected error for negative amount")
		}
	})

	t.Run("fails for nonexistent account", func(t *testing.T) {
		_, err := service.Deposit(ctx, "nonexistent", 50, "test")
		if err == nil {
			t.Error("expected error for nonexistent account")
		}
	})
}

func TestGetBalanceAccount(t *testing.T) {
	repo := newMockRepository()
	service := NewBankService(repo)
	ctx := context.Background()

	repo.users["user123"] = &domain.User{
		NumeroCuenta: "user123",
		Nombre:       "TestUser",
		Saldo:        250,
	}

	t.Run("returns balance", func(t *testing.T) {
		balance, err := service.GetBalanceAccount(ctx, "user123")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if balance != 250 {
			t.Errorf("expected 250, got %f", balance)
		}
	})

	t.Run("fails for empty account", func(t *testing.T) {
		_, err := service.GetBalanceAccount(ctx, "")
		if err == nil {
			t.Error("expected error for empty account")
		}
	})

	t.Run("fails for nonexistent account", func(t *testing.T) {
		_, err := service.GetBalanceAccount(ctx, "nonexistent")
		if err == nil {
			t.Error("expected error for nonexistent account")
		}
	})
}
