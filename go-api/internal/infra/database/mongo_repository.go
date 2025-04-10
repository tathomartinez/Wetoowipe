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
	// "go.mongodb.org/mongo-driver/bson"
	// "go.mongodb.org/mongo-driver/mongo"
	// "go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDBRepository struct {
	client         *mongo.Client
	databaseName   string
	collectionName string
}

func NewMongoDBRepository(ctx context.Context) (*MongoDBRepository, error) {
	// uri := os.Getenv("MONGODB_URI")
	// if uri == "" {
	// 	return nil, fmt.Errorf("MONGODB_URI environment variable not set")
	// }

	// Configuración de la API estable como en la documentación
	// serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().
		// ApplyURI("mongodb://root:example@mongodb:27017/")
		ApplyURI("mongodb://root:example@localhost:27017/")
		// SetServerAPIOptions(serverAPI).
		// SetConnectTimeout(10 * time.Second).
		// SetServerSelectionTimeout(10 * time.Second)

	opts = opts.SetAuth(options.Credential{
		Username: "root",
		Password: "example",
	})

	client, err := mongo.Connect(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Realizar ping exactamente como en la documentación
	var result bson.M
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := client.Database("admin").RunCommand(pingCtx, bson.D{{"ping", 1}}).Decode(&result); err != nil {
		_ = client.Disconnect(ctx) // Limpiar conexión si falla
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	log.Println("✅ Ping successful. Connected to MongoDB!")

	databaseName := os.Getenv("MONGO_DATABASE")
	if databaseName == "" {
		databaseName = "defaultdb"
	}

	return &MongoDBRepository{
		client:         client,
		databaseName:   databaseName,
		collectionName: "sales_logs",
	}, nil
}

func (r *MongoDBRepository) SaveLog(logEntry domain.SaleLogEntry) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := r.client.Database(r.databaseName).Collection(r.collectionName)
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

	collection := r.client.Database(r.databaseName).Collection(r.collectionName)
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

var _ saleslog.Repository = &MongoDBRepository{}
