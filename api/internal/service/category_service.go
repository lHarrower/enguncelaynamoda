package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"aynamoda/internal/models"
	"aynamoda/internal/repository"
)

// CategoryService handles category-related business logic
type CategoryService struct {
	categoryRepo *repository.CategoryRepository
}

// NewCategoryService creates a new category service
func NewCategoryService(categoryRepo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{
		categoryRepo: categoryRepo,
	}
}

// CreateCategoryRequest represents category creation request
type CreateCategoryRequest struct {
	Name        string     `json:"name" binding:"required"`
	Description *string    `json:"description,omitempty"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty"`
	Icon        *string    `json:"icon,omitempty"`
	Color       *string    `json:"color,omitempty"`
	SortOrder   *int       `json:"sort_order,omitempty"`
}

// UpdateCategoryRequest represents category update request
type UpdateCategoryRequest struct {
	Name        *string    `json:"name,omitempty"`
	Description *string    `json:"description,omitempty"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty"`
	Icon        *string    `json:"icon,omitempty"`
	Color       *string    `json:"color,omitempty"`
	SortOrder   *int       `json:"sort_order,omitempty"`
	IsActive    *bool      `json:"is_active,omitempty"`
}

// CategoryResponse represents category data in responses
type CategoryResponse struct {
	ID           uuid.UUID          `json:"id"`
	Name         string             `json:"name"`
	Slug         string             `json:"slug"`
	Description  *string            `json:"description,omitempty"`
	ParentID     *uuid.UUID         `json:"parent_id,omitempty"`
	Parent       *CategoryResponse  `json:"parent,omitempty"`
	Children     []CategoryResponse `json:"children,omitempty"`
	Icon         *string            `json:"icon,omitempty"`
	Color        *string            `json:"color,omitempty"`
	SortOrder    int                `json:"sort_order"`
	IsActive     bool               `json:"is_active"`
	ProductCount int64              `json:"product_count"`
	CreatedAt    time.Time          `json:"created_at"`
	UpdatedAt    time.Time          `json:"updated_at"`
}

// CategoryTreeResponse represents hierarchical category structure
type CategoryTreeResponse struct {
	Categories []CategoryResponse `json:"categories"`
}

// CreateCategory creates a new category
func (s *CategoryService) CreateCategory(req *CreateCategoryRequest) (*CategoryResponse, error) {
	// Validate parent category if provided
	if req.ParentID != nil {
		parent, err := s.categoryRepo.GetByID(*req.ParentID)
		if err != nil {
			return nil, errors.New("invalid parent category")
		}
		if !parent.IsActive {
			return nil, errors.New("parent category is not active")
		}
	}

	// Check if category name already exists
	exists, err := s.categoryRepo.ExistsByName(req.Name)
	if err != nil {
		return nil, fmt.Errorf("failed to check category existence: %w", err)
	}
	if exists {
		return nil, errors.New("category with this name already exists")
	}

	// Create category
	category := &models.Category{
		Name:        req.Name,
		Description: req.Description,
		ParentID:    req.ParentID,
		Icon:        req.Icon,
		Color:       req.Color,
		IsActive:    true,
	}

	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}

	if err := s.categoryRepo.Create(category); err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	// Get product count
	productCount, err := s.categoryRepo.GetProductCount(category.ID)
	if err != nil {
		productCount = 0 // Default to 0 if error
	}

	return s.toCategoryResponse(category, nil, nil, productCount), nil
}

// GetCategory retrieves a category by ID
func (s *CategoryService) GetCategory(categoryID uuid.UUID) (*CategoryResponse, error) {
	category, err := s.categoryRepo.GetByID(categoryID)
	if err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	// Get parent if exists
	var parent *models.Category
	if category.ParentID != nil {
		parent, _ = s.categoryRepo.GetByID(*category.ParentID)
	}

	// Get children
	children, err := s.categoryRepo.GetByParentID(category.ID)
	if err != nil {
		children = []models.Category{} // Default to empty if error
	}

	// Get product count
	productCount, err := s.categoryRepo.GetProductCount(category.ID)
	if err != nil {
		productCount = 0
	}

	return s.toCategoryResponse(category, parent, children, productCount), nil
}

// GetCategoryBySlug retrieves a category by slug
func (s *CategoryService) GetCategoryBySlug(slug string) (*CategoryResponse, error) {
	category, err := s.categoryRepo.GetBySlug(slug)
	if err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	// Get parent if exists
	var parent *models.Category
	if category.ParentID != nil {
		parent, _ = s.categoryRepo.GetByID(*category.ParentID)
	}

	// Get children
	children, err := s.categoryRepo.GetByParentID(category.ID)
	if err != nil {
		children = []models.Category{}
	}

	// Get product count
	productCount, err := s.categoryRepo.GetProductCount(category.ID)
	if err != nil {
		productCount = 0
	}

	return s.toCategoryResponse(category, parent, children, productCount), nil
}

