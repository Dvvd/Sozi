
from datetime import datetime

env = Environment()

sozi_version = datetime.utcnow().strftime("%y.%m-%d%H%M%S")
Export("sozi_version")

license_files = Glob("doc/*-license.txt")
Export("license_files")

SConscript("player/SConscript", variant_dir="build/player")
SConscript("editors/SConscript", variant_dir="build/editors")
