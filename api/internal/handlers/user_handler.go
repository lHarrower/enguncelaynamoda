package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"aynamoda/internal/service"
	"aynamoda/internal/utils"
)

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	userService *service.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// Register handles user registration
// @Summary Register a new user
// @Description Register a new user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body service.RegisterRequest true "Registration request"
// @Success 201 {object} service.AuthResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 409 {object} utils.ErrorResponse
// @Router /api/v1/auth/register [post]
func (h *UserHandler) Register(c *gin.Context) {
	var req service.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	response, err := h.userService.Register(&req)
	if err != nil {
		if err.Error() == "user already exists" {
			utils.ErrorResponse(c, http.StatusConflict, "User already exists", err)
			return
		}
		utils.ErrorResponse(c, http.StatusBadRequest, "Registration failed", err)
		return
	}

	c.JSON(http.StatusCreated, response)
}

// Login handles user login
// @Summary Login user
// @Description Authenticate user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body service.LoginRequest true "Login request"
// @Success 200 {object} service.AuthResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	response, err := h.userService.Login(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid credentials", err)
		return
	}

	c.JSON(http.StatusOK, response)
}

// RefreshToken handles token refresh
// @Summary Refresh access token
// @Description Refresh access token using refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body service.RefreshTokenRequest true "Refresh token request"
// @Success 200 {object} service.AuthResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/auth/refresh [post]
func (h *UserHandler) RefreshToken(c *gin.Context) {
	var req service.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	response, err := h.userService.RefreshToken(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid refresh token", err)
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetProfile handles getting user profile
// @Summary Get user profile
// @Description Get current user's profile information
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} service.UserResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/users/profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
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

	user, err := h.userService.GetProfile(uid)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found", err)
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateProfile handles updating user profile
// @Summary Update user profile
// @Description Update current user's profile information
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.UpdateProfileRequest true "Update profile request"
// @Success 200 {object} service.UserResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/users/profile [put]
func (h *UserHandler) UpdateProfile(c *gin.Context) {
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

	var req service.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	user, err := h.userService.UpdateProfile(uid, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update profile", err)
		return
	}

	c.JSON(http.StatusOK, user)
}

// ChangePassword handles password change
// @Summary Change user password
// @Description Change current user's password
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.ChangePasswordRequest true "Change password request"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/users/change-password [post]
func (h *UserHandler) ChangePassword(c *gin.Context) {
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

	var req service.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	if err := h.userService.ChangePassword(uid, &req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to change password", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password changed successfully", nil)
}

// ForgotPassword handles password reset request
// @Summary Request password reset
// @Description Send password reset email to user
// @Tags auth
// @Accept json
// @Produce json
// @Param request body service.ForgotPasswordRequest true "Forgot password request"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Router /api/v1/auth/forgot-password [post]
func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var req service.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	if err := h.userService.ForgotPassword(&req); err != nil {
		// Don't reveal if email exists or not for security
		utils.SuccessResponse(c, http.StatusOK, "If the email exists, a reset link has been sent", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "If the email exists, a reset link has been sent", nil)
}

// ResetPassword handles password reset
// @Summary Reset password
// @Description Reset password using reset token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body service.ResetPasswordRequest true "Reset password request"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Router /api/v1/auth/reset-password [post]
func (h *UserHandler) ResetPassword(c *gin.Context) {
	var req service.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	if err := h.userService.ResetPassword(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to reset password", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password reset successfully", nil)
}

// DeactivateAccount handles account deactivation
// @Summary Deactivate user account
// @Description Deactivate current user's account
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.SuccessResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/users/deactivate [post]
func (h *UserHandler) DeactivateAccount(c *gin.Context) {
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

	if err := h.userService.DeactivateAccount(uid); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to deactivate account", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Account deactivated successfully", nil)
}

// DeleteAccount handles account deletion
// @Summary Delete user account
// @Description Permanently delete current user's account
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.SuccessResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/users/delete [delete]
func (h *UserHandler) DeleteAccount(c *gin.Context) {
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

	if err := h.userService.DeleteAccount(uid); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to delete account", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Account deleted successfully", nil)
}

// GetStyleDNA handles getting user's style DNA
// @Summary Get user's style DNA
// @Description Get current user's style DNA information
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} service.StyleDNAResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/v1/users/style-dna [get]
func (h *UserHandler) GetStyleDNA(c *gin.Context) {
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

	styleDNA, err := h.userService.GetStyleDNA(uid)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Style DNA not found", err)
		return
	}

	c.JSON(http.StatusOK, styleDNA)
}

// UpdateStyleDNA handles updating user's style DNA
// @Summary Update user's style DNA
// @Description Update current user's style DNA information
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.StyleDNARequest true "Style DNA request"
// @Success 200 {object} service.StyleDNAResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/v1/users/style-dna [put]
func (h *UserHandler) UpdateStyleDNA(c *gin.Context) {
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

	var req service.StyleDNARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request format", err)
		return
	}

	styleDNA, err := h.userService.UpdateStyleDNA(uid, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update style DNA", err)
		return
	}

	c.JSON(http.StatusOK, styleDNA)
}

// GetUsers handles getting users list (admin only)
// @Summary Get users list
// @Description Get paginated list of users (admin only)
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} service.UserListResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Router /api/v1/admin/users [get]
func (h *UserHandler) GetUsers(c *gin.Context) {
	// This would typically check for admin role
	// For now, we'll implement basic pagination

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	users, err := h.userService.GetUsers(page, limit)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get users", err)
		return
	}

	c.JSON(http.StatusOK, users)
}