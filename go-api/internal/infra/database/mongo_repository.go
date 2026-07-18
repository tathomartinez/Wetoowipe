package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"go-api/internal/app/saleslog"
	"go-api/internal/domain"
)

type MongoDBRepository struct {
	client                 *mongo.Client
	databaseName           string
	collectionSales        string
	collectionUsers        string
	collectionTransactions string
}

func NewMongoDBRepository(ctx context.Context) (*MongoDBRepository, error) {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		return nil, fmt.Errorf("MONGO_URI environment variable is required")
	}
	MONGO_ROOT_USERNAME := os.Getenv("MONGO_ROOT_USERNAME")
	if MONGO_ROOT_USERNAME == "" {
		return nil, fmt.Errorf("MONGO_ROOT_USERNAME environment variable is required")
	}
	MONGO_ROOT_PASSWORD := os.Getenv("MONGO_ROOT_PASSWORD")
	if MONGO_ROOT_PASSWORD == "" {
		return nil, fmt.Errorf("MONGO_ROOT_PASSWORD environment variable is required")
	}

	opts := options.Client().
		ApplyURI(mongoURI).
		SetAuth(options.Credential{
			Username: MONGO_ROOT_USERNAME,
			Password: MONGO_ROOT_PASSWORD,
		})

	client, err := mongo.Connect(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := client.Ping(pingCtx, nil); err != nil {
		_ = client.Disconnect(ctx)
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	log.Println("✅ Ping successful. Connected to MongoDB!")

	databaseName := os.Getenv("MONGO_DATABASE")
	if databaseName == "" {
		databaseName = "bankdb"
	}

	db := client.Database(databaseName)

	usersCollection := db.Collection("users")
	_, err = usersCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "numero_cuenta", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create unique index for numero_cuenta: %w", err)
	}

	transactionsCollection := db.Collection("transactions")
	_, err = transactionsCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "referencia", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create unique index for referencia: %w", err)
	}

	return &MongoDBRepository{
		client:                 client,
		databaseName:           databaseName,
		collectionSales:        "sales_logs",
		collectionUsers:        "users",
		collectionTransactions: "transactions",
	}, nil
}

func (r *MongoDBRepository) GetSession(ctx context.Context) (*mongo.Session, error) {
	return r.client.StartSession()
}

func (r *MongoDBRepository) CreateUser(ctx context.Context, user *domain.User) error {
	collection := r.client.Database(r.databaseName).Collection(r.collectionUsers)
	user.FechaCreacion = time.Now()
	_, err := collection.InsertOne(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

func (r *MongoDBRepository) GetUserByAccountNumber(ctx context.Context, numeroCuenta string) (*domain.User, error) {
	collection := r.client.Database(r.databaseName).Collection(r.collectionUsers)
	var user domain.User
	err := collection.FindOne(ctx, bson.M{"numero_cuenta": numeroCuenta}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}
	return &user, nil
}

func (r *MongoDBRepository) UpdateUserBalance(ctx context.Context, numeroCuenta string, newBalance float64) error {
	collection := r.client.Database(r.databaseName).Collection(r.collectionUsers)
	_, err := collection.UpdateOne(
		ctx,
		bson.M{"numero_cuenta": numeroCuenta},
		bson.M{"$set": bson.M{"saldo": newBalance}},
	)
	if err != nil {
		return fmt.Errorf("failed to update user balance: %w", err)
	}
	return nil
}

func (r *MongoDBRepository) CreateTransaction(ctx context.Context, transaction *domain.Transaction) error {
	collection := r.client.Database(r.databaseName).Collection(r.collectionTransactions)
	transaction.Fecha = time.Now()
	transaction.ID = bson.NewObjectID()
	_, err := collection.InsertOne(ctx, transaction)
	if err != nil {
		return fmt.Errorf("failed to create transaction: %w", err)
	}
	return nil
}

func (r *MongoDBRepository) GetTransactionsByAccountNumber(ctx context.Context, numeroCuenta string) ([]domain.Transaction, error) {
	collection := r.client.Database(r.databaseName).Collection(r.collectionTransactions)
	filter := bson.M{
		"$or": []bson.M{
			{"cuenta_origen": numeroCuenta},
			{"cuenta_destino": numeroCuenta},
		},
	}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to find transactions: %w", err)
	}
	defer cursor.Close(ctx)
	var transactions []domain.Transaction
	if err := cursor.All(ctx, &transactions); err != nil {
		return nil, fmt.Errorf("failed to decode transactions: %w", err)
	}
	return transactions, nil
}

func (r *MongoDBRepository) SaveLog(logEntry domain.SaleLogEntry) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := r.client.Database(r.databaseName).Collection(r.collectionSales)
	_, err := collection.InsertOne(ctx, logEntry)
	if err != nil {
		log.Printf("Error al guardar log: %v", err)
		return fmt.Errorf("failed to insert log entry: %w", err)
	}
	log.Printf("Log guardado para destinatario_id: %s", logEntry.DestinatarioID)
	return nil
}

func (r *MongoDBRepository) GetLogByID(id string) (*domain.SaleLogEntry, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := r.client.Database(r.databaseName).Collection(r.collectionSales)
	var logEntry domain.SaleLogEntry
	err := collection.FindOne(ctx, bson.M{"destinatario_id": id}).Decode(&logEntry)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find log entry: %w", err)
	}
	return &logEntry, nil
}

func (r *MongoDBRepository) Disconnect(ctx context.Context) error {
	return r.client.Disconnect(ctx)
}

func (r *MongoDBRepository) GetBalanceAccount(ctx context.Context, numeroCuenta string) (float64, error) {
	collection := r.client.Database(r.databaseName).Collection(r.collectionUsers)
	var user domain.User
	err := collection.FindOne(ctx, bson.M{"numero_cuenta": numeroCuenta}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return 0, fmt.Errorf("account not found")
		}
		return 0, fmt.Errorf("failed to get account: %w", err)
	}
	return user.Saldo, nil
}

func (r *MongoDBRepository) UpdateTransactionStatus(ctx context.Context, transactionID string, status string) error {
	collection := r.client.Database(r.databaseName).Collection(r.collectionTransactions)
	objectID, err := bson.ObjectIDFromHex(transactionID)
	if err != nil {
		return fmt.Errorf("invalid transaction ID format: %w", err)
	}
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{"estado": status}}
	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update transaction status: %w", err)
	}
	log.Printf("Resultado de la actualización: MatchedCount=%d, ModifiedCount=%d", result.MatchedCount, result.ModifiedCount)
	if result.MatchedCount == 0 {
		return fmt.Errorf("transaction not found")
	}
	return nil
}

func (r *MongoDBRepository) GetRules(ctx context.Context) (*domain.Rules, error) {
	collection := r.client.Database(r.databaseName).Collection("rules")
	var rules domain.Rules
	err := collection.FindOne(ctx, bson.M{"_id": "rules_webhook"}).Decode(&rules)
	if err != nil {
		return nil, fmt.Errorf("failed to get rules: %w", err)
	}
	return &rules, nil
}

var _ saleslog.Repository = &MongoDBRepository{}
