package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CardSetCard struct {
	ID          string `json:"id" bson:"id"`
	Terminology string `json:"terminology" bson:"terminology" binding:"required"`
	Define      string `json:"define" bson:"define" binding:"required"`
}

type StudyProgress struct {
	LastStudied time.Time `json:"last_studied" bson:"last_studied"`
	TimesStdied int       `json:"times_studied" bson:"times_studied"`
	Mastered    int       `json:"mastered" bson:"mastered"`
}

type CardSet struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID      primitive.ObjectID `json:"user_id" bson:"user_id"`
	Title       string             `json:"title" bson:"title" binding:"required"`
	Description string             `json:"description" bson:"description"`
	Cards       []CardSetCard      `json:"cards" bson:"cards"`
	Progress    StudyProgress      `json:"progress" bson:"progress"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}

type CreateCardSetRequest struct {
	Title       string        `json:"title" binding:"required"`
	Description string        `json:"description"`
	Cards       []CardSetCard `json:"cards" binding:"required,min=1"`
}

type UpdateCardSetRequest struct {
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Cards       []CardSetCard `json:"cards"`
}
