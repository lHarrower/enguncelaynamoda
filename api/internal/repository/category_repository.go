package repository

import (
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"aynamoda/internal/models"
)

// CategoryRepository handles category-related database operations
type CategoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository creates a new category repository
func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// Create creates a new category
func (r *CategoryRepository) Create(category *models.Category) error {
	// Generate slug from name if not provided
	if category.Slug == "" {
		category.Slug = generateSlug(category.Name)
	}

	if err := r.db.Create(category).Error; err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}
	return nil
}

// GetByID retrieves a category by ID
func (r *CategoryRepository) GetByID(id uuid.UUID) (*models.Category, error) {
	var category models.Category
	if err := r.db.Preload("Parent").Preload("Children").First(&category, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}
	return &category, nil
}

// GetBySlug retrieves a category by slug
func (r *CategoryRepository) GetBySlug(slug string) (*models.Category, error) {
	var category models.Category
	if err := r.db.Preload("Parent").Preload("Children").First(&category, "slug = ?", slug).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}
	return &category, nil
}

// GetAll retrieves all categories
func (r *CategoryRepository) GetAll() ([]models.Category, error) {
	var categories []models.Category
	if err := r.db.Preload("Parent").Preload("Children").Where("is_active = true").Order("sort_order ASC, name ASC").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}
	return categories, nil
}

// GetRootCategories retrieves all root categories (categories without parent)
func (r *CategoryRepository) GetRootCategories() ([]models.Category, error) {
	var categories []models.Category
	if err := r.db.Preload("Children").Where("parent_id IS NULL AND is_active = true").Order("sort_order ASC, name ASC").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to get root categories: %w", err)
	}
	return categories, nil
}

// GetByParentID retrieves categories by parent ID
func (r *CategoryRepository) GetByParentID(parentID uuid.UUID) ([]models.Category, error) {
	var categories []models.Category
	if err := r.db.Preload("Children").Where("parent_id = ? AND is_active = true", parentID).Order("sort_order ASC, name ASC").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to get categories by parent: %w", err)
	}
	return categories, nil
}

// Update updates a category
func (r *CategoryRepository) Update(category *models.Category) error {
	// Update slug if name changed
	if category.Slug == "" {
		category.Slug = generateSlug(category.Name)
	}

	if err := r.db.Save(category).Error; err != nil {
		return fmt.Errorf("failed to update category: %w", err)
	}
	return nil
}

// Delete soft deletes a category
func (r *CategoryRepository) Delete(id uuid.UUID) error {
	// Check if category has children
	var childCount int64
	if err := r.db.Model(&models.Category{}).Where("parent_id = ?", id).Count(&childCount).Error; err != nil {
		return fmt.Errorf("failed to check for child categories: %w", err)
	}

	if childCount > 0 {
		return fmt.Errorf("cannot delete category with child categories")
	}

	// Check if category has products
	var productCount int64
	if err := r.db.Model(&models.Product{}).Where("category_id = ?", id).Count(&productCount).Error; err != nil {
		return fmt.Errorf("failed to check for products in category: %w", err)
	}

	if productCount > 0 {
		return fmt.Errorf("cannot delete category with products")
	}

	if err := r.db.Delete(&models.Category{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}
	return nil
}

// ExistsByName checks if a category exists with the given name
func (r *CategoryRepository) ExistsByName(name string, excludeID *uuid.UUID) (bool, error) {
	var count int64
	query := r.db.Model(&models.Category{}).Where("name = ?", name)
	
	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}
	
	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check category existence: %w", err)
	}
	return count > 0, nil
}

// ExistsBySlug checks if a category exists with the given slug
func (r *CategoryRepository) ExistsBySlug(slug string, excludeID *uuid.UUID) (bool, error) {
	var count int64
	query := r.db.Model(&models.Category{}).Where("slug = ?", slug)
	
	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}
	
	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check category slug existence: %w", err)
	}
	return count > 0, nil
}

