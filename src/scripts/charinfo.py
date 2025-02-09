import json
import sys
import unicodedata


text = sys.stdin.read()

names = []
for char in text:
    names.append(unicodedata.name(char, "Name not found."))

names = json.dumps(names)

print(names)
