package service

import (
	"errors"
	"fmt"
	"mime/multipart"
	"strings"
	"time"

	"github.com/google/uuid"

	"aynamoda/internal/models"
	"aynamoda/internal/repository"
	"aynamoda/internal/utils"
)

// ProductService handles product-related business logic
type ProductService struct {
	productRepo  *repository.ProductRepository
	categoryRepo *repository.CategoryRepository
	storageUtils *utils.StorageUtils
}

// NewProductService creates a new product service
func NewProductService(productRepo *repository.ProductRepository, categoryRepo *repository.CategoryRepository, storageUtils *utils.StorageUtils) *ProductService {
	return &ProductService{
		productRepo:  productRepo,
		categoryRepo: categoryRepo,
		storageUtils: storageUtils,
	}
}

// CreateProductRequest represents product creation request
type CreateProductRequest struct {
	Name        string                  `json:"name" binding:"required"`
	Brand       string                  `json:"brand" binding:"required"`
	Color       string                  `json:"color" binding:"required"`
	Size        string                  `json:"size,omitempty"`
	CategoryID  uuid.UUID               `json:"category_id" binding:"required"`
	Description *string                 `json:"description,omitempty"`
	Price       *float64                `json:"price,omitempty"`
	PurchaseURL *string                 `json:"purchase_url,omitempty"`
	Tags        []string                `json:"tags,omitempty"`
	Images      []*multipart.FileHeader `json:"-"` // Handled separately in handler
}

// UpdateProductRequest represents product update request
type UpdateProductRequest struct {
	Name        *string   `json:"name,omitempty"`
	Brand       *string   `json:"brand,omitempty"`
	Color       *string   `json:"color,omitempty"`
	Size        *string   `json:"size,omitempty"`
	CategoryID  *uuid.UUID `json:"category_id,omitempty"`
	Description *string   `json:"description,omitempty"`
	Price       *float64  `json:"price,omitempty"`
	PurchaseURL *string   `json:"purchase_url,omitempty"`
	Tags        []string  `json:"tags,omitempty"`
}

// ProductResponse represents product data in responses
type ProductResponse struct {
	ID          uuid.UUID                `json:"id"`
	UserID      uuid.UUID                `json:"user_id"`
	Name        string                   `json:"name"`
	Brand       string                   `json:"brand"`
	Color       string                   `json:"color"`
	Size        *string                  `json:"size,omitempty"`
	Category    *CategoryResponse        `json:"category,omitempty"`
	Description *string                  `json:"description,omitempty"`
	Price       *float64                 `json:"price,omitempty"`
	PurchaseURL *string                  `json:"purchase_url,omitempty"`
	Tags        []string                 `json:"tags"`
	Images      []ProductImageResponse   `json:"images"`
	WearCount   int                      `json:"wear_count"`
	IsFavorite  bool                     `json:"is_favorite"`
	CreatedAt   time.Time                `json:"created_at"`
	UpdatedAt   time.Time                `json:"updated_at"`
}

// ProductImageResponse represents product image data
type ProductImageResponse struct {
	ID        uuid.UUID `json:"id"`
	URL       string    `json:"url"`
	IsPrimary bool      `json:"is_primary"`
	CreatedAt time.Time `json:"created_at"`
}

// CategoryResponse represents category data in responses
type CategoryResponse struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Slug     string    `json:"slug"`
	ParentID *uuid.UUID `json:"parent_id,omitempty"`
}

// ProductListResponse represents paginated product list
type ProductListResponse struct {
	Products []ProductResponse `json:"products"`
	Total    int64             `json:"total"`
	Page     int               `json:"page"`
	Limit    int               `json:"limit"`
	Pages    int               `json:"pages"`
}

// SearchProductsRequest represents product search request
type SearchProductsRequest struct {
	Query      string     `json:"query,omitempty"`
	CategoryID *uuid.UUID `json:"category_id,omitempty"`
	Color      string     `json:"color,omitempty"`
	Brand      string     `json:"brand,omitempty"`
	Tags       []string   `json:"tags,omitempty"`
	MinPrice   *float64   `json:"min_price,omitempty"`
	MaxPrice   *float64   `json:"max_price,omitempty"`
	Page       int        `json:"page,omitempty"`
	Limit      int        `json:"limit,omitempty"`
}

