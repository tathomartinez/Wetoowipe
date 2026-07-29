package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type ConnectionLogEntry struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"-"`
	IP        string        `bson:"ip" json:"ip"`
	UserID    string        `bson:"user_id" json:"user_id"`
	ChannelID string        `bson:"channel_id" json:"channel_id"`
	GuildID   string        `bson:"guild_id" json:"guild_id"`
	EventType string        `bson:"event_type" json:"event_type"`
	Timestamp time.Time     `bson:"timestamp" json:"timestamp"`
}
