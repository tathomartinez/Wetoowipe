package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"go-api/internal/app/saleslog"
	"go-api/internal/domain"
)

type MongoDBRepository struct {
	client         *mongo.Client
	databaseName   string
	collectionName string
}

func NewMongoDBRepository(ctx context.Context) (*MongoDBRepository, error) {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Println("[MongoDB] ERROR: MONGO_URI environment variable not set")
		return nil, fmt.Errorf("MONGO_URI environment variable not set")
	}
	log.Println("[MongoDB] ===========================================")
	log.Println("[MongoDB] Conectando a MongoDB...")
	log.Println("[MongoDB] ===========================================")
	log.Printf("[MongoDB] URI: %s", mongoURI)
	dburi := os.Getenv("MONGO_AUTH_DB")
	log.Printf("[MongoDB] DB: %s", dburi)
	log.Println("[MongoDB] ===========================================")

	// Configuración de conexión con opciones explícitas
	clientOptions := options.Client().
		ApplyURI(mongoURI).
		SetAuth(options.Credential{
			AuthMechanism: "SCRAM-SHA-256",            // Fuerza mecanismo más seguro
			AuthSource:    os.Getenv("MONGO_AUTH_DB"), // DB de autenticación
		}).
		SetConnectTimeout(10 * time.Second).
		SetServerSelectionTimeout(10 * time.Second).
		SetMaxPoolSize(10).
		SetRetryWrites(true)

	log.Printf("[MongoDB] Intentando conectar a MongoDB (host: %s)", extractHostFromURI(mongoURI))

	// Intento de conexión con retry
	var client *mongo.Client
	var err error
	maxRetries := 3
	retryDelay := 2 * time.Second

	for i := 0; i < maxRetries; i++ {
		client, err = mongo.Connect(ctx, clientOptions)
		if err == nil {
			// Verificar la conexión
			err = client.Ping(ctx, nil)
			if err == nil {
				break // Conexión exitosa
			}
		}

		if i < maxRetries-1 {
			log.Printf("[MongoDB] Intento %d/%d fallido: %v - Reintentando en %v...", i+1, maxRetries, err, retryDelay)
			time.Sleep(retryDelay)
			retryDelay *= 2 // Exponential backoff
		}
	}

	if err != nil {
		log.Printf("[MongoDB] ERROR: Fallo definitivo de conexión: %v", err)
		return nil, fmt.Errorf("failed to connect to MongoDB after %d attempts: %w", maxRetries, err)
	}

	databaseName := os.Getenv("MONGO_DATABASE")
	if databaseName == "" {
		databaseName = "mydatabase"
		log.Printf("[MongoDB] WARN: Usando nombre de base de datos por defecto: %s", databaseName)
	}
	collectionName := "sales_logs"

	log.Printf("[MongoDB] Conexión establecida correctamente (DB: %s, Colección: %s)", databaseName, collectionName)

	return &MongoDBRepository{
		client:         client,
		databaseName:   databaseName,
		collectionName: collectionName,
	}, nil
}

// Helper para extraer host de URI sin credenciales
func extractHostFromURI(uri string) string {
	opts := options.Client().ApplyURI(uri)
	if len(opts.Hosts) > 0 {
		return opts.Hosts[0]
	}
	return "unknown-host"
}

func (r *MongoDBRepository) SaveLog(logEntry domain.SaleLogEntry) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Printf("[MongoDB] Guardando log para destinatario_id: %s", logEntry.DestinatarioID)

	collection := r.client.Database(r.databaseName).Collection(r.collectionName)
	_, err := collection.InsertOne(ctx, logEntry)
	if err != nil {
		log.Printf("[MongoDB] ERROR al guardar log (destinatario_id: %s): %v", logEntry.DestinatarioID, err)
		return fmt.Errorf("failed to insert log entry: %w", err)
	}

	log.Printf("[MongoDB] Log guardado exitosamente para destinatario_id: %s", logEntry.DestinatarioID)
	return nil
}

func (r *MongoDBRepository) GetLogByID(id string) (*domain.SaleLogEntry, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Printf("[MongoDB] Buscando log para destinatario_id: %s", id)

	collection := r.client.Database(r.databaseName).Collection(r.collectionName)
	var logEntry domain.SaleLogEntry
	err := collection.FindOne(ctx, bson.M{"destinatario_id": id}).Decode(&logEntry)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("[MongoDB] Log no encontrado para destinatario_id: %s", id)
			return nil, nil
		}
		log.Printf("[MongoDB] ERROR al buscar log (destinatario_id: %s): %v", id, err)
		return nil, fmt.Errorf("failed to find log entry by ID: %w", err)
	}

	log.Printf("[MongoDB] Log encontrado para destinatario_id: %s", id)
	return &logEntry, nil
}

var _ saleslog.Repository = &MongoDBRepository{}
