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

	r.Use(static.Serve("/", static.LocalFile("./build", false)))

	setupRoutes(r)

	r.NoRoute(func(c *gin.Context) {
		if _, err := os.Stat("./build" + c.Request.URL.Path); os.IsNotExist(err) {
			c.File("./build/index.html")
		}
	})

	log.Printf("Server starting on port %d", 80)
	if err := r.Run(":80"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func setupRoutes(r *gin.Engine) {
	r.POST("/api/generate-pdf", generatePDF)
	r.GET("/download-pdf/:filename", downloadPDF)
	r.POST("/api/export-json", exportJSON)
	r.GET("/download-json/:filename", downloadJSON)
}
