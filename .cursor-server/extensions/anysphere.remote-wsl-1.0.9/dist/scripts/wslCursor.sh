#!/usr/bin/env sh

# Parse command line arguments
GIT_COMMIT="$1"
VSCODE_CLIENT_COMMAND="$3"
APP_NAME="$4"
DATA_DIR="$5"

# Remove the first 5 arguments, leaving the rest for later use
shift 5

# Enable debug mode if requested
if [ "$VSCODE_WSL_DEBUG_INFO" = true ]; then
	set -x
fi

# Handle stdin input if available
if [ ! -t 0 ]; then
	for var in "$@"; do
		if [ "$var" = "-" ]; then
			PIPE_STDIN_FILE=$(mktemp /tmp/cursor-stdin-XXXXXXXXXX)
			while IFS= read -r line; do
				printf "%s\n" "$line" >> "$PIPE_STDIN_FILE"
			done
		fi
	done
fi

# Set up remote binary path
CURSOR_REMOTE_BIN="$HOME/$DATA_DIR/bin"

# Configure CLI authority based on WSL distribution
if [ ! "$WSL_DISTRO_NAME" ]; then
	echo "Please update your version of WSL by updating Windows 10 to the May 19 Update, version 1903, or later."
	exit 1
fi

# Download required binaries
"$(dirname "$0")/wslDownload.sh" "$GIT_COMMIT" "stable" "$CURSOR_REMOTE_BIN"
RC=$?

# Exit if download failed
if [ $RC -ne 0 ]; then
	exit $RC
fi

# Store current environment for remote execution
STORED_ENV=$(mktemp /tmp/cursor-distro-env.XXXXXXXXXXXXXX)
env --null > "$STORED_ENV"

# Execute the remote CLI with proper environment setup
VSCODE_CLIENT_COMMAND="$VSCODE_CLIENT_COMMAND" \
VSCODE_CLIENT_COMMAND_CWD="$(dirname "$0")" \
VSCODE_CLI_AUTHORITY="wsl+$WSL_DISTRO_NAME" \
VSCODE_CLI_REMOTE_ENV="$STORED_ENV" \
VSCODE_STDIN_FILE_PATH="$PIPE_STDIN_FILE" \
WSLENV="VSCODE_CLI_REMOTE_ENV/w:$WSLENV" \
"$CURSOR_REMOTE_BIN/$GIT_COMMIT/bin/remote-cli/$APP_NAME" "$@"
