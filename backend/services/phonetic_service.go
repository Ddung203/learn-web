package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type PhoneticResult struct {
	Phonetic     string
	PartOfSpeech string
}

type DictionaryAPIResponse struct {
	Word      string `json:"word"`
	Phonetics []struct {
		Text string `json:"text"`
	} `json:"phonetics"`
	Meanings []struct {
		PartOfSpeech string `json:"partOfSpeech"`
	} `json:"meanings"`
}

type PhoneticService struct {
	client *http.Client
}

func NewPhoneticService() *PhoneticService {
	return &PhoneticService{
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (ps *PhoneticService) GetPhonetic(word string) PhoneticResult {
	result := PhoneticResult{
		Phonetic:     "",
		PartOfSpeech: "",
	}

	if word == "" {
		return result
	}

	url := fmt.Sprintf("https://api.dictionaryapi.dev/api/v2/entries/en/%s", word)
	
	resp, err := ps.client.Get(url)
	if err != nil {
		return result
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return result
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return result
	}

	var apiResponse []DictionaryAPIResponse
	if err := json.Unmarshal(body, &apiResponse); err != nil {
		return result
	}

	if len(apiResponse) == 0 {
		return result
	}

	// Get phonetic
	if len(apiResponse[0].Phonetics) > 0 {
		for _, phonetic := range apiResponse[0].Phonetics {
			if phonetic.Text != "" {
				result.Phonetic = phonetic.Text
				break
			}
		}
	}

	// Get part of speech (first one)
	if len(apiResponse[0].Meanings) > 0 {
		result.PartOfSpeech = apiResponse[0].Meanings[0].PartOfSpeech
	}

	return result
}
