package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// BaseModel contains common columns for all tables
type BaseModel struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CreatedAt time.Time      `json:"created_at" gorm:"not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"not null;default:CURRENT_TIMESTAMP"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// User represents a user in the system
type User struct {
	BaseModel
	Email           string         `json:"email" gorm:"uniqueIndex;not null;size:255"`
	PasswordHash    string         `json:"-" gorm:"not null;size:255"`
	FirstName       string         `json:"first_name" gorm:"size:100"`
	LastName        string         `json:"last_name" gorm:"size:100"`
	DateOfBirth     *time.Time     `json:"date_of_birth"`
	Gender          *string        `json:"gender" gorm:"size:20"`
	AvatarURL       *string        `json:"avatar_url" gorm:"size:500"`
	PhoneNumber     *string        `json:"phone_number" gorm:"size:20"`
	IsEmailVerified bool           `json:"is_email_verified" gorm:"default:false"`
	IsActive        bool           `json:"is_active" gorm:"default:true"`
	LastLoginAt     *time.Time     `json:"last_login_at"`
	StyleDNA        *StyleDNA      `json:"style_dna,omitempty" gorm:"foreignKey:UserID"`
	Products        []Product      `json:"products,omitempty" gorm:"foreignKey:UserID"`
	Outfits         []Outfit       `json:"outfits,omitempty" gorm:"foreignKey:UserID"`
	Invitations     []Invitation   `json:"invitations,omitempty" gorm:"foreignKey:UserID"`
	ResetTokens     []ResetToken   `json:"-" gorm:"foreignKey:UserID"`
}

// StyleDNA represents a user's style preferences and characteristics
type StyleDNA struct {
	BaseModel
	UserID          uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;uniqueIndex"`
	User            User           `json:"-" gorm:"foreignKey:UserID"`
	StyleType       string         `json:"style_type" gorm:"size:50"` // e.g., "minimalist", "bohemian", "classic"
	ColorPalette    pq.StringArray `json:"color_palette" gorm:"type:text[]"`
	PreferredBrands pq.StringArray `json:"preferred_brands" gorm:"type:text[]"`
	BodyType        *string        `json:"body_type" gorm:"size:50"`
	Lifestyle       *string        `json:"lifestyle" gorm:"size:100"` // e.g., "professional", "casual", "active"
	BudgetRange     *string        `json:"budget_range" gorm:"size:50"` // e.g., "low", "medium", "high"
	TestResults     *string        `json:"test_results" gorm:"type:jsonb"` // Store full test results as JSON
	CompletedAt     *time.Time     `json:"completed_at"`
}

