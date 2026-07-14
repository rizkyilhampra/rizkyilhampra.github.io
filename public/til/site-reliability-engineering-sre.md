---
slug: site-reliability-engineering-sre
title: Site Reliability Engineering (SRE)
date: 2025-11-25
tags: devops, observability
description: By Amazon (AWS), SRE is the practice of using software tools to automate IT infrastructure tasks such as system management and application monitoring.[^aws]…
---
By Amazon (AWS), SRE is the practice of using software tools to automate IT infrastructure tasks such as system management and application monitoring.[^aws] It's really related with SLAs, SLIs, and SLOs. 

SRE helps software development teams by providing metrics, logs, and traces as part of observability. Monitoring, in the SRE context, means collecting critical information that reflects system performance. The metrics SRE teams monitor are chosen by developers, who decide which parameters are critical to an application's health. These typically include latency, traffic, errors, and saturation (the "four golden signals"), which together give insight into the system's reliability.

SRE is essentially the practical implementation of DevOps.

[^aws]: AWS – *What is Site Reliability Engineering (SRE)?*. https://aws.amazon.com/what-is/sre/ (accessed 2025‑11‑25).
