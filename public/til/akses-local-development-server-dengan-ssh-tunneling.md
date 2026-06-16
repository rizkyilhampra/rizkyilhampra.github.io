---
slug: akses-local-development-server-dengan-ssh-tunneling
title: Akses local development server dengan ssh tunneling
date: 2025-10-13
tags: ssh, cheatsheets
description: Tulisan ini didasari kebutuhan saya untuk mengakses PC kantor yang disana terdapat local development server yang sedang berjalan. Sebelum mengetahui langkah…
---
Tulisan ini didasari kebutuhan saya untuk mengakses PC kantor yang disana terdapat *local development server* yang sedang berjalan. Sebelum mengetahui langkah ini, saya biasanya melakukan *tunnneling* menggungkan `cloudflared`. Itu mengharuskan saya untuk membuat domain baru dan *mapping* *port* yang ingin digunakan agar saya dapat mengakses *web* atau aplikasi tersebut secara jarak jauh (diluar dari *local area network*). Setelah terbesit suatu pertanyaan, mungkinkah kita *tunnneling* dengan hanya bermodal SSH saja yang telah terkoneksi, sehingga kita hanya buka atau cukup *mapping* *port* 22 saja? Ternyata bisa. 

```bash
ssh -fN -o ExitOnForwardFailure=yes -L 3000:localhost:3000 user@192.168.1.68
```

> *You can see detail breakdown of what's flags does at `man` pages*

> Singkatnya perintah di atas akan melakukan *port forwarding* dari `localhost:3000` (`192.168.1.68`) ke *port* `3000` pada *host* saat ini, dan menjalankannya di sisi *background*.

> Untuk menghentikannya, dapat melakukan salah satu dari perintah berikut.
> ```bash
> pkill -f 'ssh -fN -L 3000:localhost:3000 user@192.168.1.68'
> ``` 
>
>  atau 
>
> ```bash
> ps aux | grep 'ssh -fN -L 3000:localhost:3000'
> ```
>
> yang kemudian dilanjutkan dengan `kill <pid>`

atau di *foreground*

```bash
ssh -L 3000:localhost:3000 user@192.168.1.68
```

> Perintah di atas akan membuka *shell* baru (layaknya `ssh` pada umumnya) namun dengan melakukan *port forwarding* yang sama seperti sebelumnya tapi di belakang layar.
