"""Run Binexa's local LibreTranslate service without logging translated text.

Use the isolated Python environment described in TRANSLATION_SETUP.md.
"""
import logging
import os
import sys

for variable, directory in [
    ('XDG_DATA_HOME', '/tmp/binexa-libre-data'),
    ('XDG_CONFIG_HOME', '/tmp/binexa-libre-config'),
    ('XDG_CACHE_HOME', '/tmp/binexa-libre-cache'),
]:
    os.environ.setdefault(variable, directory)

# Argos logs source text and output at INFO by default. Keep warnings/errors only.
logging.disable(logging.INFO)

from libretranslate.main import main  # noqa: E402

if __name__ == '__main__':
    sys.argv = [sys.argv[0], '--host', '127.0.0.1', '--port', '5100',
                '--load-only', 'en,zh,vi,es', '--batch-limit', '80',
                '--char-limit', '12000', '--req-limit', '60',
                '--disable-files-translation', '--disable-web-ui', *sys.argv[1:]]
    main()
