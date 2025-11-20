package controllers

import (
	"encoding/json"
	"learn-backend/models"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type UpdateCampaignController struct{}

func NewUpdateCampaignController() *UpdateCampaignController {
	return &UpdateCampaignController{}
}

func (ucc *UpdateCampaignController) GetUpdateCampaign(c *gin.Context) {
	campaignJSON := os.Getenv("UPDATE_CAMPAIGN")

	if campaignJSON == "" {
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}

	// Parse JSON
	var config models.UpdateCampaignConfig
	if err := json.Unmarshal([]byte(campaignJSON), &config); err != nil {
		// Sai định dạng
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}

	// Parse deadline
	deadline, err := time.Parse(time.RFC3339, config.Deadline)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}

	// Tính isShowUpdateInfo
	isShowUpdateInfo := time.Now().Before(deadline)

	campaign := models.UpdateCampaign{
		Version:          config.Version,
		Deadline:         deadline,
		Title:            config.Title,
		Content:          config.Content,
		IsShowUpdateInfo: isShowUpdateInfo,
	}

	c.JSON(http.StatusOK, gin.H{"data": campaign})
}
