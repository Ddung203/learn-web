package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// StudyMode represents the type of study session
type StudyMode string

const (
	StudyModeFlashcard StudyMode = "flashcard"
	StudyModeTest      StudyMode = "test"
	StudyModeWrite     StudyMode = "write"
)

// CardAttempt represents a single attempt at studying a card
type CardAttempt struct {
	CardID         string    `json:"card_id" bson:"card_id"`
	Correct        bool      `json:"correct" bson:"correct"`
	TimeSpent      int       `json:"time_spent" bson:"time_spent"`           // in seconds
	UserAnswer     string    `json:"user_answer" bson:"user_answer"`         // for write/test modes
	ConfidenceLevel int      `json:"confidence_level" bson:"confidence_level"` // 1-5 scale (optional)
	AttemptedAt    time.Time `json:"attempted_at" bson:"attempted_at"`
}

// StudySession represents a complete study session
type StudySession struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID      primitive.ObjectID `json:"user_id" bson:"user_id"`
	CardSetID   primitive.ObjectID `json:"cardset_id" bson:"cardset_id"`
	Mode        StudyMode          `json:"mode" bson:"mode"`
	StartTime   time.Time          `json:"start_time" bson:"start_time"`
	EndTime     time.Time          `json:"end_time" bson:"end_time"`
	Duration    int                `json:"duration" bson:"duration"`        // in seconds
	TotalCards  int                `json:"total_cards" bson:"total_cards"`  // cards in session
	Correct     int                `json:"correct" bson:"correct"`          // correct answers
	Incorrect   int                `json:"incorrect" bson:"incorrect"`      // incorrect answers
	Accuracy    float64            `json:"accuracy" bson:"accuracy"`        // percentage
	Attempts    []CardAttempt      `json:"attempts" bson:"attempts"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
}

// DailyStats represents daily aggregated statistics
type DailyStats struct {
	Date           time.Time `json:"date" bson:"date"`
	SessionsCount  int       `json:"sessions_count" bson:"sessions_count"`
	CardsStudied   int       `json:"cards_studied" bson:"cards_studied"`
	TimeSpent      int       `json:"time_spent" bson:"time_spent"` // in seconds
	Accuracy       float64   `json:"accuracy" bson:"accuracy"`
}

// CardMastery represents mastery level for a specific card
type CardMastery struct {
	CardID         string             `json:"card_id" bson:"card_id"`
	UserID         primitive.ObjectID `json:"user_id" bson:"user_id"`
	CardSetID      primitive.ObjectID `json:"cardset_id" bson:"cardset_id"`
	TimesStudied   int                `json:"times_studied" bson:"times_studied"`
	TimesCorrect   int                `json:"times_correct" bson:"times_correct"`
	TimesIncorrect int                `json:"times_incorrect" bson:"times_incorrect"`
	MasteryLevel   float64            `json:"mastery_level" bson:"mastery_level"` // 0-100%
	LastStudied    time.Time          `json:"last_studied" bson:"last_studied"`
	LastCorrect    bool               `json:"last_correct" bson:"last_correct"`
}

// UserStatistics represents aggregate statistics for a user
type UserStatistics struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID            primitive.ObjectID `json:"user_id" bson:"user_id"`
	TotalStudyTime    int                `json:"total_study_time" bson:"total_study_time"`       // in seconds
	TotalSessions     int                `json:"total_sessions" bson:"total_sessions"`
	TotalCardsStudied int                `json:"total_cards_studied" bson:"total_cards_studied"` // unique cards
	TotalAttempts     int                `json:"total_attempts" bson:"total_attempts"`           // all attempts
	OverallAccuracy   float64            `json:"overall_accuracy" bson:"overall_accuracy"`
	CurrentStreak     int                `json:"current_streak" bson:"current_streak"`     // consecutive days
	LongestStreak     int                `json:"longest_streak" bson:"longest_streak"`
	LastStudyDate     time.Time          `json:"last_study_date" bson:"last_study_date"`
	DailyStats        []DailyStats       `json:"daily_stats" bson:"daily_stats"`
	CardsMastered     int                `json:"cards_mastered" bson:"cards_mastered"`     // cards with >80% accuracy
	CardsLearning     int                `json:"cards_learning" bson:"cards_learning"`     // cards with 50-80% accuracy
	CardsNew          int                `json:"cards_new" bson:"cards_new"`               // cards with <50% accuracy or never studied
	UpdatedAt         time.Time          `json:"updated_at" bson:"updated_at"`
}

// PerformanceByMode represents statistics grouped by study mode
type PerformanceByMode struct {
	Mode         StudyMode `json:"mode" bson:"mode"`
	Sessions     int       `json:"sessions" bson:"sessions"`
	TotalCards   int       `json:"total_cards" bson:"total_cards"`
	Accuracy     float64   `json:"accuracy" bson:"accuracy"`
	AvgTimePerCard float64 `json:"avg_time_per_card" bson:"avg_time_per_card"` // in seconds
}

// StatisticsResponse represents the response for statistics API
type StatisticsResponse struct {
	Overview        UserStatistics      `json:"overview"`
	PerformanceByMode []PerformanceByMode `json:"performance_by_mode"`
	RecentSessions  []StudySession      `json:"recent_sessions"`
	WeakCards       []CardMastery       `json:"weak_cards"`       // cards that need more practice
	MasteredCards   []CardMastery       `json:"mastered_cards"`   // cards with high mastery
}
