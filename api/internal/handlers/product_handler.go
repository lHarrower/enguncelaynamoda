package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"aynamoda/internal/service"
	"aynamoda/internal/utils"
)

// ProductHandler handles product-related HTTP requests
type ProductHandler struct {
	productService *service.ProductService
}

// NewProductHandler creates a new product handler
func NewProductHandler(productService *service.ProductService) *ProductHandler {
	return &ProductHandler{
		productService: productService,
	}
}

// CreateProduct handles product creation
// @Summary Create a new product
// @Description Create a new product for the authenticated user
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreateProductRequest true "Create product request"
// @Success 201 {object} service.ProductResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/products [post]
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	var req service.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	product, err := h.productService.CreateProduct(uid, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create product", err)
		return
	}

	c.JSON(http.StatusCreated, product)
}

// GetProduct handles getting a single product
// @Summary Get product by ID
// @Description Get a product by its ID
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Success 200 {object} service.ProductResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/products/{id} [get]
func (h *ProductHandler) GetProduct(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid product ID", err)
		return
	}

	product, err := h.productService.GetProduct(uid, productID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Product not found", err)
		return
	}

	c.JSON(http.StatusOK, product)
}

// GetUserProducts handles getting user's products
// @Summary Get user's products
// @Description Get paginated list of user's products
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param category_id query string false "Filter by category ID"
// @Param color query string false "Filter by color"
// @Param brand query string false "Filter by brand"
// @Param favorites query bool false "Show only favorites"
// @Success 200 {object} service.ProductListResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/products [get]
func (h *ProductHandler) GetUserProducts(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Build filters
	filters := &service.ProductFilters{
		Page:  page,
		Limit: limit,
	}

	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		if categoryID, err := uuid.Parse(categoryIDStr); err == nil {
			filters.CategoryID = &categoryID
		}
	}

	if color := c.Query("color"); color != "" {
		filters.Color = &color
	}

	if brand := c.Query("brand"); brand != "" {
		filters.Brand = &brand
	}

	if favoritesStr := c.Query("favorites"); favoritesStr == "true" {
		favorites := true
		filters.Favorites = &favorites
	}

	products, err := h.productService.GetUserProducts(uid, filters)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get products", err)
		return
	}

	c.JSON(http.StatusOK, products)
}

// UpdateProduct handles product updates
// @Summary Update product
// @Description Update a product by its ID
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param request body service.UpdateProductRequest true "Update product request"
// @Success 200 {object} service.ProductResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid product ID", err)
		return
	}

	var req service.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	product, err := h.productService.UpdateProduct(uid, productID, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update product", err)
		return
	}

	c.JSON(http.StatusOK, product)
}

// DeleteProduct handles product deletion
// @Summary Delete product
// @Description Delete a product by its ID
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/products/{id} [delete]
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid product ID", err)
		return
	}

	if err := h.productService.DeleteProduct(uid, productID); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to delete product", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product deleted successfully", nil)
}

// SearchProducts handles product search
// @Summary Search products
// @Description Search products with various filters
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param q query string false "Search query"
// @Param category_id query string false "Filter by category ID"
// @Param color query string false "Filter by color"
// @Param brand query string false "Filter by brand"
// @Param min_price query number false "Minimum price"
// @Param max_price query number false "Maximum price"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} service.ProductListResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/products/search [get]
func (h *ProductHandler) SearchProducts(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Build search request
	req := &service.SearchProductsRequest{
		Query: c.Query("q"),
		Page:  page,
		Limit: limit,
	}

	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		if categoryID, err := uuid.Parse(categoryIDStr); err == nil {
			req.CategoryID = &categoryID
		}
	}

	if color := c.Query("color"); color != "" {
		req.Color = &color
	}

	if brand := c.Query("brand"); brand != "" {
		req.Brand = &brand
	}

	if minPriceStr := c.Query("min_price"); minPriceStr != "" {
		if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
			req.MinPrice = &minPrice
		}
	}

	if maxPriceStr := c.Query("max_price"); maxPriceStr != "" {
		if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
			req.MaxPrice = &maxPrice
		}
	}

	products, err := h.productService.SearchProducts(uid, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to search products", err)
		return
	}

	c.JSON(http.StatusOK, products)
}

// GetFavoriteProducts handles getting user's favorite products
// @Summary Get favorite products
// @Description Get user's favorite products
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} service.ProductListResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/products/favorites [get]
func (h *ProductHandler) GetFavoriteProducts(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	products, err := h.productService.GetFavoriteProducts(uid, page, limit)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get favorite products", err)
		return
	}

	c.JSON(http.StatusOK, products)
}

// ToggleFavorite handles toggling product favorite status
// @Summary Toggle product favorite
// @Description Toggle favorite status of a product
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/products/{id}/favorite [post]
func (h *ProductHandler) ToggleFavorite(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid product ID", err)
		return
	}

	if err := h.productService.ToggleFavorite(uid, productID); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to toggle favorite", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Favorite status updated", nil)
}

// AddProductImage handles adding an image to a product
// @Summary Add product image
// @Description Add an image to a product
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param request body service.AddProductImageRequest true "Add image request"
// @Success 201 {object} service.ProductImageResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/products/{id}/images [post]
func (h *ProductHandler) AddProductImage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid product ID", err)
		return
	}

	var req service.AddProductImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	image, err := h.productService.AddProductImage(uid, productID, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to add image", err)
		return
	}

	c.JSON(http.StatusCreated, image)
}

// DeleteProductImage handles deleting a product image
// @Summary Delete product image
// @Description Delete an image from a product
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param image_id path string true "Image ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/products/{id}/images/{image_id} [delete]
func (h *ProductHandler) DeleteProductImage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid product ID", err)
		return
	}

	imageIDStr := c.Param("image_id")
	imageID, err := uuid.Parse(imageIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid image ID", err)
		return
	}

	if err := h.productService.DeleteProductImage(uid, productID, imageID); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to delete image", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Image deleted successfully", nil)
}

// SetPrimaryImage handles setting a product's primary image
// @Summary Set primary product image
// @Description Set an image as the primary image for a product
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param image_id path string true "Image ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/products/{id}/images/{image_id}/primary [post]
func (h *ProductHandler) SetPrimaryImage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid product ID", err)
		return
	}

	imageIDStr := c.Param("image_id")
	imageID, err := uuid.Parse(imageIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid image ID", err)
		return
	}

	if err := h.productService.SetPrimaryImage(uid, productID, imageID); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to set primary image", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Primary image set successfully", nil)
}

// UpdateWearCount handles updating product wear count
// @Summary Update product wear count
// @Description Increment the wear count of a product
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/products/{id}/wear [post]
func (h *ProductHandler) UpdateWearCount(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID", nil)
		return
	}

	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid product ID", err)
		return
	}

	if err := h.productService.UpdateWearCount(uid, productID); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update wear count", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Wear count updated successfully", nil)
}