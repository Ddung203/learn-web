package controllers

import (
	"context"
	"net/http"
	"time"

	"learn-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type StatisticsController struct {
	DB *mongo.Database
}

func NewStatisticsController(db *mongo.Database) *StatisticsController {
	return &StatisticsController{DB: db}
}

// CreateStudySessionRequest represents the request body for recording a study session
type CreateStudySessionRequest struct {
	CardSetID string                 `json:"cardset_id" binding:"required"`
	Mode      models.StudyMode       `json:"mode" binding:"required"`
	StartTime string                 `json:"start_time" binding:"required"`
	EndTime   string                 `json:"end_time" binding:"required"`
	Attempts  []models.CardAttempt   `json:"attempts" binding:"required"`
}

// RecordStudySession creates a new study session record and updates statistics
func (sc *StatisticsController) RecordStudySession(c *gin.Context) {
	var req CreateStudySessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user_id from context (set by auth middleware)
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	// Parse cardset_id
	cardSetObjID, err := primitive.ObjectIDFromHex(req.CardSetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cardset_id"})
		return
	}

	// Verify cardset belongs to user
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cardSet models.CardSet
	err = sc.DB.Collection("cardsets").FindOne(ctx, bson.M{
		"_id":     cardSetObjID,
		"user_id": userObjID,
	}).Decode(&cardSet)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "CardSet not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify cardset"})
		}
		return
	}

	// Parse timestamps
	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_time format"})
		return
	}

	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_time format"})
		return
	}

	// Calculate statistics
	duration := int(endTime.Sub(startTime).Seconds())
	correct := 0
	incorrect := 0
	for _, attempt := range req.Attempts {
		if attempt.Correct {
			correct++
		} else {
			incorrect++
		}
	}

	totalCards := len(req.Attempts)
	accuracy := 0.0
	if totalCards > 0 {
		accuracy = float64(correct) / float64(totalCards) * 100
	}

	// Create study session
	session := models.StudySession{
		UserID:    userObjID,
		CardSetID: cardSetObjID,
		Mode:      req.Mode,
		StartTime: startTime,
		EndTime:   endTime,
		Duration:  duration,
		TotalCards: totalCards,
		Correct:   correct,
		Incorrect: incorrect,
		Accuracy:  accuracy,
		Attempts:  req.Attempts,
		CreatedAt: time.Now(),
	}

	// Insert session
	result, err := sc.DB.Collection("study_sessions").InsertOne(ctx, session)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record study session"})
		return
	}

	session.ID = result.InsertedID.(primitive.ObjectID)

	// Update user statistics asynchronously (non-blocking)
	go sc.updateUserStatistics(userObjID, session)

	// Update card mastery asynchronously
	go sc.updateCardMastery(userObjID, cardSetObjID, req.Attempts)

	c.JSON(http.StatusCreated, session)
}

// GetUserStatistics retrieves comprehensive statistics for a user
func (sc *StatisticsController) GetUserStatistics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get or create user statistics
	var userStats models.UserStatistics
	err := sc.DB.Collection("user_statistics").FindOne(ctx, bson.M{"user_id": userObjID}).Decode(&userStats)
	if err == mongo.ErrNoDocuments {
		// Initialize new statistics
		userStats = models.UserStatistics{
			UserID:    userObjID,
			UpdatedAt: time.Now(),
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch statistics"})
		return
	}

	// Get performance by mode
	performanceByMode, err := sc.getPerformanceByMode(ctx, userObjID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate performance by mode"})
		return
	}

	// Get recent sessions (last 10)
	recentSessions, err := sc.getRecentSessions(ctx, userObjID, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recent sessions"})
		return
	}

	// Get weak cards (bottom 10 by mastery)
	weakCards, err := sc.getCardsByMastery(ctx, userObjID, false, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weak cards"})
		return
	}

	// Get mastered cards (top 10 by mastery)
	masteredCards, err := sc.getCardsByMastery(ctx, userObjID, true, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch mastered cards"})
		return
	}

	response := models.StatisticsResponse{
		Overview:          userStats,
		PerformanceByMode: performanceByMode,
		RecentSessions:    recentSessions,
		WeakCards:         weakCards,
		MasteredCards:     masteredCards,
	}

	c.JSON(http.StatusOK, response)
}

