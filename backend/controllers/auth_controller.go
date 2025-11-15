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

	// Generate refresh token
	refreshExpiry, _ := time.ParseDuration(ac.cfg.RefreshTokenExpiry)
	refreshToken, err := utils.GenerateRefreshToken(
		user.ID.Hex(),
		ac.cfg.JWTSecret,
		refreshExpiry,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	// Store refresh token in database
	refreshTokenCollection := ac.db.Collection("refresh_tokens")
	refreshTokenDoc := models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(refreshExpiry),
		CreatedAt: time.Now(),
	}
	_, err = refreshTokenCollection.InsertOne(ctx, refreshTokenDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store refresh token"})
		return
	}

	c.JSON(http.StatusCreated, models.LoginResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         user,
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

	// Generate refresh token
	refreshExpiry, _ := time.ParseDuration(ac.cfg.RefreshTokenExpiry)
	refreshToken, err := utils.GenerateRefreshToken(
		user.ID.Hex(),
		ac.cfg.JWTSecret,
		refreshExpiry,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	// Store refresh token in database
	refreshTokenCollection := ac.db.Collection("refresh_tokens")
	refreshTokenDoc := models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(refreshExpiry),
		CreatedAt: time.Now(),
	}
	_, err = refreshTokenCollection.InsertOne(ctx, refreshTokenDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store refresh token"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         user,
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

func (ac *AuthController) RefreshToken(c *gin.Context) {
	var req models.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate refresh token
	claims, err := utils.ValidateRefreshToken(req.RefreshToken, ac.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	// Check if refresh token exists in database and not expired
	refreshTokenCollection := ac.db.Collection("refresh_tokens")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userID, _ := primitive.ObjectIDFromHex(claims.UserID)
	var storedToken models.RefreshToken
	err = refreshTokenCollection.FindOne(ctx, bson.M{
		"user_id": userID,
		"token":   req.RefreshToken,
		"expires_at": bson.M{
			"$gt": time.Now(),
		},
	}).Decode(&storedToken)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token not found or expired"})
		return
	}

	// Get user info
	usersCollection := ac.db.Collection("users")
	var user models.User
	err = usersCollection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Generate new access token
	expiry, _ := time.ParseDuration(ac.cfg.JWTExpiry)
	newAccessToken, err := utils.GenerateJWT(
		user.ID.Hex(),
		user.Email,
		user.Username,
		ac.cfg.JWTSecret,
		expiry,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	// Generate new refresh token (sliding window)
	refreshExpiry, _ := time.ParseDuration(ac.cfg.RefreshTokenExpiry)
	newRefreshToken, err := utils.GenerateRefreshToken(
		user.ID.Hex(),
		ac.cfg.JWTSecret,
		refreshExpiry,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	// Delete old refresh token
	_, err = refreshTokenCollection.DeleteOne(ctx, bson.M{"_id": storedToken.ID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete old refresh token"})
		return
	}

	// Store new refresh token
	newRefreshTokenDoc := models.RefreshToken{
		UserID:    user.ID,
		Token:     newRefreshToken,
		ExpiresAt: time.Now().Add(refreshExpiry),
		CreatedAt: time.Now(),
	}
	_, err = refreshTokenCollection.InsertOne(ctx, newRefreshTokenDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store refresh token"})
		return
	}

	c.JSON(http.StatusOK, models.RefreshResponse{
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	})
}

func (ac *AuthController) Logout(c *gin.Context) {
	var req models.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Delete refresh token from database
	refreshTokenCollection := ac.db.Collection("refresh_tokens")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := refreshTokenCollection.DeleteOne(ctx, bson.M{"token": req.RefreshToken})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (ac *AuthController) LogoutAll(c *gin.Context) {
	userID := c.GetString("user_id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Delete all refresh tokens for this user
	refreshTokenCollection := ac.db.Collection("refresh_tokens")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = refreshTokenCollection.DeleteMany(ctx, bson.M{"user_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout from all devices"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out from all devices successfully"})
}
