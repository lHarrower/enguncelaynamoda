package repository

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"aynamoda/internal/models"
)

// UserRepository handles user-related database operations
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	if err := r.db.Create(user).Error; err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("StyleDNA").First(&user, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("StyleDNA").First(&user, "email = ?", email).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}

// Update updates a user
func (r *UserRepository) Update(user *models.User) error {
	if err := r.db.Save(user).Error; err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}

// Delete soft deletes a user
func (r *UserRepository) Delete(id uuid.UUID) error {
	if err := r.db.Delete(&models.User{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}

// List retrieves users with pagination
func (r *UserRepository) List(limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Count total records
	if err := r.db.Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	// Get paginated results
	if err := r.db.Preload("StyleDNA").Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list users: %w", err)
	}

	return users, total, nil
}

// ExistsByEmail checks if a user exists with the given email
func (r *UserRepository) ExistsByEmail(email string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check user existence: %w", err)
	}
	return count > 0, nil
}

// UpdateLastLogin updates the last login time for a user
func (r *UserRepository) UpdateLastLogin(id uuid.UUID) error {
	if err := r.db.Model(&models.User{}).Where("id = ?", id).Update("last_login_at", "NOW()").Error; err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}
	return nil
}

// CreateStyleDNA creates or updates a user's style DNA
func (r *UserRepository) CreateStyleDNA(styleDNA *models.StyleDNA) error {
	if err := r.db.Save(styleDNA).Error; err != nil {
		return fmt.Errorf("failed to save style DNA: %w", err)
	}
	return nil
}

// GetStyleDNA retrieves a user's style DNA
func (r *UserRepository) GetStyleDNA(userID uuid.UUID) (*models.StyleDNA, error) {
	var styleDNA models.StyleDNA
	if err := r.db.First(&styleDNA, "user_id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("style DNA not found")
		}
		return nil, fmt.Errorf("failed to get style DNA: %w", err)
	}
	return &styleDNA, nil
}

// CreateResetToken creates a password reset token
func (r *UserRepository) CreateResetToken(token *models.ResetToken) error {
	if err := r.db.Create(token).Error; err != nil {
		return fmt.Errorf("failed to create reset token: %w", err)
	}
	return nil
}

// GetResetToken retrieves a reset token
func (r *UserRepository) GetResetToken(token string) (*models.ResetToken, error) {
	var resetToken models.ResetToken
	if err := r.db.Preload("User").First(&resetToken, "token = ? AND used_at IS NULL AND expires_at > NOW()", token).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("reset token not found or expired")
		}
		return nil, fmt.Errorf("failed to get reset token: %w", err)
	}
	return &resetToken, nil
}

// UseResetToken marks a reset token as used
func (r *UserRepository) UseResetToken(tokenID uuid.UUID) error {
	if err := r.db.Model(&models.ResetToken{}).Where("id = ?", tokenID).Update("used_at", "NOW()").Error; err != nil {
		return fmt.Errorf("failed to mark reset token as used: %w", err)
	}
	return nil
}

// DeleteExpiredResetTokens deletes expired reset tokens
func (r *UserRepository) DeleteExpiredResetTokens() error {
	if err := r.db.Delete(&models.ResetToken{}, "expires_at < NOW()").Error; err != nil {
		return fmt.Errorf("failed to delete expired reset tokens: %w", err)
	}
	return nil
}