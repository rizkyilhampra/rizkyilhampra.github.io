---
slug: setting-up-dns-on-my-arch-linux
title: Setting Up DNS on My Arch Linux
date: 2025-03-19
tags: linux, dns, cloudflare, blocking
description: [!NOTE] > In my case I didn't use systemd-resolved so do I now enable and start those service
---
## Why
I was tried [Glance](https://github.com/glanceapp/glance) , one of the widget is [Reddit](https://www.reddit.com) which do call of the reserved IP's from reddit for getting list of top of content of subreddit. I notice my host unable to call those IP's, so that's cause I live in the country that one of the ISP blocked access to reddit. Commonly I still able connect to reddit when using browser which do through use Cloudflare as an DNS. But now I need my network host do able connect to reddit too. So this is my writing how I was able to connect to reddit but not only those thing, but I able to change and use other DNS provider.

## Steps
### Enable and start `systemd-resolved`

> [!NOTE]
> In my case I didn't use `systemd-resolved` so do I now enable and start those service 

```bash
sudo systemctl enable systemd-resolved.service && \
sudo systemctl start systemd-resolved.service
```
### Symlink the `/etc/resolv.conf`

```bash
sudo ln -sf ../run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

### Configure the `/etc/systemd/resolved.conf`

```bash
sudoedit /etc/systemd/resolved.conf
```

Here is my following configuration I used

```conf
[Resolve]
DNS=1.1.1.1#cloudflare-dns.com 1.0.0.1#cloudflare-dns.com 2606:4700:4700::1111#cloudflare-dns.com 2606:4700:4700::1001#cloudflare-dns.com
FallbackDNS=1.1.1.1#cloudflare-dns.com 9.9.9.9#dns.quad9.net 8.8.8.8#dns.google 2606:4700:4700::1111#cloudflare-dns.com 2620:fe::9#dns.quad9.net 2001:4860:4860::8888#dns.google
DNSSEC=no
DNSOverTLS=yes
```

After change, do restart of `systemd-resolved`

```bash
sudo systemctl restart systemd-resolved.service
```

### Check If it's working
They are several ways to check, but in my case I do is
```bash
resolvctl
```
Here is what's looks like on my host
```txt
Global
           Protocols: +LLMNR +mDNS +DNSOverTLS DNSSEC=no/unsupported
    resolv.conf mode: stub
  Current DNS Server: 1.1.1.1#cloudflare-dns.com
         DNS Servers: 1.1.1.1#cloudflare-dns.com 1.0.0.1#cloudflare-dns.com
                      2606:4700:4700::1111#cloudflare-dns.com
                      2606:4700:4700::1001#cloudflare-dns.com
Fallback DNS Servers: 1.1.1.1#cloudflare-dns.com 9.9.9.9#dns.quad9.net
                      8.8.8.8#dns.google 2606:4700:4700::1111#cloudflare-dns.com
                      2620:fe::9#dns.quad9.net 2001:4860:4860::8888#dns.google

Link 2 (enp1s0f1)
    Current Scopes: none
         Protocols: -DefaultRoute +LLMNR +mDNS +DNSOverTLS DNSSEC=no/unsupported
     Default Route: no

Link 3 (wlp2s0)
    Current Scopes: DNS LLMNR/IPv4 LLMNR/IPv6 mDNS/IPv4 mDNS/IPv6
         Protocols: +DefaultRoute +LLMNR +mDNS +DNSOverTLS DNSSEC=no/unsupported
Current DNS Server: 192.168.130.196
       DNS Servers: 192.168.130.196
     Default Route: yes
```
Then do `nslookup` of blocked website, if it's didn't found the "internetpositif" thing then it's worked. Here is what's should looks like when reddit it's not blocked again

```
Server:         127.0.0.53
Address:        127.0.0.53#53

Non-authoritative answer:
www.reddit.com  canonical name = reddit.map.fastly.net.
Name:   reddit.map.fastly.net
Address: 151.101.1.140
Name:   reddit.map.fastly.net
Address: 151.101.129.140
Name:   reddit.map.fastly.net
Address: 151.101.65.140
Name:   reddit.map.fastly.net
Address: 151.101.193.140
```

Then here is what's should looks like when reddit **is blocked**.

```
Server:         192.168.130.196
Address:        192.168.130.196#53

Non-authoritative answer:
www.reddit.com  canonical name = internetpositif.ioh.co.id.
Name:   internetpositif.ioh.co.id
Address: 114.7.94.231
Name:   internetpositif.ioh.co.id
Address: 64:ff9b::7207:5ee7
```
