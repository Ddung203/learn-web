package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

type ImageController struct{}

func NewImageController() *ImageController {
	return &ImageController{}
}

type PixabayHit struct {
	ID             int    `json:"id"`
	PageURL        string `json:"pageURL"`
	Type           string `json:"type"`
	Tags           string `json:"tags"`
	PreviewURL     string `json:"previewURL"`
	PreviewWidth   int    `json:"previewWidth"`
	PreviewHeight  int    `json:"previewHeight"`
	WebformatURL   string `json:"webformatURL"`
	WebformatWidth int    `json:"webformatWidth"`
	WebformatHeight int   `json:"webformatHeight"`
	LargeImageURL  string `json:"largeImageURL"`
	ImageWidth     int    `json:"imageWidth"`
	ImageHeight    int    `json:"imageHeight"`
	ImageSize      int    `json:"imageSize"`
	Views          int    `json:"views"`
	Downloads      int    `json:"downloads"`
	Collections    int    `json:"collections"`
	Likes          int    `json:"likes"`
	Comments       int    `json:"comments"`
	UserID         int    `json:"user_id"`
	User           string `json:"user"`
	UserImageURL   string `json:"userImageURL"`
}

type PixabayResponse struct {
	Total     int          `json:"total"`
	TotalHits int          `json:"totalHits"`
	Hits      []PixabayHit `json:"hits"`
}

func (ic *ImageController) SearchImages(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	perPage := c.DefaultQuery("per_page", "10")

	apiKey := os.Getenv("PIXABAY_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "PIXABAY_API_KEY not configured"})
		return
	}

	apiURL := fmt.Sprintf(
		"https://pixabay.com/api/?key=%s&q=%s&image_type=photo&per_page=%s",
		apiKey,
		url.QueryEscape(query),
		perPage,
	)

	resp, err := http.Get(apiURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch images from Pixabay"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		c.JSON(resp.StatusCode, gin.H{"error": fmt.Sprintf("Pixabay API error: %s", string(body))})
		return
	}

	var pixabayResp PixabayResponse
	if err := json.NewDecoder(resp.Body).Decode(&pixabayResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode Pixabay response"})
		return
	}

	c.JSON(http.StatusOK, pixabayResp)
}
