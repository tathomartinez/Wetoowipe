package bank

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"go-api/internal/domain"
	"time"
)

type Service interface {
	CreateAccount(ctx context.Context, user *domain.User) error
	GetAccount(ctx context.Context, accountNumber string) (*domain.User, error)
	GetBalanceAccount(ctx context.Context, accountNumber string) (float64, error)
	Deposit(ctx context.Context, accountNumber string, amount float64, description string) (*domain.Transaction, error)
	Withdraw(ctx context.Context, accountNumber string, amount float64, description string) (*domain.Transaction, error)
	Transfer(ctx context.Context, fromAccount, toAccount string, amount float64, description string) (*domain.Transaction, error)
	GetTransactions(ctx context.Context, accountNumber string) ([]domain.Transaction, error)
	UpdateTransactionStatus(ctx context.Context, transactionID string, status string) error
}

type BankService struct {
	repo BankRepository
}

func NewBankService(repo BankRepository) *BankService {
	return &BankService{repo: repo}
}

func (s *BankService) CreateAccount(ctx context.Context, user *domain.User) error {
	if user.NumeroCuenta == "" {
		return errors.New("account number is required")
	}
	if user.Saldo < 0 {
		return errors.New("initial balance cannot be negative")
	}

	// Inicializar FechaCreacion si no está configurada
	if user.FechaCreacion.IsZero() {
		user.FechaCreacion = time.Now()
	}

	return s.repo.CreateUser(ctx, user)
}

func (s *BankService) GetAccount(ctx context.Context, accountNumber string) (*domain.User, error) {
	return s.repo.GetUserByAccountNumber(ctx, accountNumber)
}

