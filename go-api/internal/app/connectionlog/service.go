package connectionlog

import (
	"go-api/internal/domain"
	"time"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) LogConnection(ip, userID, channelID, guildID, eventType string) error {
	entry := domain.ConnectionLogEntry{
		IP:        ip,
		UserID:    userID,
		ChannelID: channelID,
		GuildID:   guildID,
		EventType: eventType,
		Timestamp: time.Now(),
	}
	return s.repo.InsertConnectionLog(entry)
}
