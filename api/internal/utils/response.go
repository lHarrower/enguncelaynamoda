package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorResponse represents an error response structure
type ErrorResponse struct {
	Error   string      `json:"error"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
	Code    int         `json:"code"`
}

// SuccessResponse represents a success response structure
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// PaginationResponse represents pagination metadata
type PaginationResponse struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

// PaginatedResponse represents a paginated response structure
type PaginatedResponse struct {
	Data       interface{}         `json:"data"`
	Pagination PaginationResponse `json:"pagination"`
}

// ErrorResponse sends an error response
func ErrorResponse(c *gin.Context, statusCode int, message string, err error) {
	response := ErrorResponse{
		Error:   "error",
		Message: message,
		Code:    statusCode,
	}

	if err != nil {
		response.Details = err.Error()
	}

	c.JSON(statusCode, response)
}

// SuccessResponse sends a success response
func SuccessResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	response := SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	}

	c.JSON(statusCode, response)
}

// PaginatedSuccessResponse sends a paginated success response
func PaginatedSuccessResponse(c *gin.Context, data interface{}, page, limit int, total int64) {
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	hasNext := page < totalPages
	hasPrev := page > 1

	response := PaginatedResponse{
		Data: data,
		Pagination: PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
			HasNext:    hasNext,
			HasPrev:    hasPrev,
		},
	}

	c.JSON(http.StatusOK, response)
}

// ValidationErrorResponse sends a validation error response
func ValidationErrorResponse(c *gin.Context, errors map[string]string) {
	response := ErrorResponse{
		Error:   "validation_error",
		Message: "Validation failed",
		Details: errors,
		Code:    http.StatusBadRequest,
	}

	c.JSON(http.StatusBadRequest, response)
}

// UnauthorizedResponse sends an unauthorized error response
func UnauthorizedResponse(c *gin.Context, message string) {
	response := ErrorResponse{
		Error:   "unauthorized",
		Message: message,
		Code:    http.StatusUnauthorized,
	}

	c.JSON(http.StatusUnauthorized, response)
}

// ForbiddenResponse sends a forbidden error response
func ForbiddenResponse(c *gin.Context, message string) {
	response := ErrorResponse{
		Error:   "forbidden",
		Message: message,
		Code:    http.StatusForbidden,
	}

	c.JSON(http.StatusForbidden, response)
}

// NotFoundResponse sends a not found error response
func NotFoundResponse(c *gin.Context, message string) {
	response := ErrorResponse{
		Error:   "not_found",
		Message: message,
		Code:    http.StatusNotFound,
	}

	c.JSON(http.StatusNotFound, response)
}

// InternalServerErrorResponse sends an internal server error response
func InternalServerErrorResponse(c *gin.Context, message string, err error) {
	response := ErrorResponse{
		Error:   "internal_server_error",
		Message: message,
		Code:    http.StatusInternalServerError,
	}

	if err != nil {
		response.Details = err.Error()
	}

	c.JSON(http.StatusInternalServerError, response)
}

// ConflictResponse sends a conflict error response
func ConflictResponse(c *gin.Context, message string) {
	response := ErrorResponse{
		Error:   "conflict",
		Message: message,
		Code:    http.StatusConflict,
	}

	c.JSON(http.StatusConflict, response)
}

// TooManyRequestsResponse sends a rate limit error response
func TooManyRequestsResponse(c *gin.Context, message string) {
	response := ErrorResponse{
		Error:   "too_many_requests",
		Message: message,
		Code:    http.StatusTooManyRequests,
	}

	c.JSON(http.StatusTooManyRequests, response)
}