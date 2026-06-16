---
slug: freeze-or-hang-randomly-on-arch-linux-with-hyprland
title: Freeze or Hang Randomly on Arch Linux with Hyprland
date: 2025-02-16
tags: linux
description: - Arch Wiki - Github Issue
---
## Related Issue

- [Arch Wiki](https://bbs.archlinux.org/viewtopic.php?pid=2223890#p2223890)
- [Github Issue](https://github.com/hyprwm/Hyprland/issues/8930)

## Workaround

Following [this comment](https://github.com/hyprwm/Hyprland/issues/8930#issuecomment-2613358236), it's say that we need to [downgrade](/til/downgrade-arch-linux-installed-package) to `mesa=24.2.7`, `vulkan-radeon=24.2.7` and `llvm-libs=18.1.8-5`.
