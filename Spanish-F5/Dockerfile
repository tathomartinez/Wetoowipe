FROM pytorch/pytorch:2.4.0-cuda12.4-cudnn9-devel

ARG DEBIAN_FRONTEND=noninteractive

LABEL github_repo="https://github.com/SWivid/F5-TTS"

RUN set -x \
    && apt-get update \
    && apt-get -y install wget curl git build-essential libsndfile1-dev ffmpeg ca-certificates jq \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /var/log/apt/*

# Clone repository with git history but optimized parameters
RUN git clone --depth 1 --recursive https://github.com/jpgallegoar/Spanish-F5.git /workspace/f5-tts \
    && cd /workspace/f5-tts \
    && pip install -e . --no-cache-dir

# Modify gradio during build time for performance
RUN sed -i 's/\["hf.co", "huggingface.co"\]/["hf.co", "huggingface.co", "file-server", "localhost", "127.0.0.1"]/g' \
    /opt/conda/lib/python3.11/site-packages/gradio/processing_utils.py

ENV SHELL=/bin/bash

# Create cache volume for model downloads
VOLUME /root/.cache/huggingface/hub/

EXPOSE 7860

WORKDIR /workspace/f5-tts