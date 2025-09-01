package router

import (
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"

	"aynamoda/internal/config"
	"aynamoda/internal/handlers"
	"aynamoda/internal/middleware"
	"aynamoda/internal/utils"
)

// Router holds all dependencies for routing
type Router struct {
	config         *config.Config
	jwtManager     *utils.JWTManager
	userHandler    *handlers.UserHandler
	productHandler *handlers.ProductHandler
	categoryHandler *handlers.CategoryHandler
	outfitHandler  *handlers.OutfitHandler
}

// NewRouter creates a new router instance
func NewRouter(
	cfg *config.Config,
	jwtManager *utils.JWTManager,
	userHandler *handlers.UserHandler,
	productHandler *handlers.ProductHandler,
	categoryHandler *handlers.CategoryHandler,
	outfitHandler *handlers.OutfitHandler,
) *Router {
	return &Router{
		config:          cfg,
		jwtManager:      jwtManager,
		userHandler:     userHandler,
		productHandler:  productHandler,
		categoryHandler: categoryHandler,
		outfitHandler:   outfitHandler,
	}
}

// SetupRoutes configures all routes and middleware
func (r *Router) SetupRoutes() *gin.Engine {
	// Set Gin mode based on environment
	if r.config.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	router := gin.New()

	// Global middleware
	r.setupGlobalMiddleware(router)

	// Health check routes (no authentication required)
	r.setupHealthRoutes(router)

	// API routes
	api := router.Group("/api")
	r.setupAPIRoutes(api)

	return router
}

// setupGlobalMiddleware configures global middleware
func (r *Router) setupGlobalMiddleware(router *gin.Engine) {
	// Recovery middleware (should be first)
	router.Use(middleware.ErrorHandlerMiddleware())

	// Request ID middleware
	router.Use(middleware.RequestIDMiddleware())

	// Logging middleware
	router.Use(middleware.LoggingMiddleware())

	// Security headers
	router.Use(middleware.SecurityHeadersMiddleware())

	// CORS middleware
	router.Use(middleware.CORSMiddleware(r.config))

	// Content type validation
	router.Use(middleware.ContentTypeMiddleware())

	// Health check bypass
	router.Use(middleware.HealthCheckMiddleware())

	// Maintenance mode check
	router.Use(middleware.MaintenanceMiddleware(false)) // TODO: Make this configurable

	// API version validation
	supportedVersions := []string{"v1", "v2"}
	router.Use(middleware.APIVersionMiddleware(supportedVersions))

	// Global rate limiting
	globalRateLimiter := middleware.NewRateLimiter(rate.Limit(100), 200) // 100 requests per second, burst of 200
	router.Use(middleware.RateLimitMiddleware(globalRateLimiter))

	// Request timeout
	router.Use(middleware.TimeoutMiddleware(30 * time.Second))
}

// setupHealthRoutes configures health check routes
func (r *Router) setupHealthRoutes(router *gin.Engine) {
	health := router.Group("/")
	{
		health.GET("/health", r.healthCheck)
		health.GET("/ready", r.readinessCheck)
		health.GET("/version", r.versionInfo)
	}
}

// setupAPIRoutes configures all API routes
func (r *Router) setupAPIRoutes(api *gin.RouterGroup) {
	// API v1 routes
	v1 := api.Group("/v1")
	{
		// Authentication routes (no auth required)
		r.setupAuthRoutes(v1)

		// Public routes (no auth required)
		r.setupPublicRoutes(v1)

		// Protected routes (authentication required)
		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware(r.jwtManager))
		{
			r.setupUserRoutes(protected)
			r.setupProductRoutes(protected)
			r.setupCategoryRoutes(protected)
			r.setupOutfitRoutes(protected)
		}

		// Admin routes (admin role required)
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware(r.jwtManager))
		admin.Use(middleware.AdminMiddleware())
		{
			r.setupAdminRoutes(admin)
		}
	}
}

// setupAuthRoutes configures authentication routes
func (r *Router) setupAuthRoutes(v1 *gin.RouterGroup) {
	auth := v1.Group("/auth")
	{
		auth.POST("/register", r.userHandler.Register)
		auth.POST("/login", r.userHandler.Login)
		auth.POST("/refresh", middleware.RefreshTokenMiddleware(r.jwtManager), r.userHandler.RefreshToken)
		auth.POST("/forgot-password", r.userHandler.ForgotPassword)
		auth.POST("/reset-password", r.userHandler.ResetPassword)
	}
}

// setupPublicRoutes configures public routes (no authentication required)
func (r *Router) setupPublicRoutes(v1 *gin.RouterGroup) {
	public := v1.Group("/public")
	public.Use(middleware.OptionalAuthMiddleware(r.jwtManager)) // Optional auth for personalization
	{
		// Public categories
		public.GET("/categories", r.categoryHandler.GetAllCategories)
		public.GET("/categories/root", r.categoryHandler.GetRootCategories)
		public.GET("/categories/tree", r.categoryHandler.GetCategoryTree)
		public.GET("/categories/:id", r.categoryHandler.GetCategoryByID)
		public.GET("/categories/slug/:slug", r.categoryHandler.GetCategoryBySlug)
		public.GET("/categories/:id/subcategories", r.categoryHandler.GetSubcategories)

		// Public outfits
		public.GET("/outfits", r.outfitHandler.GetPublicOutfits)
		public.GET("/outfits/search", r.outfitHandler.SearchOutfits)
		public.GET("/outfits/top-rated", r.outfitHandler.GetOutfitsByRating)
	}
}

