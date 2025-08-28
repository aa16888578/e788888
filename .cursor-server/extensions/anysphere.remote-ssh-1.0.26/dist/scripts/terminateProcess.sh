#!/usr/bin/env sh

terminateRecursive() {
	for childPid in $(/usr/bin/pgrep -P "$1"); do
		terminateRecursive "$childPid"
	done
	kill -9 "$1" > /dev/null 2>&1
}

for pid in $*; do
	terminateRecursive "$pid"
done
