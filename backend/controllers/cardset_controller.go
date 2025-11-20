package controllers

import (
	"context"
	"learn-backend/models"
	"learn-backend/services"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CardSetController struct {
	db *mongo.Database
}

func NewCardSetController(db *mongo.Database) *CardSetController {
	return &CardSetController{db: db}
}

func (csc *CardSetController) GetCardSets(c *gin.Context) {
	userID := c.GetString("user_id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	cardSetsCollection := csc.db.Collection("cardsets")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := cardSetsCollection.Find(ctx, bson.M{"user_id": objID}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch card sets"})
		return
	}
	defer cursor.Close(ctx)

	var cardSets []models.CardSet
	if err := cursor.All(ctx, &cardSets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode card sets"})
		return
	}

	if cardSets == nil {
		cardSets = []models.CardSet{}
	}

	c.JSON(http.StatusOK, cardSets)
}

func (csc *CardSetController) GetCardSet(c *gin.Context) {
	userID := c.GetString("user_id")
	cardSetID := c.Param("id")

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	cardSetObjID, err := primitive.ObjectIDFromHex(cardSetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid card set ID"})
		return
	}

	cardSetsCollection := csc.db.Collection("cardsets")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cardSet models.CardSet
	err = cardSetsCollection.FindOne(ctx, bson.M{
		"_id":     cardSetObjID,
		"user_id": userObjID,
	}).Decode(&cardSet)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Card set not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch card set"})
		return
	}

	c.JSON(http.StatusOK, cardSet)
}

func (csc *CardSetController) CreateCardSet(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req models.CreateCardSetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate IDs for cards
	for i := range req.Cards {
		if req.Cards[i].ID == "" {
			req.Cards[i].ID = uuid.New().String()
		}
	}

	cardSet := models.CardSet{
		UserID:      userObjID,
		Title:       req.Title,
		Description: req.Description,
		Language:    req.Language,
		Cards:       req.Cards,
		Progress: models.StudyProgress{
			TimesStdied: 0,
			Mastered:    0,
		},
		IsPublic:       false,
		DownloadCount:  0,
		PhoneticStatus: models.PhoneticStatusEmpty,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	cardSetsCollection := csc.db.Collection("cardsets")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := cardSetsCollection.InsertOne(ctx, cardSet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create card set"})
		return
	}

	cardSet.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, cardSet)
}

func (csc *CardSetController) UpdateCardSet(c *gin.Context) {
	userID := c.GetString("user_id")
	cardSetID := c.Param("id")

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	cardSetObjID, err := primitive.ObjectIDFromHex(cardSetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid card set ID"})
		return
	}

	var req models.UpdateCardSetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	update := bson.M{
		"updated_at": time.Now(),
	}

	if req.Title != "" {
		update["title"] = req.Title
	}
	if req.Description != "" {
		update["description"] = req.Description
	}
	if req.Language != "" {
		update["language"] = req.Language
	}
	if req.Cards != nil {
		// Generate IDs for new cards
		for i := range req.Cards {
			if req.Cards[i].ID == "" {
				req.Cards[i].ID = uuid.New().String()
			}
		}
		update["cards"] = req.Cards
	}
	if req.PhoneticStatus != "" {
		update["phonetic_status"] = req.PhoneticStatus
	}

	cardSetsCollection := csc.db.Collection("cardsets")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := cardSetsCollection.UpdateOne(
		ctx,
		bson.M{"_id": cardSetObjID, "user_id": userObjID},
		bson.M{"$set": update},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card set"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Card set not found"})
		return
	}

	// Fetch updated card set
	var cardSet models.CardSet
	err = cardSetsCollection.FindOne(ctx, bson.M{"_id": cardSetObjID}).Decode(&cardSet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated card set"})
		return
	}

	c.JSON(http.StatusOK, cardSet)
}

func (csc *CardSetController) DeleteCardSet(c *gin.Context) {
	userID := c.GetString("user_id")
	cardSetID := c.Param("id")

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	cardSetObjID, err := primitive.ObjectIDFromHex(cardSetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid card set ID"})
		return
	}

	cardSetsCollection := csc.db.Collection("cardsets")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := cardSetsCollection.DeleteOne(ctx, bson.M{
		"_id":     cardSetObjID,
		"user_id": userObjID,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete card set"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Card set not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Card set deleted successfully"})
}

func (csc *CardSetController) TogglePublish(c *gin.Context) {
	userID := c.GetString("user_id")
	cardSetID := c.Param("id")

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	cardSetObjID, err := primitive.ObjectIDFromHex(cardSetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid card set ID"})
		return
	}

	cardSetsCollection := csc.db.Collection("cardsets")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get current card set
	var cardSet models.CardSet
	err = cardSetsCollection.FindOne(ctx, bson.M{
		"_id":     cardSetObjID,
		"user_id": userObjID,
	}).Decode(&cardSet)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Card set not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch card set"})
		return
	}

	// Toggle is_public
	newPublicStatus := !cardSet.IsPublic

	update := bson.M{
		"is_public":  newPublicStatus,
		"updated_at": time.Now(),
	}

	_, err = cardSetsCollection.UpdateOne(
		ctx,
		bson.M{"_id": cardSetObjID, "user_id": userObjID},
		bson.M{"$set": update},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card set"})
		return
	}

	// Fetch updated card set
	err = cardSetsCollection.FindOne(ctx, bson.M{"_id": cardSetObjID}).Decode(&cardSet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated card set"})
		return
	}

	c.JSON(http.StatusOK, cardSet)
}