// GetAllCategories retrieves all categories
func (s *CategoryService) GetAllCategories() ([]CategoryResponse, error) {
	categories, err := s.categoryRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}

	// Convert to response format
	responses := make([]CategoryResponse, len(categories))
	for i, category := range categories {
		// Get product count for each category
		productCount, err := s.categoryRepo.GetProductCount(category.ID)
		if err != nil {
			productCount = 0
		}

		responses[i] = *s.toCategoryResponse(&category, nil, nil, productCount)
	}

	return responses, nil
}

// GetRootCategories retrieves root categories (categories without parent)
func (s *CategoryService) GetRootCategories() ([]CategoryResponse, error) {
	categories, err := s.categoryRepo.GetRootCategories()
	if err != nil {
		return nil, fmt.Errorf("failed to get root categories: %w", err)
	}

	// Convert to response format
	responses := make([]CategoryResponse, len(categories))
	for i, category := range categories {
		// Get children
		children, err := s.categoryRepo.GetByParentID(category.ID)
		if err != nil {
			children = []models.Category{}
		}

		// Get product count
		productCount, err := s.categoryRepo.GetProductCount(category.ID)
		if err != nil {
			productCount = 0
		}

		responses[i] = *s.toCategoryResponse(&category, nil, children, productCount)
	}

	return responses, nil
}

// GetCategoryTree retrieves the complete category hierarchy
func (s *CategoryService) GetCategoryTree() (*CategoryTreeResponse, error) {
	tree, err := s.categoryRepo.GetCategoryTree()
	if err != nil {
		return nil, fmt.Errorf("failed to get category tree: %w", err)
	}

	// Convert to response format
	categories := make([]CategoryResponse, len(tree))
	for i, category := range tree {
		// Get product count
		productCount, err := s.categoryRepo.GetProductCount(category.ID)
		if err != nil {
			productCount = 0
		}

		categories[i] = *s.toCategoryResponse(&category, nil, nil, productCount)
	}

	return &CategoryTreeResponse{
		Categories: categories,
	}, nil
}

// GetSubcategories retrieves subcategories of a parent category
func (s *CategoryService) GetSubcategories(parentID uuid.UUID) ([]CategoryResponse, error) {
	// Verify parent category exists
	parent, err := s.categoryRepo.GetByID(parentID)
	if err != nil {
		return nil, fmt.Errorf("parent category not found: %w", err)
	}

	children, err := s.categoryRepo.GetByParentID(parentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get subcategories: %w", err)
	}

	// Convert to response format
	responses := make([]CategoryResponse, len(children))
	for i, category := range children {
		// Get product count
		productCount, err := s.categoryRepo.GetProductCount(category.ID)
		if err != nil {
			productCount = 0
		}

		responses[i] = *s.toCategoryResponse(&category, parent, nil, productCount)
	}

	return responses, nil
}

// UpdateCategory updates a category
func (s *CategoryService) UpdateCategory(categoryID uuid.UUID, req *UpdateCategoryRequest) (*CategoryResponse, error) {
	category, err := s.categoryRepo.GetByID(categoryID)
	if err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	// Validate parent category if provided
	if req.ParentID != nil {
		// Prevent circular reference
		if *req.ParentID == categoryID {
			return nil, errors.New("category cannot be its own parent")
		}

		parent, err := s.categoryRepo.GetByID(*req.ParentID)
		if err != nil {
			return nil, errors.New("invalid parent category")
		}
		if !parent.IsActive {
			return nil, errors.New("parent category is not active")
		}
	}

	// Check if new name already exists (if name is being changed)
	if req.Name != nil && *req.Name != category.Name {
		exists, err := s.categoryRepo.ExistsByName(*req.Name)
		if err != nil {
			return nil, fmt.Errorf("failed to check category existence: %w", err)
		}
		if exists {
			return nil, errors.New("category with this name already exists")
		}
	}

	// Update fields if provided
	if req.Name != nil {
		category.Name = *req.Name
	}
	if req.Description != nil {
		category.Description = req.Description
	}
	if req.ParentID != nil {
		category.ParentID = req.ParentID
	}
	if req.Icon != nil {
		category.Icon = req.Icon
	}
	if req.Color != nil {
		category.Color = req.Color
	}
	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		category.IsActive = *req.IsActive
	}

	if err := s.categoryRepo.Update(category); err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}

	// Get updated category with relations
	updatedCategory, err := s.categoryRepo.GetByID(categoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated category: %w", err)
	}

	// Get parent if exists
	var parent *models.Category
	if updatedCategory.ParentID != nil {
		parent, _ = s.categoryRepo.GetByID(*updatedCategory.ParentID)
	}

	// Get children
	children, err := s.categoryRepo.GetByParentID(categoryID)
	if err != nil {
		children = []models.Category{}
	}

	// Get product count
	productCount, err := s.categoryRepo.GetProductCount(categoryID)
	if err != nil {
		productCount = 0
	}

	return s.toCategoryResponse(updatedCategory, parent, children, productCount), nil
}

