package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"aynamoda/internal/models"
	"aynamoda/internal/repository"
)

// OutfitService handles outfit-related business logic
type OutfitService struct {
	outfitRepo  *repository.OutfitRepository
	productRepo *repository.ProductRepository
}

// NewOutfitService creates a new outfit service
func NewOutfitService(outfitRepo *repository.OutfitRepository, productRepo *repository.ProductRepository) *OutfitService {
	return &OutfitService{
		outfitRepo:  outfitRepo,
		productRepo: productRepo,
	}
}

// CreateOutfitRequest represents outfit creation request
type CreateOutfitRequest struct {
	Name        string      `json:"name" binding:"required"`
	Description *string     `json:"description,omitempty"`
	Occasion    string      `json:"occasion" binding:"required"`
	Season      string      `json:"season" binding:"required"`
	Tags        []string    `json:"tags,omitempty"`
	ProductIDs  []uuid.UUID `json:"product_ids" binding:"required,min=1"`
	IsPublic    *bool       `json:"is_public,omitempty"`
}

// UpdateOutfitRequest represents outfit update request
type UpdateOutfitRequest struct {
	Name        *string  `json:"name,omitempty"`
	Description *string  `json:"description,omitempty"`
	Occasion    *string  `json:"occasion,omitempty"`
	Season      *string  `json:"season,omitempty"`
	Tags        []string `json:"tags,omitempty"`
	IsPublic    *bool    `json:"is_public,omitempty"`
	Rating      *int     `json:"rating,omitempty"`
}