// setupUserRoutes configures user-related routes
func (r *Router) setupUserRoutes(protected *gin.RouterGroup) {
	users := protected.Group("/users")
	{
		// User profile management
		users.GET("/profile", r.userHandler.GetProfile)
		users.PUT("/profile", r.userHandler.UpdateProfile)
		users.POST("/change-password", r.userHandler.ChangePassword)
		users.POST("/deactivate", r.userHandler.DeactivateAccount)
		users.DELETE("/delete", r.userHandler.DeleteAccount)

		// Style DNA management
		users.GET("/style-dna", r.userHandler.GetStyleDNA)
		users.POST("/style-dna", r.userHandler.CreateStyleDNA)
		users.PUT("/style-dna", r.userHandler.UpdateStyleDNA)
	}
}

// setupProductRoutes configures product-related routes
func (r *Router) setupProductRoutes(protected *gin.RouterGroup) {
	products := protected.Group("/products")
	{
		// Product CRUD
		products.POST("/", r.productHandler.CreateProduct)
		products.GET("/:id", r.productHandler.GetProductByID)
		products.PUT("/:id", r.productHandler.UpdateProduct)
		products.DELETE("/:id", r.productHandler.DeleteProduct)

		// Product listing and search
		products.GET("/", r.productHandler.GetUserProducts)
		products.GET("/search", r.productHandler.SearchProducts)
		products.GET("/favorites", r.productHandler.GetFavoriteProducts)

		// Product actions
		products.POST("/:id/favorite", r.productHandler.ToggleFavorite)
		products.POST("/:id/wear", r.productHandler.UpdateWearCount)

		// Product images
		products.POST("/:id/images", r.productHandler.AddProductImage)
		products.DELETE("/:id/images/:imageId", r.productHandler.DeleteProductImage)
		products.PUT("/:id/images/:imageId/primary", r.productHandler.SetPrimaryImage)
	}
}

// setupCategoryRoutes configures category-related routes
func (r *Router) setupCategoryRoutes(protected *gin.RouterGroup) {
	categories := protected.Group("/categories")
	{
		// Category management (admin-like operations, but user can create personal categories)
		categories.POST("/", r.categoryHandler.CreateCategory)
		categories.PUT("/:id", r.categoryHandler.UpdateCategory)
		categories.DELETE("/:id", r.categoryHandler.DeleteCategory)

		// Category search and stats
		categories.GET("/search", r.categoryHandler.SearchCategories)
		categories.GET("/:id/stats", r.categoryHandler.GetCategoryStats)
		categories.PUT("/sort-order", r.categoryHandler.UpdateSortOrder)
	}
}

// setupOutfitRoutes configures outfit-related routes
func (r *Router) setupOutfitRoutes(protected *gin.RouterGroup) {
	outfits := protected.Group("/outfits")
	{
		// Outfit CRUD
		outfits.POST("/", r.outfitHandler.CreateOutfit)
		outfits.GET("/:id", r.outfitHandler.GetOutfitByID)
		outfits.PUT("/:id", r.outfitHandler.UpdateOutfit)
		outfits.DELETE("/:id", r.outfitHandler.DeleteOutfit)

		// Outfit listing and search
		outfits.GET("/", r.outfitHandler.GetUserOutfits)
		outfits.GET("/favorites", r.outfitHandler.GetFavoriteOutfits)
		outfits.GET("/recent", r.outfitHandler.GetRecentlyWornOutfits)
		outfits.GET("/popular", r.outfitHandler.GetMostWornOutfits)

		// Outfit actions
		outfits.POST("/:id/favorite", r.outfitHandler.ToggleFavorite)
		outfits.POST("/:id/wear", r.outfitHandler.UpdateWearCount)

		// Outfit products management
		outfits.POST("/:id/products/:productId", r.outfitHandler.AddProductToOutfit)
		outfits.DELETE("/:id/products/:productId", r.outfitHandler.RemoveProductFromOutfit)

		// Outfit statistics
		outfits.GET("/stats", r.outfitHandler.GetOutfitStats)
	}
}

// setupAdminRoutes configures admin-only routes
func (r *Router) setupAdminRoutes(admin *gin.RouterGroup) {
	// User management
	users := admin.Group("/users")
	{
		users.GET("/", r.userHandler.GetUsers)
		// Add more admin user management routes as needed
	}

	// System management
	system := admin.Group("/system")
	{
		system.GET("/stats", r.systemStats)
		// Add more system management routes as needed
	}
}

// Health check handlers
func (r *Router) healthCheck(c *gin.Context) {
	utils.SuccessResponse(c, gin.H{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"service":   "aynamoda-api",
	})
}

func (r *Router) readinessCheck(c *gin.Context) {
	// TODO: Add database connectivity check
	utils.SuccessResponse(c, gin.H{
		"status":    "ready",
		"timestamp": time.Now().UTC(),
		"service":   "aynamoda-api",
	})
}

func (r *Router) versionInfo(c *gin.Context) {
	utils.SuccessResponse(c, gin.H{
		"version":   "1.0.0",
		"build":     "dev",
		"timestamp": time.Now().UTC(),
		"service":   "aynamoda-api",
	})
}

func (r *Router) systemStats(c *gin.Context) {
	// TODO: Implement system statistics
	utils.SuccessResponse(c, gin.H{
		"message": "System statistics endpoint - to be implemented",
	})
}