package api

import (
	"encoding/json"
	"go-api/internal/app/connectionlog"
	"log"
	"net/http"
)

type ConnectionLogHandler struct {
	service *connectionlog.Service
}

func NewConnectionLogHandler(service *connectionlog.Service) *ConnectionLogHandler {
	return &ConnectionLogHandler{service: service}
}

type voiceLogRequest struct {
	UserID    string `json:"user_id"`
	ChannelID string `json:"channel_id"`
	GuildID   string `json:"guild_id"`
	EventType string `json:"event_type"`
}

func (h *ConnectionLogHandler) LogVoiceConnection(w http.ResponseWriter, r *http.Request) {
	var req voiceLogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid JSON body")
		return
	}

	if req.ChannelID == "" {
		respondWithError(w, http.StatusBadRequest, "channel_id is required")
		return
	}
	if req.UserID == "" {
		respondWithError(w, http.StatusBadRequest, "user_id is required")
		return
	}
	if req.EventType == "" {
		respondWithError(w, http.StatusBadRequest, "event_type is required")
		return
	}
	if req.EventType != "join" && req.EventType != "leave" {
		respondWithError(w, http.StatusBadRequest, "event_type must be 'join' or 'leave'")
		return
	}

	if err := h.service.LogConnection(req.UserID, req.ChannelID, req.GuildID, req.EventType); err != nil {
		log.Printf("Error logging voice connection: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to log connection")
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]string{"status": "ok"})
}
