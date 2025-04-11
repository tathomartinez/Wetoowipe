package api

import (
	"encoding/json"
	"go-api/internal/app/bank"
	"go-api/internal/domain"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type BankHandler struct {
	service bank.Service
}

func NewBankHandler(service bank.Service) *BankHandler {
	return &BankHandler{service: service}
}

// CreateAccount godoc
// @Summary Create a new bank account
// @Description Create a new bank account with initial balance
// @Tags accounts
// @Accept  json
// @Produce json
// @Param account body domain.User true "Account details"
// @Success 201 {object} domain.User
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/accounts [post]
func (h *BankHandler) CreateAccount(w http.ResponseWriter, r *http.Request) {
	log.Println("CreateAccount: Received request to create a new account")

	var user domain.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		log.Printf("CreateAccount: Failed to decode request payload: %v", err)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	log.Printf("CreateAccount: Decoded user payload: %+v", user)

	if err := h.service.CreateAccount(r.Context(), &user); err != nil {
		log.Printf("CreateAccount: Failed to create account: %v", err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	log.Printf("CreateAccount: Successfully created account for user: %+v", user)

	respondWithJSON(w, http.StatusCreated, user)
	log.Println("CreateAccount: Response sent with status 201 Created")
}

// GetAccount godoc
// @Summary Get account details
// @Description Get details of a bank account by account number
// @Tags accounts
// @Produce json
// @Param accountNumber path string true "Account number"
// @Success 200 {object} domain.User
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/accounts/{accountNumber} [get]
func (h *BankHandler) GetAccount(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	accountNumber := vars["accountNumber"]

	account, err := h.service.GetAccount(r.Context(), accountNumber)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if account == nil {
		respondWithError(w, http.StatusNotFound, "Account not found")
		return
	}

	respondWithJSON(w, http.StatusOK, account)
}

// Deposit godoc
// @Summary Deposit money
// @Description Deposit money to an account
// @Tags transactions
// @Accept  json
// @Produce json
// @Param accountNumber path string true "Account number"
// @Param transaction body TransactionRequest true "Deposit details"
// @Success 200 {object} domain.Transaction
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/accounts/{accountNumber}/deposit [post]
func (h *BankHandler) Deposit(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	accountNumber := vars["accountNumber"]

	var req TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	transaction, err := h.service.Deposit(r.Context(), accountNumber, req.Amount, req.Description)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, transaction)
}

func (h *BankHandler) GetBalanceAccount(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	numeroCuenta := vars["accountNumber"]

	log.Printf("GetBalance: Received request for account number: %s", numeroCuenta)

	balance, err := h.service.GetBalanceAccount(r.Context(), numeroCuenta)
	if err != nil {
		log.Printf("GetBalance: Failed to get balance: %v", err)
		respondWithError(w, http.StatusNotFound, "Account not found")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]float64{"balance": balance})
}

// Similar implementations for Withdraw, Transfer, GetTransactions...

type TransactionRequest struct {
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, ErrorResponse{Error: message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}

func (h *BankHandler) Transfer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fromAccount := vars["accountNumber"]

	var req struct {
		ToAccount   string  `json:"toAccount"`
		Amount      float64 `json:"amount"`
		Description string  `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Transfer: Failed to decode request: %v", err)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	transaction, err := h.service.Transfer(r.Context(), fromAccount, req.ToAccount, req.Amount, req.Description)
	if err != nil {
		log.Printf("Transfer: Failed to process transfer: %v", err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, transaction)
}