// OutfitResponse represents outfit data in responses
type OutfitResponse struct {
	ID          uuid.UUID         `json:"id"`
	UserID      uuid.UUID         `json:"user_id"`
	Name        string            `json:"name"`
	Description *string           `json:"description,omitempty"`
	Occasion    string            `json:"occasion"`
	Season      string            `json:"season"`
	Tags        []string          `json:"tags"`
	Products    []ProductResponse `json:"products"`
	WearCount   int               `json:"wear_count"`
	LastWornAt  *time.Time        `json:"last_worn_at,omitempty"`
	Rating      *int              `json:"rating,omitempty"`
	IsFavorite  bool              `json:"is_favorite"`
	IsPublic    bool              `json:"is_public"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

// OutfitListResponse represents paginated outfit list
type OutfitListResponse struct {
	Outfits []OutfitResponse `json:"outfits"`
	Total   int64            `json:"total"`
	Page    int              `json:"page"`
	Limit   int              `json:"limit"`
	Pages   int              `json:"pages"`
}

// SearchOutfitsRequest represents outfit search request
type SearchOutfitsRequest struct {
	Query     string   `json:"query,omitempty"`
	Occasion  string   `json:"occasion,omitempty"`
	Season    string   `json:"season,omitempty"`
	Tags      []string `json:"tags,omitempty"`
	MinRating *int     `json:"min_rating,omitempty"`
	Page      int      `json:"page,omitempty"`
	Limit     int      `json:"limit,omitempty"`
}

// OutfitStatsResponse represents outfit statistics
type OutfitStatsResponse struct {
	TotalOutfits     int64   `json:"total_outfits"`
	FavoriteOutfits  int64   `json:"favorite_outfits"`
	TotalWearCount   int64   `json:"total_wear_count"`
	AverageRating    float64 `json:"average_rating"`
	MostWornOutfit   *OutfitResponse `json:"most_worn_outfit,omitempty"`
	RecentlyCreated  []OutfitResponse `json:"recently_created"`
	TopRatedOutfits  []OutfitResponse `json:"top_rated_outfits"`
}

// CreateOutfit creates a new outfit
func (s *OutfitService) CreateOutfit(userID uuid.UUID, req *CreateOutfitRequest) (*OutfitResponse, error) {
	// Validate that all products exist and belong to the user
	for _, productID := range req.ProductIDs {
		product, err := s.productRepo.GetByID(productID)
		if err != nil {
			return nil, fmt.Errorf("product %s not found", productID)
		}
		if product.UserID != userID {
			return nil, fmt.Errorf("product %s does not belong to user", productID)
		}
	}

	// Create outfit
	outfit := &models.Outfit{
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		Occasion:    req.Occasion,
		Season:      req.Season,
		Tags:        req.Tags,
		IsPublic:    req.IsPublic != nil && *req.IsPublic,
	}

	if err := s.outfitRepo.Create(outfit); err != nil {
		return nil, fmt.Errorf("failed to create outfit: %w", err)
	}

	// Add products to outfit
	for _, productID := range req.ProductIDs {
		if err := s.outfitRepo.AddProduct(outfit.ID, productID); err != nil {
			// Log error but continue with other products
			fmt.Printf("Failed to add product %s to outfit: %v\n", productID, err)
		}
	}

	// Get complete outfit with products
	completeOutfit, err := s.outfitRepo.GetByID(outfit.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get created outfit: %w", err)
	}

	return s.toOutfitResponse(completeOutfit), nil
}

// GetOutfit retrieves an outfit by ID
func (s *OutfitService) GetOutfit(userID, outfitID uuid.UUID) (*OutfitResponse, error) {
	outfit, err := s.outfitRepo.GetByID(outfitID)
	if err != nil {
		return nil, fmt.Errorf("outfit not found: %w", err)
	}

	// Check if user owns the outfit or if it's public
	if outfit.UserID != userID && !outfit.IsPublic {
		return nil, errors.New("access denied")
	}

	return s.toOutfitResponse(outfit), nil
}

// GetUserOutfits retrieves user's outfits with pagination
func (s *OutfitService) GetUserOutfits(userID uuid.UUID, page, limit int) (*OutfitListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	outfits, total, err := s.outfitRepo.GetByUserID(userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get user outfits: %w", err)
	}

	// Convert to response format
	outfitResponses := make([]OutfitResponse, len(outfits))
	for i, outfit := range outfits {
		outfitResponses[i] = *s.toOutfitResponse(&outfit)
	}

	pages := int((total + int64(limit) - 1) / int64(limit))

	return &OutfitListResponse{
		Outfits: outfitResponses,
		Total:   total,
		Page:    page,
		Limit:   limit,
		Pages:   pages,
	}, nil
}

// UpdateOutfit updates an outfit
func (s *OutfitService) UpdateOutfit(userID, outfitID uuid.UUID, req *UpdateOutfitRequest) (*OutfitResponse, error) {
	outfit, err := s.outfitRepo.GetByID(outfitID)
	if err != nil {
		return nil, fmt.Errorf("outfit not found: %w", err)
	}

	// Check if user owns the outfit
	if outfit.UserID != userID {
		return nil, errors.New("access denied")
	}

	// Update fields if provided
	if req.Name != nil {
		outfit.Name = *req.Name
	}
	if req.Description != nil {
		outfit.Description = req.Description
	}
	if req.Occasion != nil {
		outfit.Occasion = *req.Occasion
	}
	if req.Season != nil {
		outfit.Season = *req.Season
	}
	if req.Tags != nil {
		outfit.Tags = req.Tags
	}
	if req.IsPublic != nil {
		outfit.IsPublic = *req.IsPublic
	}
	if req.Rating != nil {
		// Validate rating range (1-5)
		if *req.Rating < 1 || *req.Rating > 5 {
			return nil, errors.New("rating must be between 1 and 5")
		}
		outfit.Rating = req.Rating
	}

	if err := s.outfitRepo.Update(outfit); err != nil {
		return nil, fmt.Errorf("failed to update outfit: %w", err)
	}

	// Get updated outfit
	updatedOutfit, err := s.outfitRepo.GetByID(outfitID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated outfit: %w", err)
	}

	return s.toOutfitResponse(updatedOutfit), nil
}

// DeleteOutfit deletes an outfit
func (s *OutfitService) DeleteOutfit(userID, outfitID uuid.UUID) error {
	outfit, err := s.outfitRepo.GetByID(outfitID)
	if err != nil {
		return fmt.Errorf("outfit not found: %w", err)
	}

	// Check if user owns the outfit
	if outfit.UserID != userID {
		return errors.New("access denied")
	}

	if err := s.outfitRepo.Delete(outfitID); err != nil {
		return fmt.Errorf("failed to delete outfit: %w", err)
	}

	return nil
}

// AddProductToOutfit adds a product to an outfit
func (s *OutfitService) AddProductToOutfit(userID, outfitID, productID uuid.UUID) error {
	// Verify outfit ownership
	outfit, err := s.outfitRepo.GetByID(outfitID)
	if err != nil {
		return fmt.Errorf("outfit not found: %w", err)
	}
	if outfit.UserID != userID {
		return errors.New("access denied")
	}

	// Verify product ownership
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return fmt.Errorf("product not found: %w", err)
	}
	if product.UserID != userID {
		return errors.New("product does not belong to user")
	}

	if err := s.outfitRepo.AddProduct(outfitID, productID); err != nil {
		return fmt.Errorf("failed to add product to outfit: %w", err)
	}

	return nil
}

// RemoveProductFromOutfit removes a product from an outfit
func (s *OutfitService) RemoveProductFromOutfit(userID, outfitID, productID uuid.UUID) error {
	// Verify outfit ownership
	outfit, err := s.outfitRepo.GetByID(outfitID)
	if err != nil {
		return fmt.Errorf("outfit not found: %w", err)
	}
	if outfit.UserID != userID {
		return errors.New("access denied")
	}

	if err := s.outfitRepo.RemoveProduct(outfitID, productID); err != nil {
		return fmt.Errorf("failed to remove product from outfit: %w", err)
	}

	return nil
}

// SearchOutfits searches outfits with filters
func (s *OutfitService) SearchOutfits(userID uuid.UUID, req *SearchOutfitsRequest) (*OutfitListResponse, error) {
	if req.Page < 1 {
		req.Page = 1
	}
	if req.Limit < 1 || req.Limit > 100 {
		req.Limit = 20
	}

	offset := (req.Page - 1) * req.Limit

	var outfits []models.Outfit
	var total int64
	var err error

	// Search based on provided filters
	if req.Query != "" {
		outfits, total, err = s.outfitRepo.Search(userID, req.Query, req.Limit, offset)
	} else if req.Occasion != "" {
		outfits, total, err = s.outfitRepo.GetByOccasion(userID, req.Occasion, req.Limit, offset)
	} else if req.Season != "" {
		outfits, total, err = s.outfitRepo.GetBySeason(userID, req.Season, req.Limit, offset)
	} else if req.MinRating != nil {
		outfits, total, err = s.outfitRepo.GetOutfitsByRating(userID, *req.MinRating, req.Limit, offset)
	} else {
		// Default to user's outfits
		outfits, total, err = s.outfitRepo.GetByUserID(userID, req.Limit, offset)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to search outfits: %w", err)
	}

	// Convert to response format
	outfitResponses := make([]OutfitResponse, len(outfits))
	for i, outfit := range outfits {
		outfitResponses[i] = *s.toOutfitResponse(&outfit)
	}

	pages := int((total + int64(req.Limit) - 1) / int64(req.Limit))

	return &OutfitListResponse{
		Outfits: outfitResponses,
		Total:   total,
		Page:    req.Page,
		Limit:   req.Limit,
		Pages:   pages,
	}, nil
}

// GetFavoriteOutfits retrieves user's favorite outfits
func (s *OutfitService) GetFavoriteOutfits(userID uuid.UUID, page, limit int) (*OutfitListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	outfits, total, err := s.outfitRepo.GetFavorites(userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get favorite outfits: %w", err)
	}

	// Convert to response format
	outfitResponses := make([]OutfitResponse, len(outfits))
	for i, outfit := range outfits {
		outfitResponses[i] = *s.toOutfitResponse(&outfit)
	}

	pages := int((total + int64(limit) - 1) / int64(limit))

	return &OutfitListResponse{
		Outfits: outfitResponses,
		Total:   total,
		Page:    page,
		Limit:   limit,
		Pages:   pages,
	}, nil
}

// ToggleFavorite toggles outfit favorite status
func (s *OutfitService) ToggleFavorite(userID, outfitID uuid.UUID) error {
	outfit, err := s.outfitRepo.GetByID(outfitID)
	if err != nil {
		return fmt.Errorf("outfit not found: %w", err)
	}

	// Check if user owns the outfit
	if outfit.UserID != userID {
		return errors.New("access denied")
	}

	if err := s.outfitRepo.ToggleFavorite(outfitID); err != nil {
		return fmt.Errorf("failed to toggle favorite: %w", err)
	}

	return nil
}

// UpdateWearCount increments outfit wear count
func (s *OutfitService) UpdateWearCount(userID, outfitID uuid.UUID) error {
	outfit, err := s.outfitRepo.GetByID(outfitID)
	if err != nil {
		return fmt.Errorf("outfit not found: %w", err)
	}

	// Check if user owns the outfit
	if outfit.UserID != userID {
		return errors.New("access denied")
	}

	if err := s.outfitRepo.UpdateWearCount(outfitID); err != nil {
		return fmt.Errorf("failed to update wear count: %w", err)
	}

	// Also update wear count for all products in the outfit
	for _, product := range outfit.Products {
		if err := s.productRepo.UpdateWearCount(product.ID); err != nil {
			// Log error but don't fail the operation
			fmt.Printf("Failed to update wear count for product %s: %v\n", product.ID, err)
		}
	}

	return nil
}

// GetPublicOutfits retrieves public outfits for inspiration
func (s *OutfitService) GetPublicOutfits(page, limit int) (*OutfitListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	outfits, total, err := s.outfitRepo.GetPublicOutfits(limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get public outfits: %w", err)
	}

	// Convert to response format
	outfitResponses := make([]OutfitResponse, len(outfits))
	for i, outfit := range outfits {
		outfitResponses[i] = *s.toOutfitResponse(&outfit)
	}

	pages := int((total + int64(limit) - 1) / int64(limit))

	return &OutfitListResponse{
		Outfits: outfitResponses,
		Total:   total,
		Page:    page,
		Limit:   limit,
		Pages:   pages,
	}, nil
}

// GetOutfitStats retrieves outfit statistics for a user
func (s *OutfitService) GetOutfitStats(userID uuid.UUID) (*OutfitStatsResponse, error) {
	stats, err := s.outfitRepo.GetOutfitStats(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get outfit stats: %w", err)
	}

	response := &OutfitStatsResponse{
		TotalOutfits:    stats["total_outfits"].(int64),
		FavoriteOutfits: stats["favorite_outfits"].(int64),
		TotalWearCount:  stats["total_wear_count"].(int64),
		AverageRating:   stats["average_rating"].(float64),
	}

	// Get most worn outfit
	mostWorn, err := s.outfitRepo.GetMostWorn(userID, 1)
	if err == nil && len(mostWorn) > 0 {
		response.MostWornOutfit = s.toOutfitResponse(&mostWorn[0])
	}

	// Get recently created outfits
	recentOutfits, _, err := s.outfitRepo.GetByUserID(userID, 5, 0)
	if err == nil {
		response.RecentlyCreated = make([]OutfitResponse, len(recentOutfits))
		for i, outfit := range recentOutfits {
			response.RecentlyCreated[i] = *s.toOutfitResponse(&outfit)
		}
	}

	// Get top rated outfits
	topRated, _, err := s.outfitRepo.GetOutfitsByRating(userID, 4, 5, 0)
	if err == nil {
		response.TopRatedOutfits = make([]OutfitResponse, len(topRated))
		for i, outfit := range topRated {
			response.TopRatedOutfits[i] = *s.toOutfitResponse(&outfit)
		}
	}

	return response, nil
}

// GetRecentlyWornOutfits retrieves recently worn outfits
func (s *OutfitService) GetRecentlyWornOutfits(userID uuid.UUID, limit int) ([]OutfitResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	outfits, err := s.outfitRepo.GetRecentlyWorn(userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get recently worn outfits: %w", err)
	}

	// Convert to response format
	responses := make([]OutfitResponse, len(outfits))
	for i, outfit := range outfits {
		responses[i] = *s.toOutfitResponse(&outfit)
	}

	return responses, nil
}

// GetMostWornOutfits retrieves most worn outfits
func (s *OutfitService) GetMostWornOutfits(userID uuid.UUID, limit int) ([]OutfitResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	outfits, err := s.outfitRepo.GetMostWorn(userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get most worn outfits: %w", err)
	}

	// Convert to response format
	responses := make([]OutfitResponse, len(outfits))
	for i, outfit := range outfits {
		responses[i] = *s.toOutfitResponse(&outfit)
	}

	return responses, nil
}

// toOutfitResponse converts Outfit model to OutfitResponse
func (s *OutfitService) toOutfitResponse(outfit *models.Outfit) *OutfitResponse {
	response := &OutfitResponse{
		ID:          outfit.ID,
		UserID:      outfit.UserID,
		Name:        outfit.Name,
		Description: outfit.Description,
		Occasion:    outfit.Occasion,
		Season:      outfit.Season,
		Tags:        outfit.Tags,
		WearCount:   outfit.WearCount,
		LastWornAt:  outfit.LastWornAt,
		Rating:      outfit.Rating,
		IsFavorite:  outfit.IsFavorite,
		IsPublic:    outfit.IsPublic,
		CreatedAt:   outfit.CreatedAt,
		UpdatedAt:   outfit.UpdatedAt,
	}

	// Convert products
	response.Products = make([]ProductResponse, len(outfit.Products))
	for i, product := range outfit.Products {
		response.Products[i] = ProductResponse{
			ID:          product.ID,
			UserID:      product.UserID,
			Name:        product.Name,
			Brand:       product.Brand,
			Color:       product.Color,
			Size:        product.Size,
			Description: product.Description,
			Price:       product.Price,
			PurchaseURL: product.PurchaseURL,
			Tags:        product.Tags,
			WearCount:   product.WearCount,
			IsFavorite:  product.IsFavorite,
			CreatedAt:   product.CreatedAt,
			UpdatedAt:   product.UpdatedAt,
		}

		// Add category if available
		if product.Category != nil {
			response.Products[i].Category = &CategoryResponse{
				ID:       product.Category.ID,
				Name:     product.Category.Name,
				Slug:     product.Category.Slug,
				ParentID: product.Category.ParentID,
			}
		}

		// Add images
		response.Products[i].Images = make([]ProductImageResponse, len(product.Images))
		for j, img := range product.Images {
			response.Products[i].Images[j] = ProductImageResponse{
				ID:        img.ID,
				URL:       img.URL,
				IsPrimary: img.IsPrimary,
				CreatedAt: img.CreatedAt,
			}
		}
	}

	return response
}