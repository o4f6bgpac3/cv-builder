package main

import (
	"bytes"
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
	pdfBytes, err := sendToGotenberg(buf.Bytes())
	if err != nil {
		log.Printf("Error from Gotenberg: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate PDF"})
		return
	}

	// Set headers for file download
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s_CV.pdf", cvData.Name))
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Expires", "0")
	c.Header("Cache-Control", "must-revalidate")
	c.Header("Pragma", "public")
	c.Header("Content-Length", fmt.Sprintf("%d", len(pdfBytes)))

	// Write PDF bytes directly to the response
	_, err = c.Writer.Write(pdfBytes)
	if err != nil {
		return
	}
}

func sendToGotenberg(htmlContent []byte) ([]byte, error) {
	gotenbergURL := getEnv("GOTENBERG_URL", "http://gotenberg:3000")
	gotenbergEndpoint := fmt.Sprintf("%s/forms/chromium/convert/html", gotenbergURL)

	payload := &bytes.Buffer{}
	writer := multipart.NewWriter(payload)

	part, err := writer.CreateFormFile("files", "index.html")
	if err != nil {
		return nil, fmt.Errorf("error creating form file: %v", err)
	}

	_, err = io.Copy(part, bytes.NewReader(htmlContent))
	if err != nil {
		return nil, fmt.Errorf("error copying HTML content: %v", err)
	}

	err = writer.Close()
	if err != nil {
		return nil, fmt.Errorf("error closing multipart writer: %v", err)
	}

	req, err := http.NewRequest("POST", gotenbergEndpoint, payload)
	if err != nil {
		return nil, fmt.Errorf("error creating request for Gotenberg: %v", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error sending request to Gotenberg: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gotenberg returned non-OK status: %d, Body: %s", resp.StatusCode, string(bodyBytes))
	}

	return io.ReadAll(resp.Body)
}
