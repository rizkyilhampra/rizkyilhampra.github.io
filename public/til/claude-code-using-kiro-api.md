---
slug: claude-code-using-kiro-api
title: Claude Code using Kiro API
date: 2026-06-08
tags: work
description: Shout out who writing this post https://dev.to/aws-heroes/the-aws-dev-setup-nobody-told-you-about-claude-code-kiro-pro-and-agent-plugins-1c3p by Vivok V. But…
---
Shout out who writing this post https://dev.to/aws-heroes/the-aws-dev-setup-nobody-told-you-about-claude-code-kiro-pro-and-agent-plugins-1c3p by [Vivok V](https://dev.to/vivek-aws). But why not using the actual Kiro CLI? Well the agents and skills and convinience it's on Claude Code, I don't want like change the habbits. 

Here is what would i do at today.  
1. Ensure had already installed Kiro CLI and being authenticated as well.
2. Clone and installing deps of jwadow/kiro-gateway
    ```bash
    git clone --depth=1 https://github.com/jwadow/kiro-gateway ~/kiro-gateway
    cd ~/kiro-dateway
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    ```
3. Configure the `.env` at `~/kiro-gateway`
    ```bash
    PROXY_API_KEY="kiro-local-proxy-key"
    KIRO_CLI_DB_FILE="/home/airi/.local/share/kiro-cli/data.sqlite3"
    SERVER_HOST="127.0.0.1"
    SERVER_PORT="9000"
    ```
    > You may need to change the `airi` (hostname) or the path following your system
4. Start the `kiro-gateway`
    ```bash
    ~/kiro-gateway/.venv/bin/python ~/kiro-gateway/main.py --port 9000
    ```
5. Pointing Claude Code to use that instead default API or base url
    ```bash
      "env": {
        "ANTHROPIC_BASE_URL": "http://127.0.0.1:9000",
        "ANTHROPIC_API_KEY": "kiro-local-proxy-key",
        "ANTHROPIC_MODEL": "claude-opus-4-7"
      }
    ```
