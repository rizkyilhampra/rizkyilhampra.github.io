---
slug: how-to-combine-two-repository-with-unrelated-history
title: How to combine two repository with unrelated history and keep upcoming changes
date: 2024-11-22
tags: 
description: Do this in the repository that will receive the changes from the other repository.
---
Do this in the repository that will receive the changes from the other repository.

```bash
git merge --squash --allow-unrelated-histories -X theirs branch-name
```
