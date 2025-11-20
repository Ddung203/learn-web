package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Username         string             `json:"username" bson:"username" binding:"required,min=3,max=50"`
	Email            string             `json:"email" bson:"email" binding:"required,email,max=255"`
	Password         string             `json:"-" bson:"password" binding:"required,min=6,max=100"`
	FullName         string             `json:"full_name" bson:"full_name" binding:"max=100"`
	Avatar           string             `json:"avatar" bson:"avatar" binding:"max=500"`
	DateOfBirth      *time.Time         `json:"date_of_birth,omitempty" bson:"date_of_birth,omitempty"`
	PreferredVoiceID string             `json:"preferred_voice_id,omitempty" bson:"preferred_voice_id,omitempty" binding:"max=50"`
	CreatedAt        time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt        time.Time          `json:"updated_at" bson:"updated_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,max=255"`
	Password string `json:"password" binding:"required,min=6,max=100"`
	FullName string `json:"full_name" binding:"max=100"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email,max=255"`
	Password string `json:"password" binding:"required,min=6,max=100"`
	FullName string `json:"full_name" binding:"required,max=100"`
}

type LoginResponse struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token"`
	User         User   `json:"user"`
}

type UpdateProfileRequest struct {
	FullName         string     `json:"full_name" binding:"max=100"`
	Avatar           string     `json:"avatar" binding:"max=500"`
	DateOfBirth      *time.Time `json:"date_of_birth"`
	PreferredVoiceID string     `json:"preferred_voice_id" binding:"max=50"`
}
