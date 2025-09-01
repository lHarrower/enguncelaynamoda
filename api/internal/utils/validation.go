package utils

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

// Validator instance
var validate *validator.Validate

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Tag     string `json:"tag"`
	Message string `json:"message"`
}

// init initializes the validator
func init() {
	validate = validator.New()

	// Register custom validators
	validate.RegisterValidation("password", validatePassword)
	validate.RegisterValidation("phone", validatePhone)
	validate.RegisterValidation("color", validateColor)
	validate.RegisterValidation("slug", validateSlug)
}

// ValidateStruct validates a struct and returns formatted errors
func ValidateStruct(s interface{}) []ValidationError {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	var validationErrors []ValidationError
	for _, err := range err.(validator.ValidationErrors) {
		validationErrors = append(validationErrors, ValidationError{
			Field:   strings.ToLower(err.Field()),
			Tag:     err.Tag(),
			Message: getValidationMessage(err),
		})
	}

	return validationErrors
}

// getValidationMessage returns a user-friendly validation message
func getValidationMessage(err validator.FieldError) string {
	field := strings.ToLower(err.Field())
	switch err.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return "Invalid email format"
	case "min":
		return fmt.Sprintf("%s must be at least %s characters long", field, err.Param())
	case "max":
		return fmt.Sprintf("%s must be at most %s characters long", field, err.Param())
	case "len":
		return fmt.Sprintf("%s must be exactly %s characters long", field, err.Param())
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s", field, err.Param())
	case "uuid":
		return fmt.Sprintf("%s must be a valid UUID", field)
	case "url":
		return fmt.Sprintf("%s must be a valid URL", field)
	case "password":
		return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
	case "phone":
		return "Invalid phone number format"
	case "color":
		return "Invalid color format (must be hex color like #FFFFFF)"
	case "slug":
		return "Invalid slug format (must contain only lowercase letters, numbers, and hyphens)"
	default:
		return fmt.Sprintf("%s is invalid", field)
	}
}

// validatePassword validates password strength
func validatePassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()

	// At least 8 characters
	if len(password) < 8 {
		return false
	}

	var (
		hasUpper   = false
		hasLower   = false
		hasNumber  = false
		hasSpecial = false
	)

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	return hasUpper && hasLower && hasNumber && hasSpecial
}

// validatePhone validates phone number format
func validatePhone(fl validator.FieldLevel) bool {
	phone := fl.Field().String()
	// Simple phone validation - can be enhanced based on requirements
	phoneRegex := regexp.MustCompile(`^\+?[1-9]\d{1,14}$`)
	return phoneRegex.MatchString(phone)
}

// validateColor validates hex color format
func validateColor(fl validator.FieldLevel) bool {
	color := fl.Field().String()
	colorRegex := regexp.MustCompile(`^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$`)
	return colorRegex.MatchString(color)
}

// validateSlug validates slug format
func validateSlug(fl validator.FieldLevel) bool {
	slug := fl.Field().String()
	slugRegex := regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
	return slugRegex.MatchString(slug)
}

// IsValidEmail checks if email is valid
func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// IsValidUUID checks if string is a valid UUID
func IsValidUUID(u string) bool {
	uuidRegex := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
	return uuidRegex.MatchString(u)
}

// SanitizeString removes potentially harmful characters from string
func SanitizeString(s string) string {
	// Remove HTML tags
	htmlRegex := regexp.MustCompile(`<[^>]*>`)
	s = htmlRegex.ReplaceAllString(s, "")

	// Remove script tags and content
	scriptRegex := regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`)
	s = scriptRegex.ReplaceAllString(s, "")

	// Trim whitespace
	s = strings.TrimSpace(s)

	return s
}

// GenerateSlug generates a URL-friendly slug from a string
func GenerateSlug(s string) string {
	// Convert to lowercase
	s = strings.ToLower(s)

	// Replace spaces and special characters with hyphens
	slugRegex := regexp.MustCompile(`[^a-z0-9]+`)
	s = slugRegex.ReplaceAllString(s, "-")

	// Remove leading and trailing hyphens
	s = strings.Trim(s, "-")

	// Remove multiple consecutive hyphens
	multiHyphenRegex := regexp.MustCompile(`-+`)
	s = multiHyphenRegex.ReplaceAllString(s, "-")

	return s
}

// ValidateImageFormat checks if the file extension is a valid image format
func ValidateImageFormat(filename string) bool {
	validExtensions := []string{".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
	lowerFilename := strings.ToLower(filename)

	for _, ext := range validExtensions {
		if strings.HasSuffix(lowerFilename, ext) {
			return true
		}
	}

	return false
}

// ValidateFileSize checks if file size is within limits (size in bytes)
func ValidateFileSize(size int64, maxSize int64) bool {
	return size <= maxSize
}

// NormalizeEmail normalizes email address
func NormalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

// ValidateColorHex validates if string is a valid hex color
func ValidateColorHex(color string) bool {
	if !strings.HasPrefix(color, "#") {
		return false
	}

	colorRegex := regexp.MustCompile(`^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$`)
	return colorRegex.MatchString(color)
}

// ValidatePaginationParams validates pagination parameters
func ValidatePaginationParams(page, limit int) (int, int, error) {
	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}

	return page, limit, nil
}

// ValidateSearchQuery validates search query parameters
func ValidateSearchQuery(query string) error {
	if len(query) < 2 {
		return fmt.Errorf("search query must be at least 2 characters long")
	}

	if len(query) > 100 {
		return fmt.Errorf("search query must be at most 100 characters long")
	}

	return nil
}