#!/bin/bash

# PRODUCTION
git rest --hard
git checkout master
git pull origin master

docker compose up -d