func (csc *CardSetController) GetGlobalCardSets(c *gin.Context) {
	cardSetsCollection := csc.db.Collection("cardsets")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "download_count", Value: -1}, {Key: "created_at", Value: -1}})
	cursor, err := cardSetsCollection.Find(ctx, bson.M{"is_public": true}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch global card sets"})
		return
	}
	defer cursor.Close(ctx)

	var cardSets []models.CardSet
	if err := cursor.All(ctx, &cardSets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode card sets"})
		return
	}

	if cardSets == nil {
		cardSets = []models.CardSet{}
	}

	c.JSON(http.StatusOK, cardSets)
}

func (csc *CardSetController) ImportFromGlobal(c *gin.Context) {
	userID := c.GetString("user_id")
	cardSetID := c.Param("id")

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	cardSetObjID, err := primitive.ObjectIDFromHex(cardSetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid card set ID"})
		return
	}

	cardSetsCollection := csc.db.Collection("cardsets")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get the public card set
	var sourceCardSet models.CardSet
	err = cardSetsCollection.FindOne(ctx, bson.M{
		"_id":       cardSetObjID,
		"is_public": true,
	}).Decode(&sourceCardSet)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Card set not found or not public"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch card set"})
		return
	}

	// Generate new IDs for cards in the imported set
	for i := range sourceCardSet.Cards {
		sourceCardSet.Cards[i].ID = uuid.New().String()
	}

	// Create new card set for the user
	newCardSet := models.CardSet{
		UserID:      userObjID,
		Title:       sourceCardSet.Title,
		Description: sourceCardSet.Description,
		Language:    sourceCardSet.Language,
		Cards:       sourceCardSet.Cards,
		Progress: models.StudyProgress{
			TimesStdied: 0,
			Mastered:    0,
		},
		IsPublic:      false,
		DownloadCount: 0,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	result, err := cardSetsCollection.InsertOne(ctx, newCardSet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to import card set"})
		return
	}

	newCardSet.ID = result.InsertedID.(primitive.ObjectID)

	// Increment download count of the source card set
	_, err = cardSetsCollection.UpdateOne(
		ctx,
		bson.M{"_id": cardSetObjID},
		bson.M{"$inc": bson.M{"download_count": 1}},
	)
	if err != nil {
		// Don't fail if download count update fails, just log it
		c.JSON(http.StatusCreated, newCardSet)
		return
	}

	c.JSON(http.StatusCreated, newCardSet)
}

func (csc *CardSetController) GeneratePhonetics(c *gin.Context) {
	userID := c.GetString("user_id")
	cardSetID := c.Param("id")

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	cardSetObjID, err := primitive.ObjectIDFromHex(cardSetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid card set ID"})
		return
	}

	cardSetsCollection := csc.db.Collection("cardsets")
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Get the card set
	var cardSet models.CardSet
	err = cardSetsCollection.FindOne(ctx, bson.M{
		"_id":     cardSetObjID,
		"user_id": userObjID,
	}).Decode(&cardSet)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Card set not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch card set"})
		return
	}

	// Check if language is English
	if cardSet.Language != "en" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phonetic generation is only supported for English language"})
		return
	}

	// Update status to "processing"
	_, err = cardSetsCollection.UpdateOne(
		ctx,
		bson.M{"_id": cardSetObjID},
		bson.M{"$set": bson.M{
			"phonetic_status": models.PhoneticStatusProcessing,
			"updated_at":      time.Now(),
		}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}
	cardSet.PhoneticStatus = models.PhoneticStatusProcessing

	// Create phonetic service
	phoneticService := services.NewPhoneticService()

	// Use goroutines to process cards in parallel with a limit
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 10) // Limit to 10 concurrent requests
	hasError := false

	for i := range cardSet.Cards {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			semaphore <- struct{}{}        // Acquire semaphore
			defer func() { <-semaphore }() // Release semaphore

			card := &cardSet.Cards[index]
			// Only generate phonetics for cards that don't already have them
			if card.Terminology != "" && card.Phonetic == "" {
				result := phoneticService.GetPhonetic(card.Terminology)
				if result.Phonetic != "" {
					card.Phonetic = result.Phonetic
				}
				if result.PartOfSpeech != "" && card.PartOfSpeech == "" {
					card.PartOfSpeech = result.PartOfSpeech
				}
			}
		}(i)
	}

	// Wait for all goroutines to finish
	wg.Wait()

	// Determine final status
	finalStatus := models.PhoneticStatusCompleted
	if hasError {
		finalStatus = models.PhoneticStatusFailed
	}

	// Update the card set in database
	update := bson.M{
		"$set": bson.M{
			"cards":           cardSet.Cards,
			"phonetic_status": finalStatus,
			"updated_at":      time.Now(),
		},
	}

	_, err = cardSetsCollection.UpdateOne(ctx, bson.M{"_id": cardSetObjID}, update)
	if err != nil {
		// Even if update fails, set status to failed
		cardSetsCollection.UpdateOne(ctx, bson.M{"_id": cardSetObjID}, bson.M{
			"$set": bson.M{
				"phonetic_status": models.PhoneticStatusFailed,
				"updated_at":      time.Now(),
			},
		})
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card set"})
		return
	}

	cardSet.PhoneticStatus = finalStatus
	c.JSON(http.StatusOK, cardSet)
}
