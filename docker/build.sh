#!/bin/bash

# Exit if there's some error in build
set -e

# Build all subdirectories
for file in ./*; do
	if [[ -d $file && -f ${file}/docker-compose.yml ]]; then
		pushd $file
		docker-compose build
		popd
	fi
done

# Run all subdirectories, as there are no build errors. 
for file in ./*; do
	if [[ -d $file && -f ${file}/docker-compose.yml ]]; then
		pushd $file
		docker-compose up -d
		popd
	fi
done

