package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CardSetCard struct {
	ID           string `json:"id" bson:"id"`
	Terminology  string `json:"terminology" bson:"terminology" binding:"required"`
	Define       string `json:"define" bson:"define" binding:"required"`
	Example      string `json:"example,omitempty" bson:"example,omitempty"`
	ImageURL     string `json:"image_url,omitempty" bson:"image_url,omitempty"`
	PartOfSpeech string `json:"part_of_speech,omitempty" bson:"part_of_speech,omitempty"`
	Phonetic     string `json:"phonetic,omitempty" bson:"phonetic,omitempty"`
}

type StudyProgress struct {
	LastStudied time.Time `json:"last_studied" bson:"last_studied"`
	TimesStdied int       `json:"times_studied" bson:"times_studied"`
	Mastered    int       `json:"mastered" bson:"mastered"`
}

type CardSet struct {
	ID            primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID        primitive.ObjectID `json:"user_id" bson:"user_id"`
	Title         string             `json:"title" bson:"title" binding:"required"`
	Description   string             `json:"description" bson:"description"`
	Language      string             `json:"language" bson:"language"`
	Cards         []CardSetCard      `json:"cards" bson:"cards"`
	Progress      StudyProgress      `json:"progress" bson:"progress"`
	IsPublic      bool               `json:"is_public" bson:"is_public"`
	DownloadCount int                `json:"download_count" bson:"download_count"`
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at" bson:"updated_at"`
}

type CreateCardSetRequest struct {
	Title       string        `json:"title" binding:"required"`
	Description string        `json:"description"`
	Language    string        `json:"language"`
	Cards       []CardSetCard `json:"cards" binding:"required,min=1"`
}

type UpdateCardSetRequest struct {
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Language    string        `json:"language"`
	Cards       []CardSetCard `json:"cards"`
}
