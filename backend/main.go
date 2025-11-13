package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"learn-backend/config"
	"learn-backend/database"
	"learn-backend/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Load configuration
	cfg := config.LoadConfig()

	// Set Gin mode
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database
	client, db, err := database.Connect(cfg.MongoDBURI, cfg.MongoDBDatabase)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Printf("Error disconnecting from database: %v", err)
		}
	}()

	// Create indexes
	if err := database.CreateIndexes(db); err != nil {
		log.Fatal("Failed to create indexes:", err)
	}

	// Setup router
	router := gin.Default()
	routes.SetupRoutes(router, db, cfg)

	// Graceful shutdown
	srv := routes.StartServer(router, cfg.Port)

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}
