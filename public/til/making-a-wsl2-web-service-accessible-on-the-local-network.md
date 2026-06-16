---
slug: making-a-wsl2-web-service-accessible-on-the-local-network
title: Making a WSL2 Web Service Accessible on the Local Network
date: 2025-05-13
tags: 
description: I’m running a web service inside a Docker container on WSL2 (using Arch Linux). The Docker container publishes port 80. On the Windows host, I can access the…
---
I’m running a web service inside a Docker container on WSL2 (using Arch Linux). The Docker container publishes port 80. On the Windows host, I can access the service using `http://localhost`, but I can’t reach it using the Windows host’s IP address from other computers on the same local network. This happens because WSL2 uses a virtual network interface, which makes things tricky. After some trial and error, I figured out how to make it work. Here’s what I did.
## Steps
### Create an Inbound Firewall Rule for Specific Ports

To allow traffic from other computers, I added a firewall rule on the Windows host to permit incoming connections on certain ports.

Run this command in PowerShell (as Administrator):

```powershell
New-NetFirewallRule -DisplayName "WSL2 Port Bridge" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80,443,10000,3000,5000
```

This rule opens ports 80, 443, 10000, 3000, and 5000 for TCP traffic.

> **Note:** Sometimes the firewall rule doesn’t work right away. Check the Windows Defender Firewall settings to make sure it’s active. You might need to recheck it if there’s a problem.
### Set Up Port Forwarding with `netsh interface portproxy`

WSL2 has its own IP address, separate from the Windows host. To connect the Windows host’s IP to the WSL2 service, I used the `netsh interface portproxy` command. This forwards traffic from the Windows host to the WSL2 instance.

Run this in PowerShell (as Administrator):

```powershell
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=192.168.48.167
```

- `listenport=80`: The port the Windows host listens on.
- `listenaddress=0.0.0.0`: Accepts connections from any IP (like other computers on the network).
- `connectport=80`: The port the WSL2 service uses.
- `connectaddress=192.168.48.167`: The WSL2 IP address.

> **Important:** Replace `192.168.48.167` with your WSL2 IP address. To find it, run `ip addr` inside WSL2 and look for the IP under `eth0`. This IP can change, so check it again if the connection stops working.
### (Optional) Adjust Hyper-V Firewall Settings

WSL2 runs on Hyper-V, so I tried a command to allow inbound connections through the Hyper-V firewall. I’m not sure if this is necessary, but it might help if the service still isn’t accessible.

Run this in PowerShell (as Administrator):

```powershell
Set-NetFirewallHyperVVMSetting -Name '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -DefaultInboundAction Allow
```

## Useful Resources

- [Windows WSL Networking Documentation](https://learn.microsoft.com/en-us/windows/wsl/networking)
- [Netsh Interface Portproxy Details](https://learn.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-interface-portproxy)
- [Hyper-V Firewall Info](https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/hyper-v-firewall)