// GetCardSetStatistics retrieves statistics for a specific card set
func (sc *StatisticsController) GetCardSetStatistics(c *gin.Context) {
	cardSetID := c.Param("id")
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	cardSetObjID, err := primitive.ObjectIDFromHex(cardSetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cardset_id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Verify ownership
	var cardSet models.CardSet
	err = sc.DB.Collection("cardsets").FindOne(ctx, bson.M{
		"_id":     cardSetObjID,
		"user_id": userObjID,
	}).Decode(&cardSet)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "CardSet not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify cardset"})
		}
		return
	}

	// Get sessions for this card set
	cursor, err := sc.DB.Collection("study_sessions").Find(ctx, bson.M{
		"user_id":    userObjID,
		"cardset_id": cardSetObjID,
	}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sessions"})
		return
	}
	defer cursor.Close(ctx)

	var sessions []models.StudySession
	if err = cursor.All(ctx, &sessions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode sessions"})
		return
	}

	// Get card mastery for this card set
	cursor, err = sc.DB.Collection("card_mastery").Find(ctx, bson.M{
		"cardset_id": cardSetObjID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch card mastery"})
		return
	}
	defer cursor.Close(ctx)

	var cardMastery []models.CardMastery
	if err = cursor.All(ctx, &cardMastery); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode card mastery"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"cardset":      cardSet,
		"sessions":     sessions,
		"card_mastery": cardMastery,
	})
}

// Helper functions

func (sc *StatisticsController) updateUserStatistics(userID primitive.ObjectID, session models.StudySession) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Calculate daily stats
	sessionDate := time.Date(session.StartTime.Year(), session.StartTime.Month(), session.StartTime.Day(), 0, 0, 0, 0, time.UTC)

	// Upsert user statistics
	filter := bson.M{"user_id": userID}
	update := bson.M{
		"$inc": bson.M{
			"total_study_time": session.Duration,
			"total_sessions":   1,
			"total_attempts":   session.TotalCards,
		},
		"$set": bson.M{
			"last_study_date": session.StartTime,
			"updated_at":      time.Now(),
		},
	}

	opts := options.Update().SetUpsert(true)
	sc.DB.Collection("user_statistics").UpdateOne(ctx, filter, update, opts)

	// Update daily stats
	sc.updateDailyStats(userID, sessionDate, session)

	// Recalculate overall accuracy and streak
	sc.recalculateUserStats(userID)
}

func (sc *StatisticsController) updateDailyStats(userID primitive.ObjectID, date time.Time, session models.StudySession) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get existing daily stats
	var userStats models.UserStatistics
	err := sc.DB.Collection("user_statistics").FindOne(ctx, bson.M{"user_id": userID}).Decode(&userStats)
	if err != nil {
		return
	}

	// Find or create daily stat
	found := false
	for i, stat := range userStats.DailyStats {
		if stat.Date.Equal(date) {
			userStats.DailyStats[i].SessionsCount++
			userStats.DailyStats[i].CardsStudied += session.TotalCards
			userStats.DailyStats[i].TimeSpent += session.Duration
			// Recalculate average accuracy
			totalAccuracy := userStats.DailyStats[i].Accuracy * float64(userStats.DailyStats[i].SessionsCount-1)
			userStats.DailyStats[i].Accuracy = (totalAccuracy + session.Accuracy) / float64(userStats.DailyStats[i].SessionsCount)
			found = true
			break
		}
	}

	if !found {
		newDailyStat := models.DailyStats{
			Date:          date,
			SessionsCount: 1,
			CardsStudied:  session.TotalCards,
			TimeSpent:     session.Duration,
			Accuracy:      session.Accuracy,
		}
		userStats.DailyStats = append(userStats.DailyStats, newDailyStat)
	}

	// Keep only last 90 days
	if len(userStats.DailyStats) > 90 {
		userStats.DailyStats = userStats.DailyStats[len(userStats.DailyStats)-90:]
	}

	// Update
	sc.DB.Collection("user_statistics").UpdateOne(ctx, bson.M{"user_id": userID}, bson.M{
		"$set": bson.M{"daily_stats": userStats.DailyStats},
	})
}