func (s *BankService) Deposit(ctx context.Context, accountNumber string, amount float64, description string) (*domain.Transaction, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	account, err := s.repo.GetUserByAccountNumber(ctx, accountNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to get account: %w", err)
	}
	if account == nil {
		return nil, errors.New("account not found")
	}

	newBalance := account.Saldo + amount
	if err := s.repo.UpdateUserBalance(ctx, accountNumber, newBalance); err != nil {
		return nil, fmt.Errorf("failed to update balance: %w", err)
	}

	transaction := &domain.Transaction{
		Tipo:          domain.TransactionTypeDeposito,
		CuentaDestino: accountNumber,
		Monto:         amount,
		Descripcion:   description,
		Estado:        domain.TransactionStatusProcesada,
	}

	if err := s.repo.CreateTransaction(ctx, transaction); err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

func (s *BankService) Withdraw(ctx context.Context, accountNumber string, amount float64, description string) (*domain.Transaction, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	account, err := s.repo.GetUserByAccountNumber(ctx, accountNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to get account: %w", err)
	}
	if account == nil {
		return nil, errors.New("account not found")
	}

	if account.Saldo < amount {
		return nil, errors.New("insufficient funds")
	}

	newBalance := account.Saldo - amount
	if err := s.repo.UpdateUserBalance(ctx, accountNumber, newBalance); err != nil {
		return nil, fmt.Errorf("failed to update balance: %w", err)
	}

	transaction := &domain.Transaction{
		Tipo:         domain.TransactionTypeRetiro,
		CuentaOrigen: accountNumber,
		Monto:        amount,
		Descripcion:  description,
		Estado:       domain.TransactionStatusProcesada,
	}

	if err := s.repo.CreateTransaction(ctx, transaction); err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

func generateUniqueReference() (string, error) {
	// Generar un identificador único
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate unique reference: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}

func (s *BankService) Transfer(ctx context.Context, fromAccount, toAccount string, amount float64, description string) (*domain.Transaction, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	// Generar una referencia única para la transacción
	reference, err := generateUniqueReference()
	if err != nil {
		return nil, fmt.Errorf("failed to generate transaction reference: %w", err)
	}

	// Crear la transacción con estado "Pendiente"
	transaction := &domain.Transaction{
		Tipo:          domain.TransactionTypeTransferencia,
		CuentaOrigen:  fromAccount,
		CuentaDestino: toAccount,
		Monto:         amount,
		Descripcion:   description,
		Estado:        domain.TransactionStatusPendiente,
		Referencia:    reference,
		FechaCreacion: time.Now(),
	}

	// Guardar la transacción inicial
	if err := s.repo.CreateTransaction(ctx, transaction); err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Cambiar el estado a "En Proceso"
	transaction.Estado = domain.TransactionStatusEnProceso
	if err := s.repo.UpdateTransactionStatus(ctx, transaction.ID.Hex(), string(transaction.Estado)); err != nil {
		return nil, fmt.Errorf("failed to update transaction status: %w", err)
	}
	time.Sleep(2 * time.Second)

	// Obtener la cuenta del remitente
	fromAccountData, err := s.repo.GetUserByAccountNumber(ctx, fromAccount)
	if err != nil {
		transaction.Estado = domain.TransactionStatusFallida
		s.repo.UpdateTransactionStatus(ctx, transaction.ID.Hex(), string(transaction.Estado))
		return nil, fmt.Errorf("failed to get source account: %w", err)
	}
	if fromAccountData == nil {
		transaction.Estado = domain.TransactionStatusFallida
		s.repo.UpdateTransactionStatus(ctx, transaction.ID.Hex(), string(transaction.Estado))
		return nil, errors.New("source account not found")
	}

	// Verificar saldo suficiente
	if fromAccountData.Saldo < amount {
		transaction.Estado = domain.TransactionStatusFallida
		s.repo.UpdateTransactionStatus(ctx, transaction.ID.Hex(), string(transaction.Estado))
		return nil, errors.New("insufficient funds in source account")
	}

	// Obtener la cuenta del beneficiario
	toAccountData, err := s.repo.GetUserByAccountNumber(ctx, toAccount)
	if err != nil {
		transaction.Estado = domain.TransactionStatusFallida
		s.repo.UpdateTransactionStatus(ctx, transaction.ID.Hex(), string(transaction.Estado))
		return nil, fmt.Errorf("failed to get destination account: %w", err)
	}

	if toAccountData == nil {
		transaction.Estado = domain.TransactionStatusFallida
		s.repo.UpdateTransactionStatus(ctx, transaction.ID.Hex(), string(transaction.Estado))
		return nil, errors.New("destination account not found")
	}

	// Actualizar saldos
	newFromBalance := fromAccountData.Saldo - amount
	newToBalance := toAccountData.Saldo + amount

	if err := s.repo.UpdateUserBalance(ctx, fromAccount, newFromBalance); err != nil {
		transaction.Estado = domain.TransactionStatusFallida
		s.repo.UpdateTransactionStatus(ctx, transaction.ID.Hex(), string(transaction.Estado))
		return nil, fmt.Errorf("failed to update source account balance: %w", err)
	}

	if err := s.repo.UpdateUserBalance(ctx, toAccount, newToBalance); err != nil {
		transaction.Estado = domain.TransactionStatusFallida
		s.repo.UpdateTransactionStatus(ctx, transaction.ID.Hex(), string(transaction.Estado))
		return nil, fmt.Errorf("failed to update destination account balance: %w", err)
	}
	time.Sleep(1 * time.Second) // Pausar por 5 segundos

	// Cambiar el estado a "Procesada"
	transaction.Estado = domain.TransactionStatusProcesada
	if err := s.repo.UpdateTransactionStatus(ctx, transaction.ID.Hex(), string(transaction.Estado)); err != nil {
		return nil, fmt.Errorf("failed to update transaction status: %w", err)
	}

	return transaction, nil
}

func (s *BankService) GetTransactions(ctx context.Context, accountNumber string) ([]domain.Transaction, error) {
	// Verificar que el número de cuenta no esté vacío
	if accountNumber == "" {
		return nil, errors.New("account number is required")
	}

	// Obtener las transacciones desde el repositorio
	transactions, err := s.repo.GetTransactionsByAccountNumber(ctx, accountNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions: %w", err)
	}

	return transactions, nil
}

func (s *BankService) GetBalanceAccount(ctx context.Context, accountNumber string) (float64, error) {
	// Verificar que el número de cuenta no esté vacío
	if accountNumber == "" {
		return 0, errors.New("account number is required")
	}

	// Obtener la cuenta desde el repositorio
	account, err := s.repo.GetUserByAccountNumber(ctx, accountNumber)
	if err != nil {
		return 0, fmt.Errorf("failed to get account: %w", err)
	}
	if account == nil {
		return 0, errors.New("account not found")
	}

	return account.Saldo, nil
}

func (s *BankService) UpdateTransactionStatus(ctx context.Context, transactionID string, status string) error {
	// Verificar que el ID de transacción no esté vacío
	if transactionID == "" {
		return errors.New("transaction ID is required")
	}

	// Actualizar el estado de la transacción en el repositorio
	if err := s.repo.UpdateTransactionStatus(ctx, transactionID, status); err != nil {
		return fmt.Errorf("failed to update transaction status: %w", err)
	}

	return nil
}
