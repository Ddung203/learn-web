package models

import "time"

type UpdateCampaign struct {
	Version          string    `json:"version"`
	Deadline         time.Time `json:"deadline"`
	Title            string    `json:"title"`
	Content          string    `json:"content"`
	IsShowUpdateInfo bool      `json:"is_show_update_info"`
}

type UpdateCampaignConfig struct {
	Version  string `json:"version"`
	Deadline string `json:"deadline"`
	Title    string `json:"title"`
	Content  string `json:"content"`
}
