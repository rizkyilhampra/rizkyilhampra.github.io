---
slug: steps-i-do-when-extending-or-resizing-a-vm-disk-in-proxmox
title: Steps I do when extending or resizing a VM disk in Proxmox
date: 2025-11-07
tags: proxmox
description: Go to storage on main node or node you are working on. In my case it's local (server). > server is the node.
---
## Preq
Download the [GParted ISO](https://sourceforge.net/projects/gparted/).
## Steps

Go to storage on main node or node you are working on. In my case it's `local (server)`.
> `server` is the node.



Go to **ISO Images** tab. The UI would looks like this. 
> Cause i have some ISO had uploaded before, then that's way you are see there are some ones.



Click an button **Upload** then select the ISO file, then click the **Upload**  button at bottom, then wait until uploading process it's finish.



Select the VM you are working on. In my case `103 (debian)`. Go to **Hardware** tab.


Find **CD/DVD Drive** then click the **Edit** button. You are see the popup occur. Select the ISO file (gparted) then click **OK**.



Then go to **Options** tab.



Double click **Boot Order** then reorder  to make the **CD/DVD Drive** it's on top, then click **OK**.



After that, you can do shutdown then start again the VM. It will bot the GParted. The next step just follow the process. Till the GUI it's occur. You can basically doing same thing like in Windows, which just drag and drop till the root (/) partition it's filling up with the free space. After everything it's done. You can go back change the boot to like before do, then doing shutdown and start again.

### Swap partition

If you was remove the swap partition like i did, here is what i do.
#### Find the new UUID

```bash
sudo blkid
```

> It does display information about all block devices include the UUID.

#### Change the UUID in `/etc/fstab`

```bash
sudoedit /etc/fstab
```

> Following your `$EDITOR`, by default it will use `nano`

#### Enable swap

```bash
sudo swapon -a
```

> `-a` it will scan swap things in `/etc/fstab`

### Verify

Maybe you want to see it's swap it's active and the root (/) partition it's basically filling up.

```bash
df -h  # Check root partition size
free -h  # Check swap is active
```
