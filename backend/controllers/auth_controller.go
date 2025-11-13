package controllers

import (
	"context"
	"learn-backend/config"
	"learn-backend/models"
	"learn-backend/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthController struct {
	db  *mongo.Database
	cfg *config.Config
}

func NewAuthController(db *mongo.Database, cfg *config.Config) *AuthController {
	return &AuthController{db: db, cfg: cfg}
}

func (ac *AuthController) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	usersCollection := ac.db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existingUser models.User
	err := usersCollection.FindOne(ctx, bson.M{
		"$or": []bson.M{
			{"email": req.Email},
			{"username": req.Username},
		},
	}).Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email or username already exists"})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	user := models.User{
		Username:  req.Username,
		Email:     req.Email,
		Password:  hashedPassword,
		FullName:  req.FullName,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	result, err := usersCollection.InsertOne(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	user.ID = result.InsertedID.(primitive.ObjectID)

	// Generate JWT token
	expiry, _ := time.ParseDuration(ac.cfg.JWTExpiry)
	token, err := utils.GenerateJWT(
		user.ID.Hex(),
		user.Email,
		user.Username,
		ac.cfg.JWTSecret,
		expiry,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, models.LoginResponse{
		Token: token,
		User:  user,
	})
}

func (ac *AuthController) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	usersCollection := ac.db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err := usersCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check password
	if !utils.CheckPassword(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate JWT token
	expiry, _ := time.ParseDuration(ac.cfg.JWTExpiry)
	token, err := utils.GenerateJWT(
		user.ID.Hex(),
		user.Email,
		user.Username,
		ac.cfg.JWTSecret,
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
}

func (ac *AuthController) GetProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	usersCollection := ac.db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err = usersCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (ac *AuthController) UpdateProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	usersCollection := ac.db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Build update document
	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if req.FullName != "" {
		update["$set"].(bson.M)["full_name"] = req.FullName
	}
	if req.Avatar != "" {
		update["$set"].(bson.M)["avatar"] = req.Avatar
	}

	// Update user
	result := usersCollection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": objID},
		update,
		// Return updated document
	)

	var user models.User
	err = result.Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Fetch updated user
	err = usersCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
