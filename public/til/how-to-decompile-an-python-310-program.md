---
slug: how-to-decompile-an-python-310-program
title: How to decompile an python 3.10 program
date: 2025-09-13
tags: 
description: Saya mulai ini dari di tempat saya bekerja, saya butuh mendapatkan bagaimana caranya suatu aplikasi dengan ektensi .exe bekerja. Ya, dengan meminta bantuan…
---
Saya mulai ini dari di tempat saya bekerja, saya butuh mendapatkan bagaimana caranya suatu aplikasi dengan ektensi .exe bekerja. Ya, dengan meminta bantuan langsung atau menghubungi pihak yang berkaitan langsung dengan aplikasi tersebut untuk mempertanyakan pertanyaan demikian nampaknya sangat mudah, namun saya rasa tidak. Itu mungkin membutuhkan waktu yang lama dan kemungkinan untuk mendapatkan dokumentasinya bisa di angka 50%, terlebih belum dengan tetek bengek lainnya yang akan makan waktu dan tenaga juga. Maka dari itu saya berangkat dari "Bagaimana jika kita reverse engineering aplikasi ini?" munculah ide untuk mencari-cari informasi (basically this is just chatting with gpt-5 model tho) dan setelah beberapa *trial and error* saya berhasil untuk *decompile basically an python program but it's like compile to an windows program (.exe)*. Berikut adalah tulisan atau panduan atau mungkin *step by step* bagaimana saya melakukannya di Arch Linux.
## Requirements
*Needs to install*
- `uv`
- `libxcrypt-compat`

## How to 
1. Install python 3.10.0 with uv command

```bash
uv python install 3.10.0
```

2.  Create an self python 3.10.0 environment  

```bash
uv venv -p 3.10.0 .venv3100
```

3. Activate the environment or source it

```bash
source .venv3100/bin/activate.fish
```

4.  Ensure it's python 3.10.0

```bash
python -V
```

5. Install or upgrade pip in that environment

```bash
python -m ensurepip --upgrade
```

6. Install or upgrade toolchain

```bash
python -m pip install -U pip wheel setuptools
```

7. Install or upgrade the `pyinstxtractor-ng` 

```bash
python -m pip install -U pyinstxtractor-ng
````

8. Extract the `.exe`

```bash
pyinstxtractor-ng program-name.exe
```

9. Check the extracted folder

```bash
ls program-name.exe_extracted/
```

10. Extract the PYZ ones if it's have

```bash
pyinstxtractor-ng program-name.exe_extracted/PYZ-00.pyz
```

11. Install `pycdc` patched by me 

> Cause the main [pycdc](https://github.com/zrax/pycdc) it's have limitation (see the [issue](https://github.com/zrax/pycdc/issues/451)), i need like patch first to make like it's decompiling successfully especially what i think it's being like trouble on python 3.10.0 base program. You can see some note in [README.md](https://github.com/rizkyilhampra/pycdc?tab=readme-ov-file#patched-fork-notice) in my fork repository to see the changes.

12. Clone the repository
   
```bash
git clone https://github.com/rizkyilhampra/pycdc.git
```
   
13.  Build the `pycdc` program
   
```bash
cmake . && make -j
```

14. Decompile

```bash
./path-where-is-pycdc-at/pycdc path-to-where-extracted-at/program-name.exe_extracted/program-name.pyc > path-to-where-decompile-file-put/program-name.py
```

15. Decompile some file (Optional)

> Here is what i do in fish shell

> You can like modification my script to fit your purpose

```bash
mkdir -p program-name.decompiled/pyz
```

```bash
set all_files progarm-name.exe_extracted/PYZ-00.pyz_extracted/config.pyc \
              program-name.exe_extracted/PYZ-00.pyz_extracted/util.pyc \
              program-name.exe_extracted/PYZ-00.pyz_extracted/test.pyc \
              (find program-name.exe_extracted/PYZ-00.pyz_extracted/src -type f -name '*.pyc')
```

```bash
set out "program-name.decompiled/pyz/"(basename (string replace -r '\.pyc$' '.py' $f))
./path-where-is-pycdc-at/pycdc $f > $out; or true
end
```
