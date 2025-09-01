package repository

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"aynamoda/internal/models"
)

// OutfitRepository handles outfit-related database operations
type OutfitRepository struct {
	db *gorm.DB
}

// NewOutfitRepository creates a new outfit repository
func NewOutfitRepository(db *gorm.DB) *OutfitRepository {
	return &OutfitRepository{db: db}
}

// Create creates a new outfit
func (r *OutfitRepository) Create(outfit *models.Outfit) error {
	if err := r.db.Create(outfit).Error; err != nil {
		return fmt.Errorf("failed to create outfit: %w", err)
	}
	return nil
}

// GetByID retrieves an outfit by ID
func (r *OutfitRepository) GetByID(id uuid.UUID) (*models.Outfit, error) {
	var outfit models.Outfit
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").First(&outfit, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("outfit not found")
		}
		return nil, fmt.Errorf("failed to get outfit: %w", err)
	}
	return &outfit, nil
}

// GetByUserID retrieves outfits by user ID with pagination
func (r *OutfitRepository) GetByUserID(userID uuid.UUID, limit, offset int) ([]models.Outfit, int64, error) {
	var outfits []models.Outfit
	var total int64

	// Count total records
	if err := r.db.Model(&models.Outfit{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count outfits: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").Where("user_id = ?", userID).Order("created_at DESC").Limit(limit).Offset(offset).Find(&outfits).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list outfits: %w", err)
	}

	return outfits, total, nil
}

// Update updates an outfit
func (r *OutfitRepository) Update(outfit *models.Outfit) error {
	if err := r.db.Save(outfit).Error; err != nil {
		return fmt.Errorf("failed to update outfit: %w", err)
	}
	return nil
}

// Delete soft deletes an outfit
func (r *OutfitRepository) Delete(id uuid.UUID) error {
	if err := r.db.Delete(&models.Outfit{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete outfit: %w", err)
	}
	return nil
}

// AddProduct adds a product to an outfit
func (r *OutfitRepository) AddProduct(outfitID, productID uuid.UUID) error {
	// Check if the association already exists
	var count int64
	if err := r.db.Model(&models.OutfitProduct{}).Where("outfit_id = ? AND product_id = ?", outfitID, productID).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to check existing association: %w", err)
	}

	if count > 0 {
		return fmt.Errorf("product already exists in outfit")
	}

	// Create the association
	outfitProduct := models.OutfitProduct{
		OutfitID:  outfitID,
		ProductID: productID,
	}

	if err := r.db.Create(&outfitProduct).Error; err != nil {
		return fmt.Errorf("failed to add product to outfit: %w", err)
	}

	return nil
}

// RemoveProduct removes a product from an outfit
func (r *OutfitRepository) RemoveProduct(outfitID, productID uuid.UUID) error {
	if err := r.db.Where("outfit_id = ? AND product_id = ?", outfitID, productID).Delete(&models.OutfitProduct{}).Error; err != nil {
		return fmt.Errorf("failed to remove product from outfit: %w", err)
	}
	return nil
}

// GetFavorites retrieves user's favorite outfits
func (r *OutfitRepository) GetFavorites(userID uuid.UUID, limit, offset int) ([]models.Outfit, int64, error) {
	var outfits []models.Outfit
	var total int64

	// Count total records
	if err := r.db.Model(&models.Outfit{}).Where("user_id = ? AND is_favorite = true", userID).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count favorite outfits: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").Where("user_id = ? AND is_favorite = true", userID).Order("created_at DESC").Limit(limit).Offset(offset).Find(&outfits).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list favorite outfits: %w", err)
	}

	return outfits, total, nil
}

// GetByOccasion retrieves outfits by occasion
func (r *OutfitRepository) GetByOccasion(userID uuid.UUID, occasion string, limit, offset int) ([]models.Outfit, int64, error) {
	var outfits []models.Outfit
	var total int64

	// Count total records
	if err := r.db.Model(&models.Outfit{}).Where("user_id = ? AND occasion = ?", userID, occasion).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count outfits by occasion: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").Where("user_id = ? AND occasion = ?", userID, occasion).Order("created_at DESC").Limit(limit).Offset(offset).Find(&outfits).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list outfits by occasion: %w", err)
	}

	return outfits, total, nil
}

// GetBySeason retrieves outfits by season
func (r *OutfitRepository) GetBySeason(userID uuid.UUID, season string, limit, offset int) ([]models.Outfit, int64, error) {
	var outfits []models.Outfit
	var total int64

	// Count total records
	if err := r.db.Model(&models.Outfit{}).Where("user_id = ? AND season = ?", userID, season).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count outfits by season: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").Where("user_id = ? AND season = ?", userID, season).Order("created_at DESC").Limit(limit).Offset(offset).Find(&outfits).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list outfits by season: %w", err)
	}

	return outfits, total, nil
}