// CreateProduct creates a new product
func (s *ProductService) CreateProduct(userID uuid.UUID, req *CreateProductRequest) (*ProductResponse, error) {
	// Validate category exists
	category, err := s.categoryRepo.GetByID(req.CategoryID)
	if err != nil {
		return nil, errors.New("invalid category")
	}

	// Create product
	product := &models.Product{
		UserID:      userID,
		Name:        req.Name,
		Brand:       req.Brand,
		Color:       req.Color,
		Size:        req.Size,
		CategoryID:  req.CategoryID,
		Description: req.Description,
		Price:       req.Price,
		PurchaseURL: req.PurchaseURL,
		Tags:        req.Tags,
	}

	if err := s.productRepo.Create(product); err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	// Handle image uploads if provided
	if len(req.Images) > 0 {
		for i, imageFile := range req.Images {
			// Upload image to cloud storage
			imageURL, err := s.storageUtils.UploadProductImage(userID, product.ID, imageFile)
			if err != nil {
				// Log error but don't fail product creation
				fmt.Printf("Failed to upload image: %v\n", err)
				continue
			}

			// Create image record
			productImage := &models.ProductImage{
				ProductID: product.ID,
				URL:       imageURL,
				IsPrimary: i == 0, // First image is primary
			}

			if err := s.productRepo.CreateImage(productImage); err != nil {
				fmt.Printf("Failed to create image record: %v\n", err)
			}
		}
	}

	// Get complete product with images
	completeProduct, err := s.productRepo.GetByID(product.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get created product: %w", err)
	}

	return s.toProductResponse(completeProduct, category), nil
}

// GetProduct retrieves a product by ID
func (s *ProductService) GetProduct(userID, productID uuid.UUID) (*ProductResponse, error) {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return nil, fmt.Errorf("product not found: %w", err)
	}

	// Check if user owns the product
	if product.UserID != userID {
		return nil, errors.New("access denied")
	}

	// Get category
	category, err := s.categoryRepo.GetByID(product.CategoryID)
	if err != nil {
		// Log error but don't fail
		fmt.Printf("Failed to get category: %v\n", err)
	}

	return s.toProductResponse(product, category), nil
}

// GetUserProducts retrieves user's products with pagination
func (s *ProductService) GetUserProducts(userID uuid.UUID, page, limit int) (*ProductListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	products, total, err := s.productRepo.GetByUserID(userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get user products: %w", err)
	}

	// Convert to response format
	productResponses := make([]ProductResponse, len(products))
	for i, product := range products {
		productResponses[i] = *s.toProductResponse(&product, product.Category)
	}

	pages := int((total + int64(limit) - 1) / int64(limit))

	return &ProductListResponse{
		Products: productResponses,
		Total:    total,
		Page:     page,
		Limit:    limit,
		Pages:    pages,
	}, nil
}

// UpdateProduct updates a product
func (s *ProductService) UpdateProduct(userID, productID uuid.UUID, req *UpdateProductRequest) (*ProductResponse, error) {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return nil, fmt.Errorf("product not found: %w", err)
	}

	// Check if user owns the product
	if product.UserID != userID {
		return nil, errors.New("access denied")
	}

	// Update fields if provided
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Brand != nil {
		product.Brand = *req.Brand
	}
	if req.Color != nil {
		product.Color = *req.Color
	}
	if req.Size != nil {
		product.Size = req.Size
	}
	if req.CategoryID != nil {
		// Validate category exists
		if _, err := s.categoryRepo.GetByID(*req.CategoryID); err != nil {
			return nil, errors.New("invalid category")
		}
		product.CategoryID = *req.CategoryID
	}
	if req.Description != nil {
		product.Description = req.Description
	}
	if req.Price != nil {
		product.Price = req.Price
	}
	if req.PurchaseURL != nil {
		product.PurchaseURL = req.PurchaseURL
	}
	if req.Tags != nil {
		product.Tags = req.Tags
	}

	if err := s.productRepo.Update(product); err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}

	// Get updated product with category
	updatedProduct, err := s.productRepo.GetByID(productID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated product: %w", err)
	}

	category, err := s.categoryRepo.GetByID(updatedProduct.CategoryID)
	if err != nil {
		fmt.Printf("Failed to get category: %v\n", err)
	}

	return s.toProductResponse(updatedProduct, category), nil
}

