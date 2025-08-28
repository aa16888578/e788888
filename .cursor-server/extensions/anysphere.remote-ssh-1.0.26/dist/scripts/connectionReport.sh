#!/bin/sh

# Function to print section headers
print_section() {
    echo ""
    echo "=== $1 ==="
    echo "----------------------------------------"
}


getFormattedDate() {
    if command -v date >/dev/null 2>&1; then
        # Try GNU date format first (Linux)
        date -u +"%Y-%m-%dT%H:%M:%S.%3NZ" 2>/dev/null || \
        # Fallback to BSD date format (macOS)
        date -u "+%Y-%m-%dT%H:%M:%S.000Z"
    else
        echo "date command not available"
    fi
}



# Function to safely get version of a program
get_version() {
    cmd=$1
    if command -v "$cmd" >/dev/null 2>&1; then
        "$cmd" --version 2>&1 | head -n 1
    else
        echo "Not installed"
    fi
}

# Function to safely get file contents
get_file_contents() {
    file=$1
    if [ -f "$file" ]; then
        cat "$file"
    else
        echo "File not found: $file"
    fi
}

# Function to redact sensitive environment variables
redact_env_vars() {
    env | while IFS='=' read -r key value; do
        if echo "$key" | grep -qi "KEY"; then
            echo "$key=********"
        else
            echo "$key=$value"
        fi
    done | sort
}

echo "Start Time: $(getFormattedDate)"

# Program Versions
print_section "Program Versions"
echo "Node.js: $(get_version node)"
echo "cURL: $(get_version curl)"
echo "Wget: $(get_version wget)"
echo "Base64: $(get_version base64)"
echo "Grep: $(get_version grep)"

# Environment Variables
print_section "Environment Variables"
redact_env_vars

# Host Platform Information
print_section "Host Platform Information"
echo "OS Release Information:"
if [ -f /etc/os-release ]; then
    cat /etc/os-release
else
    echo "OS release file not found"
fi

echo ""
echo "System Information:"
uname -a

# Network Connectivity Test
print_section "Network Connectivity Test"
echo "Attempting to download https://cursor.blob.core.windows.net/remote-releases/connectioncheck.txt"

if command -v curl >/dev/null 2>&1; then
    echo "Testing connection using curl..."
    echo "Starting download at: $(getFormattedDate)"
    curl -I --connect-timeout 10 --max-time 10 https://cursor.blob.core.windows.net/remote-releases/connectioncheck.txt 2>&1
    echo "Command finished at: $(getFormattedDate)"
elif command -v wget >/dev/null 2>&1; then
    echo "Testing connection using wget..."
    echo "Starting download at: $(getFormattedDate)"
    wget --spider -S --timeout=10 --tries=1 https://cursor.blob.core.windows.net/remote-releases/connectioncheck.txt 2>&1
    echo "Command finished at: $(getFormattedDate)"
else
    echo "Neither curl nor wget is available for connection testing"
fi


# SSH Configuration
print_section "SSH Configuration"
echo "User SSH Config:"
get_file_contents "$HOME/.ssh/config"

echo ""
echo "System SSH Config:"
get_file_contents /etc/ssh/ssh_config

# Additional System Information
print_section "Additional System Information"
echo "Network Interfaces:"
if command -v ip >/dev/null 2>&1; then
    ip addr
elif command -v ifconfig >/dev/null 2>&1; then
    ifconfig
else
    echo "Network interface information not available"
fi

echo ""
echo "DNS Configuration:"
if [ -f /etc/resolv.conf ]; then
    cat /etc/resolv.conf
else
    echo "DNS configuration file not found"
fi

echo ""
echo "Current User Information:"
id
whoami

echo ""
echo "Process Information:"
ps aux | grep -i ssh

# Print footer
echo ""
echo "============================================"
echo "End of Diagnostic Report"
echo "End Time: $(getFormattedDate)"