---
slug: mengatasi-web-page-selalu-minta-translate-chrome
title: Mengatasi Web Page Selalu Minta Translate (Chrome)
date: 2026-07-25
tags: frontend, cheatsheets
description: Hal ini akan sangat mengganggu jika web page yang kita buat adalah untuk signage. Mungkin kita tidak menyadari terlebih jika AI agent atau model AI yang kita…
---
Hal ini akan sangat mengganggu jika web page yang kita buat adalah untuk *signage*. Mungkin kita tidak menyadari terlebih jika AI agent atau model AI yang kita gunakan, tidak paham akan konteks ini. Sehingga ia akan menulis seperti ini.
```html
<html lang="id">
```
Yang mana ini akan membuat Chrome otomatis menampilkan *popup* "Apakah ingin mentranslate ini ke English?". Perbaikannya hanya dengan mengganti ke `en-US`.
```html
<html lang="en-US">
```
Hal ini akan membuat *content page* adalah *english* dan Chrome tidak akan komplain lagi.
