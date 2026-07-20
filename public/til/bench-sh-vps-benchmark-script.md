---
slug: bench-sh-vps-benchmark-script
title: bench.sh (Teddysun VPS Benchmark)
date: 2026-07-20
tags: vps, devops, cheatsheets
description: bench.sh is a long-standing VPS benchmark script by Teddysun. Run it with:
---
bench.sh is a long-standing VPS benchmark script by Teddysun. Run it with:

```bash
curl -Lso- bench.sh | bash
```

It prints basic system info (CPU, memory, uptime, OS), runs a simple disk I/O test, and speed-tests the network against multiple global locations. 

Source: [Github](https://github.com/teddysun/across/blob/master/bench.sh), [Web](https://bench.sh/en.html)
