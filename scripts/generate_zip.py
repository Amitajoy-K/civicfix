import os
import sys
import time
import zipfile
import shutil

def generate_clean_zip():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    os.chdir(base_dir)

    zip_filename = 'civicfix-app.zip'
    public_zip = os.path.join(base_dir, 'public', 'civicfix-app.zip')

    excluded_dirs = {
        'node_modules', '.git', 'dist', '.cache', 'target', 
        '__pycache__', '.temp', '.idea', '.vscode'
    }
    excluded_files = {
        'civicfix-app.zip', 'civicfix-smart-city-app.zip', 'test_win.zip'
    }

    written_dirs = set()

    # Create temporary zip first to ensure atomicity
    temp_zip = 'civicfix-app.temp.zip'
    if os.path.exists(temp_zip):
        os.remove(temp_zip)

    with zipfile.ZipFile(temp_zip, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for root, dirs, files in os.walk('.'):
            # Exclude unwanted directories
            dirs[:] = [d for d in dirs if d not in excluded_dirs and not d.startswith('.')]
            dirs.sort()
            files.sort()

            rel_root = os.path.relpath(root, '.').replace('\\', '/')
            if rel_root != '.':
                parts = rel_root.split('/')
                accum = ''
                for part in parts:
                    accum = f'{accum}{part}/' if accum else f'{part}/'
                    if accum not in written_dirs:
                        written_dirs.add(accum)
                        dir_info = zipfile.ZipInfo(accum)
                        # Unix dir permissions 0755 + MS-DOS directory flag 0x10
                        dir_info.external_attr = (0o40755 << 16) | 0x10
                        dir_info.file_size = 0
                        dir_info.compress_type = zipfile.ZIP_STORED
                        dir_info.date_time = time.localtime(time.time())[:6]
                        zf.writestr(dir_info, '')

            for file in files:
                if file in excluded_files or file.endswith('.zip'):
                    continue
                file_path = os.path.join(root, file)
                rel_file = os.path.relpath(file_path, '.').replace('\\', '/')

                # Ensure parent directory entry exists
                parent_dir = os.path.dirname(rel_file)
                if parent_dir:
                    parts = parent_dir.split('/')
                    accum = ''
                    for part in parts:
                        accum = f'{accum}{part}/' if accum else f'{part}/'
                        if accum not in written_dirs:
                            written_dirs.add(accum)
                            dir_info = zipfile.ZipInfo(accum)
                            dir_info.external_attr = (0o40755 << 16) | 0x10
                            dir_info.file_size = 0
                            dir_info.compress_type = zipfile.ZIP_STORED
                            dir_info.date_time = time.localtime(time.time())[:6]
                            zf.writestr(dir_info, '')

                with open(file_path, 'rb') as f:
                    content = f.read()

                mtime = os.path.getmtime(file_path)
                file_info = zipfile.ZipInfo(rel_file)
                # Unix regular file 0644 + MS-DOS archive flag 0x20
                file_info.external_attr = (0o100644 << 16) | 0x20
                file_info.compress_type = zipfile.ZIP_DEFLATED
                file_info.date_time = time.localtime(mtime)[:6]
                zf.writestr(file_info, content)

    # Replace target file
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
    os.rename(temp_zip, zip_filename)

    # Ensure public folder copy
    os.makedirs(os.path.dirname(public_zip), exist_ok=True)
    shutil.copyfile(zip_filename, public_zip)

    file_size = os.path.getsize(zip_filename)
    print(f'Successfully built Windows-compatible ZIP: {zip_filename} ({file_size} bytes, {len(written_dirs)} directories)')

if __name__ == '__main__':
    generate_clean_zip()
