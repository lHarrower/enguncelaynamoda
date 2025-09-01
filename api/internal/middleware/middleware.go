package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/time/rate"

	"aynamoda/internal/config"
	"aynamoda/internal/utils"
)

// RequestIDMiddleware adds a unique request ID to each request
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}

		c.Set("requestID", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

// LoggingMiddleware logs HTTP requests
func LoggingMiddleware() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\
",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// CORSMiddleware configures CORS settings
func CORSMiddleware(cfg *config.Config) gin.HandlerFunc {
	corsConfig := cors.Config{
		AllowOrigins:     cfg.CORS.AllowedOrigins,
		AllowMethods:     cfg.CORS.AllowedMethods,
		AllowHeaders:     cfg.CORS.AllowedHeaders,
		ExposeHeaders:    cfg.CORS.ExposedHeaders,
		AllowCredentials: cfg.CORS.AllowCredentials,
		MaxAge:           time.Duration(cfg.CORS.MaxAge) * time.Second,
	}

	// Allow all origins in development
	if cfg.Server.Environment == "development" {
		corsConfig.AllowAllOrigins = true
	}

	return cors.New(corsConfig)
}

// SecurityHeadersMiddleware adds security headers
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Next()
	}
}

// RateLimitMiddleware implements rate limiting
type RateLimiter struct {
	limiters map[string]*rate.Limiter
	rps      rate.Limit
	burst    int
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(rps rate.Limit, burst int) *RateLimiter {
	return &RateLimiter{
		limiters: make(map[string]*rate.Limiter),
		rps:      rps,
		burst:    burst,
	}
}

// GetLimiter returns a rate limiter for the given key
func (rl *RateLimiter) GetLimiter(key string) *rate.Limiter {
	limiter, exists := rl.limiters[key]
	if !exists {
		limiter = rate.NewLimiter(rl.rps, rl.burst)
		rl.limiters[key] = limiter
	}
	return limiter
}

// RateLimitMiddleware creates rate limiting middleware
func RateLimitMiddleware(rateLimiter *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Use IP address as the key for rate limiting
		key := c.ClientIP()
		limiter := rateLimiter.GetLimiter(key)

		if !limiter.Allow() {
			utils.TooManyRequestsResponse(c, "Rate limit exceeded")
			c.Abort()
			return
		}

		c.Next()
	}
}

// UserRateLimitMiddleware implements per-user rate limiting
func UserRateLimitMiddleware(rateLimiter *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try to get user ID from context (if authenticated)
		userID, exists := c.Get("userID")
		var key string
		if exists {
			key = fmt.Sprintf("user:%s", userID.(uuid.UUID).String())
		} else {
			// Fall back to IP-based rate limiting for unauthenticated users
			key = fmt.Sprintf("ip:%s", c.ClientIP())
		}

		limiter := rateLimiter.GetLimiter(key)
		if !limiter.Allow() {
			utils.TooManyRequestsResponse(c, "Rate limit exceeded")
			c.Abort()
			return
		}

		c.Next()
	}
}

// PaginationMiddleware validates and sets pagination parameters
func PaginationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

		// Validate and normalize pagination parameters
		page, limit, _ = utils.ValidatePaginationParams(page, limit)

		c.Set("page", page)
		c.Set("limit", limit)
		c.Next()
	}
}

// ContentTypeMiddleware ensures JSON content type for POST/PUT requests
func ContentTypeMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
			contentType := c.GetHeader("Content-Type")
			if !strings.Contains(contentType, "application/json") && !strings.Contains(contentType, "multipart/form-data") {
				utils.ErrorResponse(c, http.StatusUnsupportedMediaType, "Content-Type must be application/json or multipart/form-data", nil)
				c.Abort()
				return
			}
		}
		c.Next()
	}
}

// TimeoutMiddleware adds request timeout
func TimeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
	return gin.TimeoutWithHandler(timeout, func(c *gin.Context) {
		utils.ErrorResponse(c, http.StatusRequestTimeout, "Request timeout", nil)
	})
}

// HealthCheckMiddleware bypasses other middleware for health check endpoints
func HealthCheckMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/health" || c.Request.URL.Path == "/ready" {
			c.Next()
			return
		}
		c.Next()
	}
}

// ErrorHandlerMiddleware handles panics and errors
func ErrorHandlerMiddleware() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			utils.InternalServerErrorResponse(c, "Internal server error", fmt.Errorf("%s", err))
		} else {
			utils.InternalServerErrorResponse(c, "Internal server error", fmt.Errorf("%v", recovered))
		}
		c.Abort()
	})
}

// APIVersionMiddleware validates API version
func APIVersionMiddleware(supportedVersions []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiVersion := c.GetHeader("API-Version")
		if apiVersion == "" {
			// Default to latest version if not specified
			c.Next()
			return
		}

		// Check if the requested version is supported
		for _, version := range supportedVersions {
			if apiVersion == version {
				c.Set("apiVersion", apiVersion)
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusBadRequest, fmt.Sprintf("Unsupported API version: %s", apiVersion), nil)
		c.Abort()
	}
}

// MaintenanceMiddleware checks if the API is in maintenance mode
func MaintenanceMiddleware(inMaintenance bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		if inMaintenance {
			// Allow health checks during maintenance
			if c.Request.URL.Path == "/health" || c.Request.URL.Path == "/ready" {
				c.Next()
				return
			}

			utils.ErrorResponse(c, http.StatusServiceUnavailable, "API is currently under maintenance", nil)
			c.Abort()
			return
		}
		c.Next()
	}
}