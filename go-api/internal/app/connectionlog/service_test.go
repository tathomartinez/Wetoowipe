package connectionlog

import (
	"go-api/internal/domain"
	"testing"
)

type mockRepository struct {
	entries []domain.ConnectionLogEntry
}

func (m *mockRepository) InsertConnectionLog(entry domain.ConnectionLogEntry) error {
	m.entries = append(m.entries, entry)
	return nil
}

func TestLogConnection(t *testing.T) {
	repo := &mockRepository{}
	service := NewService(repo)

	t.Run("logs join event successfully", func(t *testing.T) {
		err := service.LogConnection("user123", "channel456", "guild789", "join")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if len(repo.entries) != 1 {
			t.Fatalf("expected 1 entry, got %d", len(repo.entries))
		}
		entry := repo.entries[0]
		if entry.UserID != "user123" {
			t.Errorf("expected UserID user123, got %s", entry.UserID)
		}
		if entry.ChannelID != "channel456" {
			t.Errorf("expected ChannelID channel456, got %s", entry.ChannelID)
		}
		if entry.GuildID != "guild789" {
			t.Errorf("expected GuildID guild789, got %s", entry.GuildID)
		}
		if entry.EventType != "join" {
			t.Errorf("expected EventType join, got %s", entry.EventType)
		}
		if entry.Timestamp.IsZero() {
			t.Error("expected non-zero timestamp")
		}
	})

	t.Run("logs leave event successfully", func(t *testing.T) {
		err := service.LogConnection("user456", "channel789", "guild789", "leave")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if len(repo.entries) != 2 {
			t.Fatalf("expected 2 entries, got %d", len(repo.entries))
		}
		entry := repo.entries[1]
		if entry.EventType != "leave" {
			t.Errorf("expected EventType leave, got %s", entry.EventType)
		}
	})
}
