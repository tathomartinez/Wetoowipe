package rules

import (
	"context"
	"go-api/internal/domain"
)

type RulesRepository interface {
	GetRules(ctx context.Context) (*domain.Rules, error)
}

// type MongoRulesRepository struct {
// 	db *mongo.Database
// }

// func NewMongoRulesRepository(db *mongo.Database) *MongoRulesRepository {
// 	return &MongoRulesRepository{db: db}
// }

// func (r *MongoRulesRepository) GetRules(ctx context.Context) (*domain.Rules, error) {
// 	collection := r.db.Collection("rules")
// 	var rules domain.Rules

// 	err := collection.FindOne(ctx, bson.M{"_id": "rules_webhook"}).Decode(&rules)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &rules, nil
// }
