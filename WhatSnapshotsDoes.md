# What I want this to do

## Script name
```bash
snapshots/snap.js
```

## Features

- Run the script with: 
```bash 
# Change directory to the snapshots folder
cd snapshot
# Run the snap.js script
npm run snap
# Return to the root directory of the project being used in
cd ..
```
- it to be setup to be published to npm so I can install this in all of my projects that I want this feature available while developing.
- Creates a complete backup or snapshot of the project at the state when it is run

## Exclude these files

- Creates a backup markdown file (example: snap-Sat-11-22-2025--5-55-am.md)
- Adds a title of the project (the root Folder name normalized for human reading) followed by (human readable date: Sat, November 22, 2025 @ 5:55am)
- Creates a file tree of the project in its current state when running and displays it at the top of the file
- What ever is in the .gitignore file (project root directory) are the files that I want this script to ignore or exclude from the backup/snapshot
- Saves to a date folder (Sat-11-22-2025) and if the current date does not exist within the snapshots directory, then the snap.js creates it, then saves to it in the file format above