// DeleteCategory deletes a category
func (s *CategoryService) DeleteCategory(categoryID uuid.UUID) error {
	category, err := s.categoryRepo.GetByID(categoryID)
	if err != nil {
		return fmt.Errorf("category not found: %w", err)
	}

	// Check if category has children
	children, err := s.categoryRepo.GetByParentID(categoryID)
	if err != nil {
		return fmt.Errorf("failed to check for subcategories: %w", err)
	}
	if len(children) > 0 {
		return errors.New("cannot delete category with subcategories")
	}

	// Check if category has products
	productCount, err := s.categoryRepo.GetProductCount(categoryID)
	if err != nil {
		return fmt.Errorf("failed to check for products: %w", err)
	}
	if productCount > 0 {
		return errors.New("cannot delete category with products")
	}

	if err := s.categoryRepo.Delete(categoryID); err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	return nil
}

// SearchCategories searches categories by name
func (s *CategoryService) SearchCategories(query string, limit int) ([]CategoryResponse, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	categories, err := s.categoryRepo.Search(query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to search categories: %w", err)
	}

	// Convert to response format
	responses := make([]CategoryResponse, len(categories))
	for i, category := range categories {
		// Get product count
		productCount, err := s.categoryRepo.GetProductCount(category.ID)
		if err != nil {
			productCount = 0
		}

		responses[i] = *s.toCategoryResponse(&category, nil, nil, productCount)
	}

	return responses, nil
}

// UpdateSortOrder updates the sort order of categories
func (s *CategoryService) UpdateSortOrder(updates []struct {
	ID        uuid.UUID `json:"id"`
	SortOrder int       `json:"sort_order"`
}) error {
	for _, update := range updates {
		// Verify category exists
		category, err := s.categoryRepo.GetByID(update.ID)
		if err != nil {
			return fmt.Errorf("category %s not found: %w", update.ID, err)
		}

		if err := s.categoryRepo.UpdateSortOrder(update.ID, update.SortOrder); err != nil {
			return fmt.Errorf("failed to update sort order for category %s: %w", update.ID, err)
		}
	}

	return nil
}

// GetCategoryStats retrieves category statistics
func (s *CategoryService) GetCategoryStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Get all categories
	allCategories, err := s.categoryRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}

	stats["total_categories"] = len(allCategories)

	// Count active categories
	activeCount := 0
	for _, category := range allCategories {
		if category.IsActive {
			activeCount++
		}
	}
	stats["active_categories"] = activeCount

	// Get root categories count
	rootCategories, err := s.categoryRepo.GetRootCategories()
	if err != nil {
		return nil, fmt.Errorf("failed to get root categories: %w", err)
	}
	stats["root_categories"] = len(rootCategories)

	// Calculate total products across all categories
	totalProducts := int64(0)
	for _, category := range allCategories {
		productCount, err := s.categoryRepo.GetProductCount(category.ID)
		if err == nil {
			totalProducts += productCount
		}
	}
	stats["total_products"] = totalProducts

	return stats, nil
}

// toCategoryResponse converts Category model to CategoryResponse
func (s *CategoryService) toCategoryResponse(category *models.Category, parent *models.Category, children []models.Category, productCount int64) *CategoryResponse {
	response := &CategoryResponse{
		ID:           category.ID,
		Name:         category.Name,
		Slug:         category.Slug,
		Description:  category.Description,
		ParentID:     category.ParentID,
		Icon:         category.Icon,
		Color:        category.Color,
		SortOrder:    category.SortOrder,
		IsActive:     category.IsActive,
		ProductCount: productCount,
		CreatedAt:    category.CreatedAt,
		UpdatedAt:    category.UpdatedAt,
	}

	// Add parent if available
	if parent != nil {
		response.Parent = &CategoryResponse{
			ID:       parent.ID,
			Name:     parent.Name,
			Slug:     parent.Slug,
			ParentID: parent.ParentID,
		}
	}

	// Add children if available
	if len(children) > 0 {
		response.Children = make([]CategoryResponse, len(children))
		for i, child := range children {
			// Get product count for child
			childProductCount, err := s.categoryRepo.GetProductCount(child.ID)
			if err != nil {
				childProductCount = 0
			}

			response.Children[i] = CategoryResponse{
				ID:           child.ID,
				Name:         child.Name,
				Slug:         child.Slug,
				Description:  child.Description,
				ParentID:     child.ParentID,
				Icon:         child.Icon,
				Color:        child.Color,
				SortOrder:    child.SortOrder,
				IsActive:     child.IsActive,
				ProductCount: childProductCount,
				CreatedAt:    child.CreatedAt,
				UpdatedAt:    child.UpdatedAt,
			}
		}
	}

	return response
}