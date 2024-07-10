#!/bin/bash

echo "Deleting all tags from the repository..."
git tag | xargs git tag -d
echo "All tags have been deleted."
