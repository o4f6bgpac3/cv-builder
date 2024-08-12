package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"log"
	"mime/multipart"
	"net/http"
)

func generatePDF(c *gin.Context) {
	var cvData CVData
	if err := c.BindJSON(&cvData); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Generate HTML using the templ template
	var buf bytes.Buffer
	if err := cvTemplate(cvData).Render(c.Request.Context(), &buf); err != nil {
		log.Printf("Error rendering template: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate HTML"})
		return
	}

	// Send HTML to Gotenberg
	gotenbergURL := getEnv("GOTENBERG_URL", "http://gotenberg:3000")
	gotenbergEndpoint := fmt.Sprintf("%s/forms/chromium/convert/html", gotenbergURL)
	payload := &bytes.Buffer{}
	writer := multipart.NewWriter(payload)

	// Create a form file for index.html
	part, err := writer.CreateFormFile("files", "index.html")
	if err != nil {
		log.Printf("Error creating form file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare request for Gotenberg"})
		return
	}

	// Write the HTML content to the form file
	_, err = io.Copy(part, &buf)
	if err != nil {
		log.Printf("Error writing HTML to form file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare request for Gotenberg"})
		return
	}

	err = writer.Close()
	if err != nil {
		log.Printf("Error closing multipart writer: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare request for Gotenberg"})
		return
	}

	gotenbergReq, err := http.NewRequest("POST", gotenbergEndpoint, payload)
	if err != nil {
		log.Printf("Error creating request for Gotenberg: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request for Gotenberg"})
		return
	}
	gotenbergReq.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(gotenbergReq)
	if err != nil {
		log.Printf("Error sending request to Gotenberg: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request to Gotenberg"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("Gotenberg returned non-OK status: %d, Body: %s", resp.StatusCode, string(bodyBytes))
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gotenberg returned non-OK status: %d", resp.StatusCode)})
		return
	}

	// Read the entire response body
	pdfBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading PDF from Gotenberg response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read PDF from Gotenberg"})
		return
	}

	// Encode the PDF as base64
	pdfBase64 := base64.StdEncoding.EncodeToString(pdfBytes)

	// Return the base64 encoded PDF
	c.JSON(http.StatusOK, gin.H{"pdf": pdfBase64})
}