func (sc *StatisticsController) recalculateUserStats(userID primitive.ObjectID) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get all sessions
	cursor, err := sc.DB.Collection("study_sessions").Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return
	}
	defer cursor.Close(ctx)

	var sessions []models.StudySession
	cursor.All(ctx, &sessions)

	if len(sessions) == 0 {
		return
	}

	// Calculate overall accuracy
	totalCorrect := 0
	totalAttempts := 0
	for _, session := range sessions {
		totalCorrect += session.Correct
		totalAttempts += session.TotalCards
	}

	overallAccuracy := 0.0
	if totalAttempts > 0 {
		overallAccuracy = float64(totalCorrect) / float64(totalAttempts) * 100
	}

	// Calculate streak
	currentStreak, longestStreak := sc.calculateStreaks(userID)

	// Count unique cards studied
	uniqueCards := sc.countUniqueCards(userID)

	// Get card mastery counts
	masteredCount, learningCount, newCount := sc.getCardMasteryCounts(userID)

	// Update user statistics
	sc.DB.Collection("user_statistics").UpdateOne(ctx, bson.M{"user_id": userID}, bson.M{
		"$set": bson.M{
			"overall_accuracy":    overallAccuracy,
			"current_streak":      currentStreak,
			"longest_streak":      longestStreak,
			"total_cards_studied": uniqueCards,
			"cards_mastered":      masteredCount,
			"cards_learning":      learningCount,
			"cards_new":           newCount,
			"updated_at":          time.Now(),
		},
	})
}

func (sc *StatisticsController) calculateStreaks(userID primitive.ObjectID) (int, int) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var userStats models.UserStatistics
	err := sc.DB.Collection("user_statistics").FindOne(ctx, bson.M{"user_id": userID}).Decode(&userStats)
	if err != nil {
		return 0, 0
	}

	if len(userStats.DailyStats) == 0 {
		return 0, 0
	}

	// Sort by date
	dates := make([]time.Time, len(userStats.DailyStats))
	for i, stat := range userStats.DailyStats {
		dates[i] = stat.Date
	}

	// Calculate current streak
	today := time.Now().Truncate(24 * time.Hour)
	currentStreak := 0
	for i := len(dates) - 1; i >= 0; i-- {
		expectedDate := today.AddDate(0, 0, -(len(dates)-1-i))
		if dates[i].Equal(expectedDate) {
			currentStreak++
		} else {
			break
		}
	}

	// Calculate longest streak
	longestStreak := 0
	tempStreak := 1
	for i := 1; i < len(dates); i++ {
		diff := dates[i].Sub(dates[i-1]).Hours() / 24
		if diff == 1 {
			tempStreak++
			if tempStreak > longestStreak {
				longestStreak = tempStreak
			}
		} else {
			tempStreak = 1
		}
	}

	if longestStreak == 0 && len(dates) > 0 {
		longestStreak = 1
	}

	return currentStreak, longestStreak
}

func (sc *StatisticsController) countUniqueCards(userID primitive.ObjectID) int {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	count, _ := sc.DB.Collection("card_mastery").CountDocuments(ctx, bson.M{"user_id": userID})
	return int(count)
}

func (sc *StatisticsController) getCardMasteryCounts(userID primitive.ObjectID) (int, int, int) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	mastered, _ := sc.DB.Collection("card_mastery").CountDocuments(ctx, bson.M{
		"mastery_level": bson.M{"$gte": 80},
	})

	learning, _ := sc.DB.Collection("card_mastery").CountDocuments(ctx, bson.M{
		"mastery_level": bson.M{"$gte": 50, "$lt": 80},
	})

	newCards, _ := sc.DB.Collection("card_mastery").CountDocuments(ctx, bson.M{
		"mastery_level": bson.M{"$lt": 50},
	})

	return int(mastered), int(learning), int(newCards)
}

