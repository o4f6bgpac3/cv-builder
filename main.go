package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

type GeneratePDFRequest struct {
	HTML string `json:"html"`
}

func main() {
	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	config := cors.DefaultConfig()
	allowedOrigins := strings.Split(getEnv("ALLOWED_ORIGINS", "http://localhost"), ",")
	config.AllowOrigins = allowedOrigins
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept"}
	r.Use(cors.New(config))

	// Serve static files from the build directory
	r.Use(static.Serve("/", static.LocalFile("./build", false)))

	// API routes
	r.POST("/api/generate-pdf", generatePDF)

	// Handle React Router
	r.NoRoute(func(c *gin.Context) {
		if _, err := os.Stat("./build" + c.Request.URL.Path); os.IsNotExist(err) {
			c.File("./build/index.html")
		}
	})

	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func generatePDF(c *gin.Context) {
	var req GeneratePDFRequest
	if err := c.BindJSON(&req); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if req.HTML == "" {
		log.Print("Error: HTML content is empty")
		c.JSON(http.StatusBadRequest, gin.H{"error": "HTML content is required"})
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
	_, err = part.Write([]byte(req.HTML))
	if err != nil {
		log.Printf("Error writing HTML to form file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare request for Gotenberg"})
		return
	}

	if err := writer.Close(); err != nil {
		log.Printf("Error closing multipart writer: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to finalize request for Gotenberg"})
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

	// Set headers for PDF download
	c.Header("Content-Disposition", "attachment; filename=cv.pdf")
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Length", fmt.Sprintf("%d", len(pdfBytes)))

	// Write PDF bytes to response
	_, err = c.Writer.Write(pdfBytes)
	if err != nil {
		log.Printf("Error writing PDF to response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send PDF to client"})
		return
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