// GetCategoryTree retrieves the complete category tree
func (r *CategoryRepository) GetCategoryTree() ([]models.Category, error) {
	var categories []models.Category
	if err := r.db.Where("is_active = true").Order("sort_order ASC, name ASC").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to get category tree: %w", err)
	}

	// Build the tree structure
	categoryMap := make(map[uuid.UUID]*models.Category)
	var rootCategories []models.Category

	// First pass: create map of all categories
	for i := range categories {
		categoryMap[categories[i].ID] = &categories[i]
	}

	// Second pass: build parent-child relationships
	for i := range categories {
		if categories[i].ParentID != nil {
			if parent, exists := categoryMap[*categories[i].ParentID]; exists {
				parent.Children = append(parent.Children, categories[i])
			}
		} else {
			rootCategories = append(rootCategories, categories[i])
		}
	}

	return rootCategories, nil
}

// UpdateSortOrder updates the sort order of categories
func (r *CategoryRepository) UpdateSortOrder(categoryIDs []uuid.UUID) error {
	for i, id := range categoryIDs {
		if err := r.db.Model(&models.Category{}).Where("id = ?", id).Update("sort_order", i+1).Error; err != nil {
			return fmt.Errorf("failed to update sort order for category %s: %w", id, err)
		}
	}
	return nil
}

// Search searches categories by name or description
func (r *CategoryRepository) Search(query string) ([]models.Category, error) {
	var categories []models.Category
	searchQuery := fmt.Sprintf("%%%s%%", query)
	
	if err := r.db.Preload("Parent").Preload("Children").Where("(name ILIKE ? OR description ILIKE ?) AND is_active = true", searchQuery, searchQuery).Order("name ASC").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to search categories: %w", err)
	}
	return categories, nil
}

// GetProductCount returns the number of products in a category (including subcategories)
func (r *CategoryRepository) GetProductCount(categoryID uuid.UUID) (int64, error) {
	// Get all descendant category IDs
	descendantIDs, err := r.getDescendantIDs(categoryID)
	if err != nil {
		return 0, err
	}

	// Include the category itself
	allCategoryIDs := append(descendantIDs, categoryID)

	// Count products in all these categories
	var count int64
	if err := r.db.Model(&models.Product{}).Where("category_id IN ?", allCategoryIDs).Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count products in category: %w", err)
	}

	return count, nil
}

// getDescendantIDs recursively gets all descendant category IDs
func (r *CategoryRepository) getDescendantIDs(categoryID uuid.UUID) ([]uuid.UUID, error) {
	var childIDs []uuid.UUID
	if err := r.db.Model(&models.Category{}).Where("parent_id = ?", categoryID).Pluck("id", &childIDs).Error; err != nil {
		return nil, fmt.Errorf("failed to get child category IDs: %w", err)
	}

	var allDescendantIDs []uuid.UUID
	for _, childID := range childIDs {
		allDescendantIDs = append(allDescendantIDs, childID)
		
		// Recursively get descendants of this child
		grandchildIDs, err := r.getDescendantIDs(childID)
		if err != nil {
			return nil, err
		}
		allDescendantIDs = append(allDescendantIDs, grandchildIDs...)
	}

	return allDescendantIDs, nil
}

// generateSlug generates a URL-friendly slug from a string
func generateSlug(text string) string {
	// Convert to lowercase
	slug := strings.ToLower(text)
	
	// Replace spaces and special characters with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	
	// Remove Turkish characters
	replacements := map[string]string{
		"ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u",
		"Ç": "c", "Ğ": "g", "İ": "i", "Ö": "o", "Ş": "s", "Ü": "u",
	}
	
	for turkish, english := range replacements {
		slug = strings.ReplaceAll(slug, turkish, english)
	}
	
	// Remove any remaining non-alphanumeric characters except hyphens
	var result strings.Builder
	for _, char := range slug {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-' {
			result.WriteRune(char)
		}
	}
	
	// Remove multiple consecutive hyphens
	slug = result.String()
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}
	
	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")
	
	return slug
}