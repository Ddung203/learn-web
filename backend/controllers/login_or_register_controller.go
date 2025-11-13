package controllers

import (
	"context"
	"learn-backend/config"
	"learn-backend/models"
	"learn-backend/utils"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type LoginOrRegisterController struct {
	db  *mongo.Database
	cfg *config.Config
}

func NewLoginOrRegisterController(db *mongo.Database, cfg *config.Config) *LoginOrRegisterController {
	return &LoginOrRegisterController{db: db, cfg: cfg}
}

// LoginOrRegister - Try login first, if user not found, auto-register
func (lrc *LoginOrRegisterController) LoginOrRegister(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	usersCollection := lrc.db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Try to find existing user
	var user models.User
	err := usersCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)

	// User exists - verify password
	if err == nil {
		if !utils.CheckPassword(req.Password, user.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}

		// Generate JWT token
		expiry, _ := time.ParseDuration(lrc.cfg.JWTExpiry)
		token, err := utils.GenerateJWT(
			user.ID.Hex(),
			user.Email,
			user.Username,
			lrc.cfg.JWTSecret,
			expiry,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, models.LoginResponse{
			Token: token,
			User:  user,
		})
		return
	}

	// User not found - auto register
	if err == mongo.ErrNoDocuments {
		// Generate username from email
		username := strings.Split(req.Email, "@")[0]
		
		// Check if username already exists, add number suffix if needed
		var existingUser models.User
		usernameExists := usersCollection.FindOne(ctx, bson.M{"username": username}).Decode(&existingUser)
		if usernameExists == nil {
			// Username exists, add timestamp suffix
			username = username + "_" + time.Now().Format("20060102")
		}

		// Hash password
		hashedPassword, err := utils.HashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		// Determine full name - use provided full_name or default to username
		fullName := req.FullName
		if fullName == "" {
			fullName = username
		}

		// Create new user
		newUser := models.User{
			Username:  username,
			Email:     req.Email,
			Password:  hashedPassword,
			FullName:  fullName,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		result, err := usersCollection.InsertOne(ctx, newUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		newUser.ID = result.InsertedID.(primitive.ObjectID)

		// Generate JWT token
		expiry, _ := time.ParseDuration(lrc.cfg.JWTExpiry)
		token, err := utils.GenerateJWT(
			newUser.ID.Hex(),
			newUser.Email,
			newUser.Username,
			lrc.cfg.JWTSecret,
			expiry,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusCreated, models.LoginResponse{
			Token: token,
			User:  newUser,
		})
		return
	}

	// Other database errors
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
}
