#!/bin/sh

# Script parameters
COMMIT=$1
VSCODE_REMOTE_BIN=$3

# Enable debug mode if requested
[ "$VSCODE_WSL_DEBUG_INFO" = true ] && set -x

# Function to download the Cursor server
download() {
    local local_name="$1"
    local local_url=""
    local local_rc=0

    # Check if wget is available
    if ! command -v wget >/dev/null 2>&1; then
        echo "ERROR: Failed to download the Cursor server. 'wget' not installed." 1>&2
        echo "Please install wget:" 1>&2
        echo "Debian/Ubuntu:  sudo apt-get install wget" 1>&2
        echo "RHEL/CentOS:    sudo yum install wget" 1>&2
        echo "Fedora:         sudo dnf install wget" 1>&2
        echo "openSUSE:       sudo zypper install wget" 1>&2
        echo "Arch Linux:     sudo pacman -S wget" 1>&2
        echo "Alpine Linux:   sudo apk add wget" 1>&2
        exit 14
    fi

    # Determine platform architecture
    case $(uname -m) in
        x86_64)
            PLATFORM="x64";;
        aarch64)
            PLATFORM="arm64";;
        *)
            echo "Unknown platform $(uname -m). Falling back to x64" 1>&2
            PLATFORM="x64";;
    esac

    # Handle Alpine Linux
    if [ -f /etc/alpine-release ]; then
      TARGET="alpine"
    else
      TARGET="linux"
    fi

    # Construct download URL
    local_url="https://cursor.blob.core.windows.net/remote-releases/${COMMIT}/vscode-reh-${TARGET}-${PLATFORM}.tar.gz"

    echo "Downloading Cursor Server for $PLATFORM ($COMMIT)" 1>&2

    mkdir -p "$(dirname "$local_name")"

    # Download with progress indication
    wget -O "$local_name" "$local_url" 1>&2

    local_rc=$?

    if [ $local_rc -ne 0 ]; then
        echo "ERROR: Failed to download $local_url to $local_name" 1>&2
        if echo "$local_url" | grep -q "https"; then
            echo "Please double check your network connection and install missing certificates if necessary." 1>&2
            echo "Debian/Ubuntu:  sudo apt-get install ca-certificates" 1>&2
            echo "RHEL/CentOS:    sudo yum install ca-certificates" 1>&2
            echo "Fedora:         sudo dnf install ca-certificates" 1>&2
            echo "openSUSE:       sudo zypper install ca-certificates" 1>&2
            echo "Arch Linux:     sudo pacman -S ca-certificates" 1>&2
            echo "Alpine Linux:   sudo apk add ca-certificates" 1>&2
        fi
        exit 13
    fi
}

# Main script execution
if [ ! -d "$VSCODE_REMOTE_BIN/$COMMIT" ]; then
    echo "Installing Cursor Server for commit $COMMIT" 1>&2

    # Check Alpine Linux dependencies
    if [ -f /etc/alpine-release ]; then
        if ! apk info | grep -q libstdc++; then
            echo "libstdc++ is required to run the Cursor Server:" 1>&2
            echo "Please run 'apk add libstdc++' to install it." 1>&2
            exit 12
        fi
    fi

    # Clean up old installations
    echo "Cleaning up old installations..." 1>&2
    rm -rf "$VSCODE_REMOTE_BIN"/???????????????????????????????????????? 1>&2
    rm -rf "$VSCODE_REMOTE_BIN"/????????????????????????????????????????-?????????? 1>&2
    rm -rf "$VSCODE_REMOTE_BIN"/????????????????????????????????????????-??????????.tar.gz 1>&2

    # Check for pre-downloaded tar file
    if [ -n "$VSCODE_SERVER_TAR" ] && [ -f "$VSCODE_SERVER_TAR" ]; then
        echo "Using pre-downloaded server tar file: $VSCODE_SERVER_TAR" 1>&2
        SERVER_TAR_FILE="$VSCODE_SERVER_TAR"
        REMOVE_SERVER_TAR_FILE=false
    else
        # Generate unique filename with timestamp
        TIMESTAMP=$(date +%s%N 2>/dev/null || date +%s)
        SERVER_TAR_FILE="$VSCODE_REMOTE_BIN/$COMMIT-$TIMESTAMP.tar.gz"
        REMOVE_SERVER_TAR_FILE=true

        # Download the server package
        download "$SERVER_TAR_FILE"
    fi

    # Verify tar file integrity
    echo "Verifying tar file integrity..." 1>&2
    FILE_COUNT=$( ( ( ( ( tar -tf "$SERVER_TAR_FILE"; echo $? >&3) | wc -l >&4) 3>&1) | (read -r xs; exit "$xs") ) 4>&1 )
    RC=$?

    if [ $RC -ne 0 ]; then
        echo "ERROR: Failed to read tar file $SERVER_TAR_FILE" 1>&2
        [ "$REMOVE_SERVER_TAR_FILE" = true ] && rm -f "$SERVER_TAR_FILE"
        exit 10
    fi

    # Create temporary extraction directory
    TMP_EXTRACT_FOLDER="$VSCODE_REMOTE_BIN/$COMMIT-$TIMESTAMP"
    mkdir -p "$TMP_EXTRACT_FOLDER"

    echo "Extracting files..." 1>&2
    tar -xf "$SERVER_TAR_FILE" -C "$TMP_EXTRACT_FOLDER" --strip-components 1 1>&2
    # Remove tar file if it was downloaded
    [ "$REMOVE_SERVER_TAR_FILE" = true ] && rm -f "$SERVER_TAR_FILE" 1>&2

    # Move extracted files to final location with retry mechanism
    echo "Moving to final location..." 1>&2
    for _ in 1 2 3 4 5; do
        if mv "$TMP_EXTRACT_FOLDER" "$VSCODE_REMOTE_BIN/$COMMIT" 2>/dev/null; then
            break
        fi
        echo "Retrying move operation..." 1>&2
        sleep 2
    done

    # Fallback to copy if move fails
    if [ ! -d "$VSCODE_REMOTE_BIN/$COMMIT" ]; then
        echo "WARNING: Unable to move $TMP_EXTRACT_FOLDER. Trying copying instead." 1>&2
        if ! cp -r "$TMP_EXTRACT_FOLDER" "$VSCODE_REMOTE_BIN/$COMMIT"; then
            echo "ERROR: Failed create $VSCODE_REMOTE_BIN/$COMMIT. Make sure all Cursor WSL windows are closed and try again." 1>&2
            rm -rf "$TMP_EXTRACT_FOLDER" 1>&2
            exit 11
        fi
        rm -rf "$TMP_EXTRACT_FOLDER" 1>&2
    fi

    # Verify extraction
    EXTRACTED_COUNT=$(find "$VSCODE_REMOTE_BIN/$COMMIT" | wc -l)
    if [ "$FILE_COUNT" -ne "$EXTRACTED_COUNT" ]; then
        echo "ERROR: Unpacking failed: Files expected: $FILE_COUNT, is $EXTRACTED_COUNT" 1>&2
        rm -rf "${VSCODE_REMOTE_BIN:?}/$COMMIT"
        exit 10
    fi

    echo "Installation complete." 1>&2
else
    [ "$VSCODE_WSL_DEBUG_INFO" = true ] && echo "Cursor Server for commit $COMMIT already installed." 1>&2
fi

[ "$VSCODE_WSL_DEBUG_INFO" = true ] && echo "Cursor Server successfully installed for commit $COMMIT" 1>&2
exit 0
