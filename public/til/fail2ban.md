---
slug: fail2ban
title: Fail2ban
date: 2026-04-27
tags: 
description: Had issue with ssh bruteforce that's make my on-premise server (computer) being uncompromised then caused hang. We can leverage this like service to like ban,…
---
Had issue with ssh bruteforce that's make my on-premise server (computer) being uncompromised then caused hang. We can leverage this like service to like ban, so prevent next access being process again and again even tho it's failed.
## Debian 12 
My on-premise server it's ran debian 12 bookworm. Here is some step I do.
```sh
sudo apt install fail2ban
```

```sh
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```
## Fail2ban UI
Look nice if we have or can able doing config with nice UI or through web browser. Then here is what I found [swissmakers/fail2ban-ui](https://github.com/swissmakers/fail2ban-ui/). I don't need to like following what's common tutorial I have seen that's need to local copied configuration fail2ban had. I just copied the `docker-compose.yml` then map the port and ready to go. By default 'jail' it's configured for `sshd`.
## 'allowipv6' not defined in 'Definition'
Fail2ban it's not working or start on Debian 12. One of the err it's looks above the title. We can leverage this to fix it.
```sh
echo "sshd_backend = systemd" >> /etc/fail2ban/paths-debian.conf
systemctl restart fail2ban
```
