# ---------- Base Image (STABLE) ----------
FROM node:20-bookworm-slim

# ---------- System dependencies ----------
RUN apt-get update && apt-get install -y \
    git \
    openssh-client \
    curl \
    bash \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---------- Install code-server (official) ----------
RUN curl -fsSL https://code-server.dev/install.sh | sh

# ---------- Workspace ----------
WORKDIR /workspace

# ---------- Non-root user ----------
RUN useradd -m coder &&     \
    chown -R coder:coder /workspace

USER coder

# ---------- Expose port ----------
EXPOSE 8080

# ---------- Start code-server with password auth ----------
CMD ["sh", "-c", "code-server --bind-addr 0.0.0.0:8080 --auth password /workspace"]
