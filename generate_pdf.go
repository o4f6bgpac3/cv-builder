package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	tempDir        = "./.temp"
	expirationTime = 15 * time.Minute
)

func init() {
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		log.Fatalf("Failed to create PDF directory: %v", err)
	}

	go cleanupExpiredPDFs()
}

func generatePDF(c *gin.Context) {
	var cvData CVData
	if err := c.BindJSON(&cvData); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var buf bytes.Buffer
	if err := cvTemplate(cvData).Render(c.Request.Context(), &buf); err != nil {
		log.Printf("Error rendering template: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate HTML"})
		return
	}

	gotenbergURL := getEnv("GOTENBERG_URL", "http://gotenberg:3000")
	gotenbergEndpoint := fmt.Sprintf("%s/forms/chromium/convert/html", gotenbergURL)
	payload := &bytes.Buffer{}
	writer := multipart.NewWriter(payload)

	part, err := writer.CreateFormFile("files", "index.html")
	if err != nil {
		log.Printf("Error creating form file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare request for Gotenberg"})
		return
	}

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

	pdfBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading PDF from Gotenberg response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read PDF from Gotenberg"})
		return
	}

	filename := fmt.Sprintf("%s.pdf", uuid.New().String())
	path := filepath.Join(tempDir, filename)

	if err := os.WriteFile(path, pdfBytes, 0644); err != nil {
		log.Printf("Error saving PDF: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save PDF"})
		return
	}

	downloadLink := fmt.Sprintf("/download-pdf/%s", filename)

	pdfBase64 := base64.StdEncoding.EncodeToString(pdfBytes)

	c.JSON(http.StatusOK, gin.H{
		"pdf_preview":   pdfBase64,
		"download_link": downloadLink,
	})
}

func downloadPDF(c *gin.Context) {
	filename := c.Param("filename")
	path := filepath.Join(tempDir, filename)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "PDF not found"})
		return
	}

	c.FileAttachment(path, "cv.pdf")
}

func cleanupExpiredPDFs() {
	for {
		time.Sleep(5 * time.Minute)

		files, err := os.ReadDir(tempDir)
		if err != nil {
			log.Printf("Error reading temp directory: %v", err)
			continue
		}

		for _, file := range files {
			if file.IsDir() {
				continue
			}

			path := filepath.Join(tempDir, file.Name())
			info, err := os.Stat(path)
			if err != nil {
				log.Printf("Error getting file info: %v", err)
				continue
			}

			if time.Since(info.ModTime()) > expirationTime {
				if err := os.Remove(path); err != nil {
					log.Printf("Error removing expired file: %v", err)
				} else {
					log.Printf("Removed expired file: %s", file.Name())
				}
			}
		}
	}
}
