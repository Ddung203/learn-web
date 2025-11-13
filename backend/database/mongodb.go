package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Connect(uri, database string) (*mongo.Client, *mongo.Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, nil, err
	}

	// Ping the database
	if err := client.Ping(ctx, nil); err != nil {
		return nil, nil, err
	}

	return client, client.Database(database), nil
}

func CreateIndexes(db *mongo.Database) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Users collection indexes
	usersCollection := db.Collection("users")
	_, err := usersCollection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		return err
	}

	// CardSets collection indexes
	cardSetsCollection := db.Collection("cardsets")
	_, err = cardSetsCollection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "user_id", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "created_at", Value: -1}},
		},
	})
	if err != nil {
		return err
	}

	return nil
}