// DeleteProduct deletes a product
func (s *ProductService) DeleteProduct(userID, productID uuid.UUID) error {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return fmt.Errorf("product not found: %w", err)
	}

	// Check if user owns the product
	if product.UserID != userID {
		return errors.New("access denied")
	}

	// Delete product images from storage
	for _, image := range product.Images {
		if err := s.storageUtils.DeleteProductImage(image.URL); err != nil {
			// Log error but don't fail deletion
			fmt.Printf("Failed to delete image from storage: %v\n", err)
		}
	}

	if err := s.productRepo.Delete(productID); err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	return nil
}

// SearchProducts searches products with filters
func (s *ProductService) SearchProducts(userID uuid.UUID, req *SearchProductsRequest) (*ProductListResponse, error) {
	if req.Page < 1 {
		req.Page = 1
	}
	if req.Limit < 1 || req.Limit > 100 {
		req.Limit = 20
	}

	offset := (req.Page - 1) * req.Limit

	var products []models.Product
	var total int64
	var err error

	// Search based on provided filters
	if req.Query != "" {
		products, total, err = s.productRepo.Search(userID, req.Query, req.Limit, offset)
	} else if req.CategoryID != nil {
		products, total, err = s.productRepo.GetByCategoryID(*req.CategoryID, req.Limit, offset)
	} else if req.Color != "" {
		products, total, err = s.productRepo.GetByColor(userID, req.Color, req.Limit, offset)
	} else {
		// Default to user's products
		products, total, err = s.productRepo.GetByUserID(userID, req.Limit, offset)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to search products: %w", err)
	}

	// Apply additional filters
	if req.Brand != "" || len(req.Tags) > 0 || req.MinPrice != nil || req.MaxPrice != nil {
		products = s.applyFilters(products, req)
		total = int64(len(products))
	}

	// Convert to response format
	productResponses := make([]ProductResponse, len(products))
	for i, product := range products {
		productResponses[i] = *s.toProductResponse(&product, product.Category)
	}

	pages := int((total + int64(req.Limit) - 1) / int64(req.Limit))

	return &ProductListResponse{
		Products: productResponses,
		Total:    total,
		Page:     req.Page,
		Limit:    req.Limit,
		Pages:    pages,
	}, nil
}

// GetFavoriteProducts retrieves user's favorite products
func (s *ProductService) GetFavoriteProducts(userID uuid.UUID, page, limit int) (*ProductListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	products, total, err := s.productRepo.GetFavorites(userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get favorite products: %w", err)
	}

	// Convert to response format
	productResponses := make([]ProductResponse, len(products))
	for i, product := range products {
		productResponses[i] = *s.toProductResponse(&product, product.Category)
	}

	pages := int((total + int64(limit) - 1) / int64(limit))

	return &ProductListResponse{
		Products: productResponses,
		Total:    total,
		Page:     page,
		Limit:    limit,
		Pages:    pages,
	}, nil
}

// ToggleFavorite toggles product favorite status
func (s *ProductService) ToggleFavorite(userID, productID uuid.UUID) error {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return fmt.Errorf("product not found: %w", err)
	}

	// Check if user owns the product
	if product.UserID != userID {
		return errors.New("access denied")
	}

	if err := s.productRepo.ToggleFavorite(productID); err != nil {
		return fmt.Errorf("failed to toggle favorite: %w", err)
	}

	return nil
}

// UpdateWearCount increments product wear count
func (s *ProductService) UpdateWearCount(userID, productID uuid.UUID) error {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return fmt.Errorf("product not found: %w", err)
	}

	// Check if user owns the product
	if product.UserID != userID {
		return errors.New("access denied")
	}

	if err := s.productRepo.UpdateWearCount(productID); err != nil {
		return fmt.Errorf("failed to update wear count: %w", err)
	}

	return nil
}

