package main

import (
	"log"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

type CVData struct {
	Name       string   `json:"name"`
	Address    string   `json:"address"`
	Phone1     string   `json:"phone1"`
	Phone2     string   `json:"phone2"`
	Email      string   `json:"email"`
	Statement  string   `json:"statement"`
	Skills     []string `json:"skills"`
	Experience []struct {
		Title   string   `json:"title"`
		Company string   `json:"company"`
		Period  string   `json:"period"`
		Duties  []string `json:"duties"`
	} `json:"experience"`
	Interests []string `json:"interests"`
}

func main() {
	ginMode := getEnv("GIN_MODE", "debug")
	gin.SetMode(ginMode)
	r := gin.Default()

	config := cors.DefaultConfig()
	allowedOrigins := strings.Split(getEnv("ALLOWED_ORIGINS", "http://localhost"), ",")
	config.AllowOrigins = allowedOrigins
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept"}
	r.Use(cors.New(config))

	r.Use(static.Serve("/", static.LocalFile("./dist", false)))

	api := r.Group("/api")
	{
		api.POST("/generate-pdf", generatePDF)
		api.POST("/export-json", exportJSON)
	}

	r.GET("/download-pdf/:filename", downloadPDF)
	r.GET("/download-json/:filename", downloadJSON)

	r.NoRoute(func(c *gin.Context) {
		c.File("./dist/index.html")
	})

	port := getEnv("PORT", "80")
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
