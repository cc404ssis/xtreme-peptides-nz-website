#!/bin/bash
# Railway deploy protocol wrapper for xtreme-peptides-nz-website.
# Delegates to the global deploy script.
exec bash ~/.claude/scripts/railway-deploy.sh "$@"