// AddProductImage adds an image to a product
func (s *ProductService) AddProductImage(userID, productID uuid.UUID, imageFile *multipart.FileHeader) (*ProductImageResponse, error) {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return nil, fmt.Errorf("product not found: %w", err)
	}

	// Check if user owns the product
	if product.UserID != userID {
		return nil, errors.New("access denied")
	}

	// Upload image to cloud storage
	imageURL, err := s.storageUtils.UploadProductImage(userID, productID, imageFile)
	if err != nil {
		return nil, fmt.Errorf("failed to upload image: %w", err)
	}

	// Create image record
	productImage := &models.ProductImage{
		ProductID: productID,
		URL:       imageURL,
		IsPrimary: len(product.Images) == 0, // First image is primary
	}

	if err := s.productRepo.CreateImage(productImage); err != nil {
		return nil, fmt.Errorf("failed to create image record: %w", err)
	}

	return &ProductImageResponse{
		ID:        productImage.ID,
		URL:       productImage.URL,
		IsPrimary: productImage.IsPrimary,
		CreatedAt: productImage.CreatedAt,
	}, nil
}

// DeleteProductImage deletes a product image
func (s *ProductService) DeleteProductImage(userID, productID, imageID uuid.UUID) error {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return fmt.Errorf("product not found: %w", err)
	}

	// Check if user owns the product
	if product.UserID != userID {
		return errors.New("access denied")
	}

	// Find the image
	var imageURL string
	for _, img := range product.Images {
		if img.ID == imageID {
			imageURL = img.URL
			break
		}
	}

	if imageURL == "" {
		return errors.New("image not found")
	}

	// Delete from storage
	if err := s.storageUtils.DeleteProductImage(imageURL); err != nil {
		fmt.Printf("Failed to delete image from storage: %v\n", err)
	}

	// Delete from database
	if err := s.productRepo.DeleteImage(imageID); err != nil {
		return fmt.Errorf("failed to delete image record: %w", err)
	}

	return nil
}

// SetPrimaryImage sets an image as primary for a product
func (s *ProductService) SetPrimaryImage(userID, productID, imageID uuid.UUID) error {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return fmt.Errorf("product not found: %w", err)
	}

	// Check if user owns the product
	if product.UserID != userID {
		return errors.New("access denied")
	}

	// Verify image belongs to product
	imageExists := false
	for _, img := range product.Images {
		if img.ID == imageID {
			imageExists = true
			break
		}
	}

	if !imageExists {
		return errors.New("image not found")
	}

	if err := s.productRepo.SetPrimaryImage(productID, imageID); err != nil {
		return fmt.Errorf("failed to set primary image: %w", err)
	}

	return nil
}

// applyFilters applies additional filters to products
func (s *ProductService) applyFilters(products []models.Product, req *SearchProductsRequest) []models.Product {
	filtered := make([]models.Product, 0)

	for _, product := range products {
		// Brand filter
		if req.Brand != "" && !strings.EqualFold(product.Brand, req.Brand) {
			continue
		}

		// Price filters
		if req.MinPrice != nil && product.Price != nil && *product.Price < *req.MinPrice {
			continue
		}
		if req.MaxPrice != nil && product.Price != nil && *product.Price > *req.MaxPrice {
			continue
		}

		// Tags filter
		if len(req.Tags) > 0 {
			hasTag := false
			for _, reqTag := range req.Tags {
				for _, productTag := range product.Tags {
					if strings.EqualFold(productTag, reqTag) {
						hasTag = true
						break
					}
				}
				if hasTag {
					break
				}
			}
			if !hasTag {
				continue
			}
		}

		filtered = append(filtered, product)
	}

	return filtered
}

// toProductResponse converts Product model to ProductResponse
func (s *ProductService) toProductResponse(product *models.Product, category *models.Category) *ProductResponse {
	response := &ProductResponse{
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
	if category != nil {
		response.Category = &CategoryResponse{
			ID:       category.ID,
			Name:     category.Name,
			Slug:     category.Slug,
			ParentID: category.ParentID,
		}
	}

	// Add images
	response.Images = make([]ProductImageResponse, len(product.Images))
	for i, img := range product.Images {
		response.Images[i] = ProductImageResponse{
			ID:        img.ID,
			URL:       img.URL,
			IsPrimary: img.IsPrimary,
			CreatedAt: img.CreatedAt,
		}
	}

	return response
}