package repository

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"aynamoda/internal/models"
)

// ProductRepository handles product-related database operations
type ProductRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new product repository
func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// Create creates a new product
func (r *ProductRepository) Create(product *models.Product) error {
	if err := r.db.Create(product).Error; err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}
	return nil
}

// GetByID retrieves a product by ID
func (r *ProductRepository) GetByID(id uuid.UUID) (*models.Product, error) {
	var product models.Product
	if err := r.db.Preload("Category").Preload("Images").First(&product, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("product not found")
		}
		return nil, fmt.Errorf("failed to get product: %w", err)
	}
	return &product, nil
}

// GetByUserID retrieves products by user ID with pagination
func (r *ProductRepository) GetByUserID(userID uuid.UUID, limit, offset int) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	// Count total records
	if err := r.db.Model(&models.Product{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count products: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Category").Preload("Images").Where("user_id = ?", userID).Limit(limit).Offset(offset).Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list products: %w", err)
	}

	return products, total, nil
}

// GetByCategoryID retrieves products by category ID with pagination
func (r *ProductRepository) GetByCategoryID(categoryID uuid.UUID, limit, offset int) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	// Count total records
	if err := r.db.Model(&models.Product{}).Where("category_id = ?", categoryID).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count products: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Category").Preload("Images").Where("category_id = ?", categoryID).Limit(limit).Offset(offset).Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list products: %w", err)
	}

	return products, total, nil
}

// Update updates a product
func (r *ProductRepository) Update(product *models.Product) error {
	if err := r.db.Save(product).Error; err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}
	return nil
}

// Delete soft deletes a product
func (r *ProductRepository) Delete(id uuid.UUID) error {
	if err := r.db.Delete(&models.Product{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}
	return nil
}

// Search searches products by name, brand, or tags
func (r *ProductRepository) Search(userID uuid.UUID, query string, limit, offset int) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	searchQuery := fmt.Sprintf("%%%s%%", query)
	condition := "user_id = ? AND (name ILIKE ? OR brand ILIKE ? OR ? = ANY(tags))"

	// Count total records
	if err := r.db.Model(&models.Product{}).Where(condition, userID, searchQuery, searchQuery, query).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count search results: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Category").Preload("Images").Where(condition, userID, searchQuery, searchQuery, query).Limit(limit).Offset(offset).Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to search products: %w", err)
	}

	return products, total, nil
}

// GetFavorites retrieves user's favorite products
func (r *ProductRepository) GetFavorites(userID uuid.UUID, limit, offset int) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	// Count total records
	if err := r.db.Model(&models.Product{}).Where("user_id = ? AND is_favorite = true", userID).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count favorite products: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Category").Preload("Images").Where("user_id = ? AND is_favorite = true", userID).Limit(limit).Offset(offset).Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list favorite products: %w", err)
	}

	return products, total, nil
}

// GetByColor retrieves products by color
func (r *ProductRepository) GetByColor(userID uuid.UUID, color string, limit, offset int) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	// Count total records
	if err := r.db.Model(&models.Product{}).Where("user_id = ? AND color ILIKE ?", userID, fmt.Sprintf("%%%s%%", color)).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count products by color: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("Category").Preload("Images").Where("user_id = ? AND color ILIKE ?", userID, fmt.Sprintf("%%%s%%", color)).Limit(limit).Offset(offset).Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list products by color: %w", err)
	}

	return products, total, nil
}

// UpdateWearCount increments the wear count for a product
func (r *ProductRepository) UpdateWearCount(id uuid.UUID) error {
	if err := r.db.Model(&models.Product{}).Where("id = ?", id).Updates(map[string]interface{}{
		"wear_count":   gorm.Expr("wear_count + 1"),
		"last_worn_at": "NOW()",
	}).Error; err != nil {
		return fmt.Errorf("failed to update wear count: %w", err)
	}
	return nil
}

// ToggleFavorite toggles the favorite status of a product
func (r *ProductRepository) ToggleFavorite(id uuid.UUID) error {
	if err := r.db.Model(&models.Product{}).Where("id = ?", id).Update("is_favorite", gorm.Expr("NOT is_favorite")).Error; err != nil {
		return fmt.Errorf("failed to toggle favorite: %w", err)
	}
	return nil
}

// CreateImage creates a product image
func (r *ProductRepository) CreateImage(image *models.ProductImage) error {
	if err := r.db.Create(image).Error; err != nil {
		return fmt.Errorf("failed to create product image: %w", err)
	}
	return nil
}

// DeleteImage deletes a product image
func (r *ProductRepository) DeleteImage(imageID uuid.UUID) error {
	if err := r.db.Delete(&models.ProductImage{}, "id = ?", imageID).Error; err != nil {
		return fmt.Errorf("failed to delete product image: %w", err)
	}
	return nil
}

// GetImagesByProductID retrieves images for a product
func (r *ProductRepository) GetImagesByProductID(productID uuid.UUID) ([]models.ProductImage, error) {
	var images []models.ProductImage
	if err := r.db.Where("product_id = ?", productID).Order("sort_order ASC, created_at ASC").Find(&images).Error; err != nil {
		return nil, fmt.Errorf("failed to get product images: %w", err)
	}
	return images, nil
}

// SetPrimaryImage sets an image as the primary image for a product
func (r *ProductRepository) SetPrimaryImage(productID, imageID uuid.UUID) error {
	// First, unset all primary images for this product
	if err := r.db.Model(&models.ProductImage{}).Where("product_id = ?", productID).Update("is_primary", false).Error; err != nil {
		return fmt.Errorf("failed to unset primary images: %w", err)
	}

	// Then set the specified image as primary
	if err := r.db.Model(&models.ProductImage{}).Where("id = ? AND product_id = ?", imageID, productID).Update("is_primary", true).Error; err != nil {
		return fmt.Errorf("failed to set primary image: %w", err)
	}

	return nil
}

// GetSimilarProducts retrieves similar products using vector similarity (placeholder for now)
func (r *ProductRepository) GetSimilarProducts(productID uuid.UUID, limit int) ([]models.Product, error) {
	// This is a placeholder implementation
	// In the future, this will use pgvector for similarity search
	var products []models.Product
	
	// For now, return products from the same category
	subquery := r.db.Select("category_id").Where("id = ?", productID).Table("products")
	if err := r.db.Preload("Category").Preload("Images").Where("category_id IN (?) AND id != ?", subquery, productID).Limit(limit).Find(&products).Error; err != nil {
		return nil, fmt.Errorf("failed to get similar products: %w", err)
	}

	return products, nil
}