func (sc *StatisticsController) updateCardMastery(userID, cardSetID primitive.ObjectID, attempts []models.CardAttempt) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	for _, attempt := range attempts {
		filter := bson.M{
			"card_id":    attempt.CardID,
			"user_id":    userID,
			"cardset_id": cardSetID,
		}

		// Get existing mastery or create new
		var mastery models.CardMastery
		err := sc.DB.Collection("card_mastery").FindOne(ctx, filter).Decode(&mastery)

		if err == mongo.ErrNoDocuments {
			// Create new mastery record
			mastery = models.CardMastery{
				CardID:    attempt.CardID,
				UserID:    userID,
				CardSetID: cardSetID,
			}
		}

		// Update counts
		mastery.TimesStudied++
		if attempt.Correct {
			mastery.TimesCorrect++
		} else {
			mastery.TimesIncorrect++
		}

		// Calculate mastery level
		if mastery.TimesStudied > 0 {
			mastery.MasteryLevel = float64(mastery.TimesCorrect) / float64(mastery.TimesStudied) * 100
		}

		mastery.LastStudied = attempt.AttemptedAt
		mastery.LastCorrect = attempt.Correct

		// Upsert
		opts := options.Update().SetUpsert(true)
		sc.DB.Collection("card_mastery").UpdateOne(ctx, filter, bson.M{
			"$set": mastery,
		}, opts)
	}
}

func (sc *StatisticsController) getPerformanceByMode(ctx context.Context, userID primitive.ObjectID) ([]models.PerformanceByMode, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userID}},
		{"$group": bson.M{
			"_id":           "$mode",
			"sessions":      bson.M{"$sum": 1},
			"total_cards":   bson.M{"$sum": "$total_cards"},
			"total_correct": bson.M{"$sum": "$correct"},
			"total_time":    bson.M{"$sum": "$duration"},
		}},
	}

	cursor, err := sc.DB.Collection("study_sessions").Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []models.PerformanceByMode
	for cursor.Next(ctx) {
		var result struct {
			Mode         models.StudyMode `bson:"_id"`
			Sessions     int              `bson:"sessions"`
			TotalCards   int              `bson:"total_cards"`
			TotalCorrect int              `bson:"total_correct"`
			TotalTime    int              `bson:"total_time"`
		}
		if err := cursor.Decode(&result); err != nil {
			continue
		}

		accuracy := 0.0
		if result.TotalCards > 0 {
			accuracy = float64(result.TotalCorrect) / float64(result.TotalCards) * 100
		}

		avgTimePerCard := 0.0
		if result.TotalCards > 0 {
			avgTimePerCard = float64(result.TotalTime) / float64(result.TotalCards)
		}

		results = append(results, models.PerformanceByMode{
			Mode:           result.Mode,
			Sessions:       result.Sessions,
			TotalCards:     result.TotalCards,
			Accuracy:       accuracy,
			AvgTimePerCard: avgTimePerCard,
		})
	}

	return results, nil
}

func (sc *StatisticsController) getRecentSessions(ctx context.Context, userID primitive.ObjectID, limit int) ([]models.StudySession, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(int64(limit))
	cursor, err := sc.DB.Collection("study_sessions").Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var sessions []models.StudySession
	if err = cursor.All(ctx, &sessions); err != nil {
		return nil, err
	}

	return sessions, nil
}

func (sc *StatisticsController) getCardsByMastery(ctx context.Context, userID primitive.ObjectID, topMastered bool, limit int) ([]models.CardMastery, error) {
	sortOrder := 1 // ascending for weak cards
	if topMastered {
		sortOrder = -1 // descending for mastered cards
	}

	opts := options.Find().SetSort(bson.D{{Key: "mastery_level", Value: sortOrder}}).SetLimit(int64(limit))

	cursor, err := sc.DB.Collection("card_mastery").Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []models.CardMastery
	if err = cursor.All(ctx, &cards); err != nil {
		return nil, err
	}

	return cards, nil
}