// Search searches outfits by name or tags
func (r *OutfitRepository) Search(userID uuid.UUID, query string, limit, offset int) ([]models.Outfit, int64, error) {
	var outfits []models.Outfit
	var total int64

	searchQuery := fmt.Sprintf("%%%s%%", query)
	condition := "user_id = ? AND (name ILIKE ? OR description ILIKE ? OR ? = ANY(tags))"

	// Count total records
	if err := r.db.Model(&models.Outfit{}).Where(condition, userID, searchQuery, searchQuery, query).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count search results: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").Where(condition, userID, searchQuery, searchQuery, query).Order("created_at DESC").Limit(limit).Offset(offset).Find(&outfits).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to search outfits: %w", err)
	}

	return outfits, total, nil
}

// UpdateWearCount increments the wear count for an outfit
func (r *OutfitRepository) UpdateWearCount(id uuid.UUID) error {
	if err := r.db.Model(&models.Outfit{}).Where("id = ?", id).Updates(map[string]interface{}{
		"wear_count":   gorm.Expr("wear_count + 1"),
		"last_worn_at": "NOW()",
	}).Error; err != nil {
		return fmt.Errorf("failed to update wear count: %w", err)
	}
	return nil
}

// ToggleFavorite toggles the favorite status of an outfit
func (r *OutfitRepository) ToggleFavorite(id uuid.UUID) error {
	if err := r.db.Model(&models.Outfit{}).Where("id = ?", id).Update("is_favorite", gorm.Expr("NOT is_favorite")).Error; err != nil {
		return fmt.Errorf("failed to toggle favorite: %w", err)
	}
	return nil
}

// GetPublicOutfits retrieves public outfits (for inspiration)
func (r *OutfitRepository) GetPublicOutfits(limit, offset int) ([]models.Outfit, int64, error) {
	var outfits []models.Outfit
	var total int64

	// Count total records
	if err := r.db.Model(&models.Outfit{}).Where("is_public = true").Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count public outfits: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").Where("is_public = true").Order("created_at DESC").Limit(limit).Offset(offset).Find(&outfits).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list public outfits: %w", err)
	}

	return outfits, total, nil
}

// GetOutfitsByRating retrieves outfits by minimum rating
func (r *OutfitRepository) GetOutfitsByRating(userID uuid.UUID, minRating int, limit, offset int) ([]models.Outfit, int64, error) {
	var outfits []models.Outfit
	var total int64

	// Count total records
	if err := r.db.Model(&models.Outfit{}).Where("user_id = ? AND rating >= ?", userID, minRating).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count outfits by rating: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").Where("user_id = ? AND rating >= ?", userID, minRating).Order("rating DESC, created_at DESC").Limit(limit).Offset(offset).Find(&outfits).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list outfits by rating: %w", err)
	}

	return outfits, total, nil
}

// GetRecentlyWorn retrieves recently worn outfits
func (r *OutfitRepository) GetRecentlyWorn(userID uuid.UUID, limit int) ([]models.Outfit, error) {
	var outfits []models.Outfit
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").Where("user_id = ? AND last_worn_at IS NOT NULL", userID).Order("last_worn_at DESC").Limit(limit).Find(&outfits).Error; err != nil {
		return nil, fmt.Errorf("failed to get recently worn outfits: %w", err)
	}
	return outfits, nil
}

// GetMostWorn retrieves most worn outfits
func (r *OutfitRepository) GetMostWorn(userID uuid.UUID, limit int) ([]models.Outfit, error) {
	var outfits []models.Outfit
	if err := r.db.Preload("Products").Preload("Products.Category").Preload("Products.Images").Where("user_id = ? AND wear_count > 0", userID).Order("wear_count DESC, created_at DESC").Limit(limit).Find(&outfits).Error; err != nil {
		return nil, fmt.Errorf("failed to get most worn outfits: %w", err)
	}
	return outfits, nil
}

// GetOutfitStats retrieves outfit statistics for a user
func (r *OutfitRepository) GetOutfitStats(userID uuid.UUID) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total outfits
	var totalOutfits int64
	if err := r.db.Model(&models.Outfit{}).Where("user_id = ?", userID).Count(&totalOutfits).Error; err != nil {
		return nil, fmt.Errorf("failed to count total outfits: %w", err)
	}
	stats["total_outfits"] = totalOutfits

	// Favorite outfits
	var favoriteOutfits int64
	if err := r.db.Model(&models.Outfit{}).Where("user_id = ? AND is_favorite = true", userID).Count(&favoriteOutfits).Error; err != nil {
		return nil, fmt.Errorf("failed to count favorite outfits: %w", err)
	}
	stats["favorite_outfits"] = favoriteOutfits

	// Total wear count
	var totalWearCount int64
	if err := r.db.Model(&models.Outfit{}).Where("user_id = ?", userID).Select("COALESCE(SUM(wear_count), 0)").Scan(&totalWearCount).Error; err != nil {
		return nil, fmt.Errorf("failed to calculate total wear count: %w", err)
	}
	stats["total_wear_count"] = totalWearCount

	// Average rating
	var avgRating float64
	if err := r.db.Model(&models.Outfit{}).Where("user_id = ? AND rating IS NOT NULL", userID).Select("COALESCE(AVG(rating), 0)").Scan(&avgRating).Error; err != nil {
		return nil, fmt.Errorf("failed to calculate average rating: %w", err)
	}
	stats["average_rating"] = avgRating

	return stats, nil
}