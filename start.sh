#!/usr/bin/env bash
TARGET_FILE=$0

cd `dirname $TARGET_FILE`
TARGET_FILE=`basename $TARGET_FILE`

while [ -L "$TARGET_FILE" ]
do
    TARGET_FILE=`readlink $TARGET_FILE`
    cd `dirname $TARGET_FILE`
    TARGET_FILE=`basename $TARGET_FILE`
done

PHYS_DIR=`pwd -P`
RESULT=$PHYS_DIR/$TARGET_FILE
cd "$(dirname $RESULT)"

ELECTRON_RUN_AS_NODE=1 $(npm bin)/electron dist/index.js $@
