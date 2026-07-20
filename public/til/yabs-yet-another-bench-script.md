---
slug: yabs-yet-another-bench-script
title: YABS (Yet Another Bench Script)
date: 2026-07-20
tags: vps, devops, cheatsheets
description: YABS (Yet Another Bench Script), written by Mason Rowe, is a popular one-liner for benchmarking a freshly provisioned VPS. Run it with:
---
YABS (Yet Another Bench Script), written by Mason Rowe, is a popular one-liner for benchmarking a freshly provisioned VPS. Run it with:

```bash
curl -sL yabs.sh | bash
```

It measures CPU performance (both single- and multi-threaded), disk I/O through `dd` and `fio`, network throughput via `iperf3` to several locations, and a Geekbench score when the binary is reachable. 

Source: [Github](https://github.com/masonr/yet-another-bench-script)
