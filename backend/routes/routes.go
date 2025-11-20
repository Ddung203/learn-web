package routes

import (
	"context"
	"learn-backend/config"
	"learn-backend/controllers"
	"learn-backend/middleware"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRoutes(router *gin.Engine, db *mongo.Database, cfg *config.Config) {
	// CORS middleware
	router.Use(middleware.CORS(cfg.CORSOrigins))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// API v1
	v1 := router.Group("/api/v1")

	// Auth routes (public)
	authController := controllers.NewAuthController(db, cfg)
	loginOrRegisterController := controllers.NewLoginOrRegisterController(db, cfg)
	auth := v1.Group("/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
		auth.POST("/login-or-register", loginOrRegisterController.LoginOrRegister)
		auth.POST("/refresh", authController.RefreshToken)
		auth.POST("/logout", authController.Logout)
	}

	// Protected routes
	protected := v1.Group("")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// User profile
		protected.GET("/profile", authController.GetProfile)
		protected.PUT("/profile", authController.UpdateProfile)
		protected.POST("/auth/logout-all", authController.LogoutAll)

		// Card sets
		cardSetController := controllers.NewCardSetController(db)
		cardSets := protected.Group("/cardsets")
		{
			cardSets.GET("", cardSetController.GetCardSets)
			cardSets.GET("/global", cardSetController.GetGlobalCardSets)
			cardSets.GET("/:id", cardSetController.GetCardSet)
			cardSets.POST("", cardSetController.CreateCardSet)
			cardSets.PUT("/:id", cardSetController.UpdateCardSet)
			cardSets.DELETE("/:id", cardSetController.DeleteCardSet)
			cardSets.POST("/:id/publish", cardSetController.TogglePublish)
			cardSets.POST("/:id/import", cardSetController.ImportFromGlobal)
			cardSets.POST("/:id/generate-phonetics", cardSetController.GeneratePhonetics)
		}

		// Statistics
		statisticsController := controllers.NewStatisticsController(db)
		statistics := protected.Group("/statistics")
		{
			statistics.POST("/sessions", statisticsController.RecordStudySession)
			statistics.GET("", statisticsController.GetUserStatistics)
			statistics.GET("/cardsets/:id", statisticsController.GetCardSetStatistics)
		}

		// Image search
		imageController := controllers.NewImageController()
		protected.GET("/images/search", imageController.SearchImages)
	}

}

func StartServer(router *gin.Engine, port string) *http.Server {
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("Server starting on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	return srv
}

func StopServer(srv *http.Server) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return srv.Shutdown(ctx)
}