// Category represents a product category
type Category struct {
	BaseModel
	Name        string     `json:"name" gorm:"uniqueIndex;not null;size:100"`
	Slug        string     `json:"slug" gorm:"uniqueIndex;not null;size:100"`
	Description *string    `json:"description" gorm:"type:text"`
	ImageURL    *string    `json:"image_url" gorm:"size:500"`
	ParentID    *uuid.UUID `json:"parent_id" gorm:"type:uuid"`
	Parent      *Category  `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children    []Category `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	Products    []Product  `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
	SortOrder   int        `json:"sort_order" gorm:"default:0"`
	IsActive    bool       `json:"is_active" gorm:"default:true"`
}

// Product represents a clothing item or accessory
type Product struct {
	BaseModel
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	User        User           `json:"-" gorm:"foreignKey:UserID"`
	CategoryID  uuid.UUID      `json:"category_id" gorm:"type:uuid;not null;index"`
	Category    Category       `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Name        string         `json:"name" gorm:"not null;size:200"`
	Description *string        `json:"description" gorm:"type:text"`
	Brand       *string        `json:"brand" gorm:"size:100"`
	Color       string         `json:"color" gorm:"not null;size:50"`
	Size        *string        `json:"size" gorm:"size:20"`
	Price       *float64       `json:"price" gorm:"type:decimal(10,2)"`
	Currency    *string        `json:"currency" gorm:"size:3;default:'TRY'"`
	PurchaseDate *time.Time    `json:"purchase_date"`
	Images      []ProductImage `json:"images,omitempty" gorm:"foreignKey:ProductID"`
	Tags        pq.StringArray `json:"tags" gorm:"type:text[]"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	IsFavorite  bool           `json:"is_favorite" gorm:"default:false"`
	WearCount   int            `json:"wear_count" gorm:"default:0"`
	LastWornAt  *time.Time     `json:"last_worn_at"`
	// Vector embedding for similarity search (using pgvector)
	Embedding   *string        `json:"-" gorm:"type:vector(512)"` // 512-dimensional vector
}

// ProductImage represents an image associated with a product
type ProductImage struct {
	BaseModel
	ProductID   uuid.UUID `json:"product_id" gorm:"type:uuid;not null;index"`
	Product     Product   `json:"-" gorm:"foreignKey:ProductID"`
	URL         string    `json:"url" gorm:"not null;size:500"`
	ThumbnailURL *string  `json:"thumbnail_url" gorm:"size:500"`
	AltText     *string   `json:"alt_text" gorm:"size:200"`
	SortOrder   int       `json:"sort_order" gorm:"default:0"`
	IsPrimary   bool      `json:"is_primary" gorm:"default:false"`
}

// Outfit represents a combination of products
type Outfit struct {
	BaseModel
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	User        User           `json:"-" gorm:"foreignKey:UserID"`
	Name        string         `json:"name" gorm:"not null;size:200"`
	Description *string        `json:"description" gorm:"type:text"`
	Occasion    *string        `json:"occasion" gorm:"size:100"` // e.g., "work", "casual", "formal"
	Season      *string        `json:"season" gorm:"size:20"`    // e.g., "spring", "summer", "fall", "winter"
	Weather     *string        `json:"weather" gorm:"size:50"`   // e.g., "sunny", "rainy", "cold"
	Products    []Product      `json:"products,omitempty" gorm:"many2many:outfit_products;"`
	ImageURL    *string        `json:"image_url" gorm:"size:500"`
	Tags        pq.StringArray `json:"tags" gorm:"type:text[]"`
	IsPublic    bool           `json:"is_public" gorm:"default:false"`
	IsFavorite  bool           `json:"is_favorite" gorm:"default:false"`
	WearCount   int            `json:"wear_count" gorm:"default:0"`
	LastWornAt  *time.Time     `json:"last_worn_at"`
	Rating      *int           `json:"rating" gorm:"check:rating >= 1 AND rating <= 5"`
}

// Invitation represents a beta invitation
type Invitation struct {
	BaseModel
	UserID      *uuid.UUID `json:"user_id" gorm:"type:uuid;index"`
	User        *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Email       string     `json:"email" gorm:"uniqueIndex;not null;size:255"`
	Code        string     `json:"code" gorm:"uniqueIndex;not null;size:50"`
	Status      string     `json:"status" gorm:"not null;size:20;default:'pending'"` // pending, accepted, expired
	InvitedBy   *uuid.UUID `json:"invited_by" gorm:"type:uuid"`
	Inviter     *User      `json:"inviter,omitempty" gorm:"foreignKey:InvitedBy"`
	ExpiresAt   time.Time  `json:"expires_at" gorm:"not null"`
	AcceptedAt  *time.Time `json:"accepted_at"`
	Message     *string    `json:"message" gorm:"type:text"`
}

// ResetToken represents a password reset token
type ResetToken struct {
	BaseModel
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	User      User      `json:"-" gorm:"foreignKey:UserID"`
	Token     string    `json:"token" gorm:"uniqueIndex;not null;size:255"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	UsedAt    *time.Time `json:"used_at"`
}

// OutfitProduct represents the many-to-many relationship between outfits and products
type OutfitProduct struct {
	OutfitID  uuid.UUID `json:"outfit_id" gorm:"type:uuid;primaryKey"`
	ProductID uuid.UUID `json:"product_id" gorm:"type:uuid;primaryKey"`
	CreatedAt time.Time `json:"created_at" gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// TableName sets the table name for OutfitProduct
func (OutfitProduct) TableName() string {
	return "outfit_products"
}