package main

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"os"
	"path/filepath"
)

func exportJSON(c *gin.Context) {
	var cvData CVData
	if err := c.BindJSON(&cvData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid JSON data"})
		return
	}

	jsonData, err := json.MarshalIndent(cvData, "", "  ")
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate JSON"})
		return
	}

	filename := "cv_data_" + uuid.New().String() + ".json"
	path := filepath.Join(tempDir, filename)

	if err := os.WriteFile(path, jsonData, 0644); err != nil {
		c.JSON(500, gin.H{"error": "Failed to save JSON file"})
		return
	}

	downloadLink := "/download-json/" + filename

	c.JSON(200, gin.H{
		"download_link": downloadLink,
	})
}

func downloadJSON(c *gin.Context) {
	filename := c.Param("filename")
	path := filepath.Join(tempDir, filename)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "JSON file not found"})
		return
	}

	c.FileAttachment(path, "cv_data.json")
}
