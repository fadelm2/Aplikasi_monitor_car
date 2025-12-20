package usecase

import (
	"errors"
	"fleet-monitor/internal/config"
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase interface {
	Login(req model.LoginRequest) (*model.LoginResponse, error)
	Register(req model.RegisterRequest) (*model.UserResponse, error)
}

type authUsecase struct {
	userRepo repository.UserRepository
	config   *config.Config
}

func NewAuthUsecase(userRepo repository.UserRepository, cfg *config.Config) AuthUsecase {
	return &authUsecase{
		userRepo: userRepo,
		config:   cfg,
	}
}

func (u *authUsecase) Login(req model.LoginRequest) (*model.LoginResponse, error) {
	user, err := u.userRepo.FindByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid username or password")
	}

	expiresAt := time.Now().Add(time.Duration(u.config.JWTExpireHours) * time.Hour)

	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      expiresAt.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(u.config.JWTSecret))
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	return &model.LoginResponse{
		Token:     tokenString,
		ExpiresAt: expiresAt.Unix(),
		User: model.UserResponse{
			ID:       user.ID,
			Username: user.Username,
			Role:     user.Role,
		},
	}, nil
}

func (u *authUsecase) Register(req model.RegisterRequest) (*model.UserResponse, error) {
	existing, _ := u.userRepo.FindByUsername(req.Username)
	if existing != nil {
		return nil, errors.New("username already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	role := req.Role
	if role == "" {
		role = "admin"
	}

	user := &entity.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := u.userRepo.Create(user); err != nil {
		return nil, errors.New("failed to create user")
	}

	return &model.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Role:     user.Role,
	}, nil
}
