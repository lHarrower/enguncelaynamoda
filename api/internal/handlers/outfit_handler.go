package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"aynamoda/internal/service"
	"aynamoda/internal/utils"
)

// OutfitHandler handles outfit-related HTTP requests
type OutfitHandler struct {
	outfitService *service.OutfitService
}

// NewOutfitHandler creates a new outfit handler
func NewOutfitHandler(outfitService *service.OutfitService) *OutfitHandler {
	return &OutfitHandler{
		outfitService: outfitService,
	}
}

// CreateOutfit handles outfit creation
// @Summary Create a new outfit
// @Description Create a new outfit for the authenticated user
// @Tags outfits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreateOutfitRequest true "Create outfit request"
// @Success 201 {object} service.OutfitResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/outfits [post]
func (h *OutfitHandler) CreateOutfit(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	var req service.CreateOutfitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	req.UserID = userID.(uuid.UUID)

	outfit, err := h.outfitService.CreateOutfit(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create outfit", err)
		return
	}

	c.JSON(http.StatusCreated, outfit)
}

// GetOutfit handles getting a single outfit
// @Summary Get outfit by ID
// @Description Get an outfit by its ID
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param id path string true "Outfit ID"
// @Success 200 {object} service.OutfitResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/outfits/{id} [get]
func (h *OutfitHandler) GetOutfit(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	outfitIDStr := c.Param("id")
	outfitID, err := uuid.Parse(outfitIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid outfit ID", err)
		return
	}

	outfit, err := h.outfitService.GetOutfit(outfitID, userID.(uuid.UUID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Outfit not found", err)
		return
	}

	c.JSON(http.StatusOK, outfit)
}

// GetUserOutfits handles getting user's outfits
// @Summary Get user's outfits
// @Description Get all outfits for the authenticated user with pagination
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} service.OutfitListResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/outfits/my [get]
func (h *OutfitHandler) GetUserOutfits(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	req := &service.GetUserOutfitsRequest{
		UserID: userID.(uuid.UUID),
		Page:   page,
		Limit:  limit,
	}

	result, err := h.outfitService.GetUserOutfits(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get outfits", err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetPublicOutfits handles getting public outfits
// @Summary Get public outfits
// @Description Get all public outfits with pagination
// @Tags outfits
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} service.OutfitListResponse
// @Failure 400 {object} utils.ErrorResponse
// @Router /api/v1/outfits/public [get]
func (h *OutfitHandler) GetPublicOutfits(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	req := &service.GetPublicOutfitsRequest{
		Page:  page,
		Limit: limit,
	}

	result, err := h.outfitService.GetPublicOutfits(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get public outfits", err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetFavoriteOutfits handles getting user's favorite outfits
// @Summary Get favorite outfits
// @Description Get user's favorite outfits with pagination
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} service.OutfitListResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/outfits/favorites [get]
func (h *OutfitHandler) GetFavoriteOutfits(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	req := &service.GetFavoriteOutfitsRequest{
		UserID: userID.(uuid.UUID),
		Page:   page,
		Limit:  limit,
	}

	result, err := h.outfitService.GetFavoriteOutfits(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get favorite outfits", err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// UpdateOutfit handles outfit updates
// @Summary Update outfit
// @Description Update an outfit by its ID
// @Tags outfits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Outfit ID"
// @Param request body service.UpdateOutfitRequest true "Update outfit request"
// @Success 200 {object} service.OutfitResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/outfits/{id} [put]
func (h *OutfitHandler) UpdateOutfit(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	outfitIDStr := c.Param("id")
	outfitID, err := uuid.Parse(outfitIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid outfit ID", err)
		return
	}

	var req service.UpdateOutfitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	outfit, err := h.outfitService.UpdateOutfit(outfitID, userID.(uuid.UUID), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update outfit", err)
		return
	}

	c.JSON(http.StatusOK, outfit)
}

// DeleteOutfit handles outfit deletion
// @Summary Delete outfit
// @Description Delete an outfit by its ID
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param id path string true "Outfit ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/outfits/{id} [delete]
func (h *OutfitHandler) DeleteOutfit(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	outfitIDStr := c.Param("id")
	outfitID, err := uuid.Parse(outfitIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid outfit ID", err)
		return
	}

	if err := h.outfitService.DeleteOutfit(outfitID, userID.(uuid.UUID)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to delete outfit", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Outfit deleted successfully", nil)
}

// AddProductToOutfit handles adding a product to an outfit
// @Summary Add product to outfit
// @Description Add a product to an existing outfit
// @Tags outfits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Outfit ID"
// @Param request body service.AddProductToOutfitRequest true "Add product request"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/outfits/{id}/products [post]
func (h *OutfitHandler) AddProductToOutfit(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	outfitIDStr := c.Param("id")
	outfitID, err := uuid.Parse(outfitIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid outfit ID", err)
		return
	}

	var req service.AddProductToOutfitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	req.OutfitID = outfitID
	req.UserID = userID.(uuid.UUID)

	if err := h.outfitService.AddProductToOutfit(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to add product to outfit", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product added to outfit successfully", nil)
}

// RemoveProductFromOutfit handles removing a product from an outfit
// @Summary Remove product from outfit
// @Description Remove a product from an existing outfit
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param id path string true "Outfit ID"
// @Param productId path string true "Product ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/outfits/{id}/products/{productId} [delete]
func (h *OutfitHandler) RemoveProductFromOutfit(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	outfitIDStr := c.Param("id")
	outfitID, err := uuid.Parse(outfitIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid outfit ID", err)
		return
	}

	productIDStr := c.Param("productId")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid product ID", err)
		return
	}

	req := &service.RemoveProductFromOutfitRequest{
		OutfitID:  outfitID,
		ProductID: productID,
		UserID:    userID.(uuid.UUID),
	}

	if err := h.outfitService.RemoveProductFromOutfit(req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to remove product from outfit", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product removed from outfit successfully", nil)
}

// SearchOutfits handles outfit search
// @Summary Search outfits
// @Description Search outfits by name, tags, occasion, or season
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param q query string false "Search query (name or tags)"
// @Param occasion query string false "Filter by occasion"
// @Param season query string false "Filter by season"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} service.OutfitListResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/outfits/search [get]
func (h *OutfitHandler) SearchOutfits(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	query := c.Query("q")
	occasion := c.Query("occasion")
	season := c.Query("season")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	req := &service.SearchOutfitsRequest{
		UserID:   userID.(uuid.UUID),
		Query:    query,
		Occasion: occasion,
		Season:   season,
		Page:     page,
		Limit:    limit,
	}

	result, err := h.outfitService.SearchOutfits(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to search outfits", err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// ToggleFavoriteOutfit handles toggling outfit favorite status
// @Summary Toggle outfit favorite
// @Description Toggle the favorite status of an outfit
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param id path string true "Outfit ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/outfits/{id}/favorite [post]
func (h *OutfitHandler) ToggleFavoriteOutfit(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	outfitIDStr := c.Param("id")
	outfitID, err := uuid.Parse(outfitIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid outfit ID", err)
		return
	}

	isFavorite, err := h.outfitService.ToggleFavoriteOutfit(outfitID, userID.(uuid.UUID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to toggle favorite status", err)
		return
	}

	message := "Outfit removed from favorites"
	if isFavorite {
		message = "Outfit added to favorites"
	}

	utils.SuccessResponse(c, http.StatusOK, message, gin.H{"is_favorite": isFavorite})
}

// UpdateWearCount handles updating outfit wear count
// @Summary Update outfit wear count
// @Description Update the wear count of an outfit (when user wears it)
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param id path string true "Outfit ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/outfits/{id}/wear [post]
func (h *OutfitHandler) UpdateWearCount(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	outfitIDStr := c.Param("id")
	outfitID, err := uuid.Parse(outfitIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid outfit ID", err)
		return
	}

	if err := h.outfitService.UpdateWearCount(outfitID, userID.(uuid.UUID)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update wear count", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Wear count updated successfully", nil)
}

// GetOutfitStats handles getting outfit statistics
// @Summary Get outfit statistics
// @Description Get statistics for user's outfits
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Success 200 {object} service.OutfitStatsResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/outfits/stats [get]
func (h *OutfitHandler) GetOutfitStats(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	stats, err := h.outfitService.GetOutfitStats(userID.(uuid.UUID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get outfit statistics", err)
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetRecentlyWornOutfits handles getting recently worn outfits
// @Summary Get recently worn outfits
// @Description Get user's recently worn outfits
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Number of outfits to return" default(10)
// @Success 200 {array} service.OutfitResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/outfits/recently-worn [get]
func (h *OutfitHandler) GetRecentlyWornOutfits(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	outfits, err := h.outfitService.GetRecentlyWornOutfits(userID.(uuid.UUID), limit)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get recently worn outfits", err)
		return
	}

	c.JSON(http.StatusOK, outfits)
}

// GetMostWornOutfits handles getting most worn outfits
// @Summary Get most worn outfits
// @Description Get user's most worn outfits
// @Tags outfits
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Number of outfits to return" default(10)
// @Success 200 {array} service.OutfitResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/outfits/most-worn [get]
func (h *OutfitHandler) GetMostWornOutfits(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	outfits, err := h.outfitService.GetMostWornOutfits(userID.(uuid.UUID), limit)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get most worn outfits", err)
		return
	}

	c.JSON(http.StatusOK, outfits)
}