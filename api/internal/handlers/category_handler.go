package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"aynamoda/internal/service"
	"aynamoda/internal/utils"
)

// CategoryHandler handles category-related HTTP requests
type CategoryHandler struct {
	categoryService *service.CategoryService
}

// NewCategoryHandler creates a new category handler
func NewCategoryHandler(categoryService *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
	}
}

// CreateCategory handles category creation
// @Summary Create a new category
// @Description Create a new category (admin only)
// @Tags categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreateCategoryRequest true "Create category request"
// @Success 201 {object} service.CategoryResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Router /api/v1/categories [post]
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	// In a real application, you would check for admin role here
	// For now, we'll allow any authenticated user to create categories

	var req service.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	category, err := h.categoryService.CreateCategory(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create category", err)
		return
	}

	c.JSON(http.StatusCreated, category)
}

// GetCategory handles getting a single category
// @Summary Get category by ID
// @Description Get a category by its ID
// @Tags categories
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} service.CategoryResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/categories/{id} [get]
func (h *CategoryHandler) GetCategory(c *gin.Context) {
	categoryIDStr := c.Param("id")
	categoryID, err := uuid.Parse(categoryIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category ID", err)
		return
	}

	category, err := h.categoryService.GetCategory(categoryID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Category not found", err)
		return
	}

	c.JSON(http.StatusOK, category)
}

// GetCategoryBySlug handles getting a category by slug
// @Summary Get category by slug
// @Description Get a category by its slug
// @Tags categories
// @Produce json
// @Param slug path string true "Category slug"
// @Success 200 {object} service.CategoryResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/categories/slug/{slug} [get]
func (h *CategoryHandler) GetCategoryBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Slug is required", nil)
		return
	}

	category, err := h.categoryService.GetCategoryBySlug(slug)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Category not found", err)
		return
	}

	c.JSON(http.StatusOK, category)
}

// GetAllCategories handles getting all categories
// @Summary Get all categories
// @Description Get all categories in a flat list
// @Tags categories
// @Produce json
// @Success 200 {array} service.CategoryResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /api/v1/categories [get]
func (h *CategoryHandler) GetAllCategories(c *gin.Context) {
	categories, err := h.categoryService.GetAllCategories()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get categories", err)
		return
	}

	c.JSON(http.StatusOK, categories)
}

// GetRootCategories handles getting root categories
// @Summary Get root categories
// @Description Get categories that have no parent (root level)
// @Tags categories
// @Produce json
// @Success 200 {array} service.CategoryResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /api/v1/categories/root [get]
func (h *CategoryHandler) GetRootCategories(c *gin.Context) {
	categories, err := h.categoryService.GetRootCategories()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get root categories", err)
		return
	}

	c.JSON(http.StatusOK, categories)
}

// GetCategoryTree handles getting the category tree
// @Summary Get category tree
// @Description Get categories organized in a hierarchical tree structure
// @Tags categories
// @Produce json
// @Success 200 {array} service.CategoryTreeResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /api/v1/categories/tree [get]
func (h *CategoryHandler) GetCategoryTree(c *gin.Context) {
	tree, err := h.categoryService.GetCategoryTree()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get category tree", err)
		return
	}

	c.JSON(http.StatusOK, tree)
}

// GetSubcategories handles getting subcategories of a parent category
// @Summary Get subcategories
// @Description Get all subcategories of a parent category
// @Tags categories
// @Produce json
// @Param id path string true "Parent category ID"
// @Success 200 {array} service.CategoryResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/categories/{id}/subcategories [get]
func (h *CategoryHandler) GetSubcategories(c *gin.Context) {
	parentIDStr := c.Param("id")
	parentID, err := uuid.Parse(parentIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid parent category ID", err)
		return
	}

	subcategories, err := h.categoryService.GetSubcategories(parentID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Parent category not found or no subcategories", err)
		return
	}

	c.JSON(http.StatusOK, subcategories)
}

// UpdateCategory handles category updates
// @Summary Update category
// @Description Update a category by its ID (admin only)
// @Tags categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Param request body service.UpdateCategoryRequest true "Update category request"
// @Success 200 {object} service.CategoryResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/categories/{id} [put]
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	// In a real application, you would check for admin role here

	categoryIDStr := c.Param("id")
	categoryID, err := uuid.Parse(categoryIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category ID", err)
		return
	}

	var req service.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	category, err := h.categoryService.UpdateCategory(categoryID, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update category", err)
		return
	}

	c.JSON(http.StatusOK, category)
}

// DeleteCategory handles category deletion
// @Summary Delete category
// @Description Delete a category by its ID (admin only)
// @Tags categories
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/categories/{id} [delete]
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	// In a real application, you would check for admin role here

	categoryIDStr := c.Param("id")
	categoryID, err := uuid.Parse(categoryIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category ID", err)
		return
	}

	if err := h.categoryService.DeleteCategory(categoryID); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to delete category", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Category deleted successfully", nil)
}

// SearchCategories handles category search
// @Summary Search categories
// @Description Search categories by name or description
// @Tags categories
// @Produce json
// @Param q query string true "Search query"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} service.CategoryListResponse
// @Failure 400 {object} utils.ErrorResponse
// @Router /api/v1/categories/search [get]
func (h *CategoryHandler) SearchCategories(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Search query is required", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	req := &service.SearchCategoriesRequest{
		Query: query,
		Page:  page,
		Limit: limit,
	}

	result, err := h.categoryService.SearchCategories(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to search categories", err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// UpdateSortOrder handles updating category sort order
// @Summary Update category sort order
// @Description Update the sort order of categories (admin only)
// @Tags categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.UpdateSortOrderRequest true "Update sort order request"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Router /api/v1/categories/sort-order [put]
func (h *CategoryHandler) UpdateSortOrder(c *gin.Context) {
	// In a real application, you would check for admin role here

	var req service.UpdateSortOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	if err := h.categoryService.UpdateSortOrder(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update sort order", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Sort order updated successfully", nil)
}

// GetCategoryStats handles getting category statistics
// @Summary Get category statistics
// @Description Get statistics for a category including product count
// @Tags categories
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} service.CategoryStatsResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/categories/{id}/stats [get]
func (h *CategoryHandler) GetCategoryStats(c *gin.Context) {
	categoryIDStr := c.Param("id")
	categoryID, err := uuid.Parse(categoryIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category ID", err)
		return
	}

	stats, err := h.categoryService.GetCategoryStats(categoryID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Category not found", err)
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetCategoriesWithProductCount handles getting categories with product counts
// @Summary Get categories with product counts
// @Description Get all categories with their respective product counts
// @Tags categories
// @Produce json
// @Success 200 {array} service.CategoryWithCountResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /api/v1/categories/with-counts [get]
func (h *CategoryHandler) GetCategoriesWithProductCount(c *gin.Context) {
	categories, err := h.categoryService.GetCategoriesWithProductCount()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get categories with counts", err)
		return
	}

	c.JSON(http.StatusOK, categories)
}