#!/usr/bin/env bash
cd "$(dirname "$0")"
ELECTRON_RUN_AS_NODE=1 $(npm bin)/electron dist/index.js $@
