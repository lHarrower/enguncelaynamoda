package config

import (
	"os"
	"strconv"
	"strings"
)

// Config holds all configuration for the application
type Config struct {
	// Server configuration
	Port        string
	Environment string
	Host        string

	// Database configuration
	DatabaseURL string

	// JWT configuration
	JWTSecret           string
	JWTExpirationHours  int
	JWTRefreshDays      int

	// Google Cloud configuration
	GCPProjectID     string
	GCPRegion        string
	StorageBucket    string
	ArtifactRegistry string

	// CORS configuration
	AllowedOrigins []string

	// Email configuration
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
	FromEmail    string

	// Redis configuration (for caching and sessions)
	RedisURL string

	// File upload configuration
	MaxFileSize      int64 // in bytes
	AllowedFileTypes []string

	// Rate limiting
	RateLimitRPS int // requests per second

	// Monitoring
	EnableMetrics bool
	MetricsPort   string

	// Feature flags
	FeatureFlags map[string]bool
}

// Load loads configuration from environment variables
func Load() *Config {
	return &Config{
		// Server configuration
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
		Host:        getEnv("HOST", "localhost"),

		// Database configuration
		DatabaseURL: getEnv("DATABASE_URL", "postgres://aynamoda_user:aynamoda_pass@localhost:5432/aynamoda_db?sslmode=disable"),

		// JWT configuration
		JWTSecret:          getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production"),
		JWTExpirationHours: getEnvAsInt("JWT_EXPIRATION_HOURS", 24),
		JWTRefreshDays:     getEnvAsInt("JWT_REFRESH_DAYS", 7),

		// Google Cloud configuration
		GCPProjectID:     getEnv("GCP_PROJECT_ID", "aynamoda-dev"),
		GCPRegion:        getEnv("GCP_REGION", "europe-west1"),
		StorageBucket:    getEnv("STORAGE_BUCKET", "aynamoda-dev-storage"),
		ArtifactRegistry: getEnv("ARTIFACT_REGISTRY", "europe-west1-docker.pkg.dev/aynamoda-dev/aynamoda-registry"),

		// CORS configuration
		AllowedOrigins: getEnvAsSlice("ALLOWED_ORIGINS", []string{"http://localhost:3000", "http://localhost:19006"}),

		// Email configuration
		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnvAsInt("SMTP_PORT", 587),
		SMTPUsername: getEnv("SMTP_USERNAME", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		FromEmail:    getEnv("FROM_EMAIL", "noreply@aynamoda.com"),

		// Redis configuration
		RedisURL: getEnv("REDIS_URL", "redis://localhost:6379"),

		// File upload configuration
		MaxFileSize:      getEnvAsInt64("MAX_FILE_SIZE", 10*1024*1024), // 10MB default
		AllowedFileTypes: getEnvAsSlice("ALLOWED_FILE_TYPES", []string{"image/jpeg", "image/png", "image/webp"}),

		// Rate limiting
		RateLimitRPS: getEnvAsInt("RATE_LIMIT_RPS", 100),

		// Monitoring
		EnableMetrics: getEnvAsBool("ENABLE_METRICS", true),
		MetricsPort:   getEnv("METRICS_PORT", "9090"),

		// Feature flags
		FeatureFlags: map[string]bool{
			"style_dna_test":     getEnvAsBool("FEATURE_STYLE_DNA_TEST", true),
			"image_processing":   getEnvAsBool("FEATURE_IMAGE_PROCESSING", false),
			"outfit_generation": getEnvAsBool("FEATURE_OUTFIT_GENERATION", true),
			"email_invitations": getEnvAsBool("FEATURE_EMAIL_INVITATIONS", false),
			"analytics":         getEnvAsBool("FEATURE_ANALYTICS", true),
		},
	}
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction returns true if the environment is production
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

// IsFeatureEnabled returns true if the given feature flag is enabled
func (c *Config) IsFeatureEnabled(feature string) bool {
	enabled, exists := c.FeatureFlags[feature]
	return exists && enabled
}

// Helper functions

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if int64Value, err := strconv.ParseInt(value, 10, 64); err == nil {
			return int64Value
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return strings.Split(value, ",")
	}
	return defaultValue
}