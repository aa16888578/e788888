"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusBarItem = exports.setStatusBarWarning = exports.setStatusBarError = exports.updateStatusBar = exports.createStatusBarItem = void 0;
const vscode = __importStar(require("vscode"));
let statusBarItem;
const TOTAL_REQUESTS = 500;
/**
 * Creates and displays the status bar item.
 */
function createStatusBarItem() {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'cursorUsage.refresh';
    statusBarItem.tooltip = 'Remaining Cursor fast-premium requests';
    statusBarItem.text = '$(zap) Loading...';
    statusBarItem.show();
}
exports.createStatusBarItem = createStatusBarItem;
/**
 * Updates the status bar with the remaining requests and appropriate color/icon.
 * @param remainingRequests The number of requests left.
 */
function updateStatusBar(remainingRequests) {
    if (!statusBarItem) {
        return;
    }
    const warningThreshold = TOTAL_REQUESTS * 0.1; // 10%
    let icon = '$(zap)';
    // Reset background color before setting it.
    statusBarItem.backgroundColor = undefined;
    if (remainingRequests <= 0) {
        icon = '$(error)';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    }
    else if (remainingRequests <= warningThreshold) {
        icon = '$(warning)';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
    statusBarItem.text = `${icon} ${remainingRequests}`;
}
exports.updateStatusBar = updateStatusBar;
/**
 * Sets the status bar to a generic error state.
 * @param message The message to display. If not provided, a default message is used.
 */
function setStatusBarError(message) {
    if (!statusBarItem) {
        return;
    }
    const displayMessage = message || 'Error';
    statusBarItem.text = `$(error) ${displayMessage}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    if (displayMessage === 'Team ID?') {
        statusBarItem.command = 'cursorUsage.openSettings';
        statusBarItem.tooltip = 'Click to set your Team ID in settings';
    }
    else {
        statusBarItem.command = 'cursorUsage.refresh';
        statusBarItem.tooltip = 'Click to refresh usage data';
    }
}
exports.setStatusBarError = setStatusBarError;
/**
 * Sets the status bar to a generic warning state.
 * @param message The message to display.
 */
function setStatusBarWarning(message) {
    if (!statusBarItem) {
        return;
    }
    statusBarItem.text = `$(warning) ${message}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    // If the warning is about setting the cookie, make the status bar item clickable
    // to trigger the cookie insertion command.
    if (message === 'Set Cookie') {
        statusBarItem.command = 'cursorUsage.insertCookie';
        statusBarItem.tooltip = 'Click to set your Cursor session cookie';
    }
    else {
        // Reset to default refresh command if the warning is something else
        statusBarItem.command = 'cursorUsage.refresh';
        statusBarItem.tooltip = 'Click to refresh usage data';
    }
}
exports.setStatusBarWarning = setStatusBarWarning;
/**
 * Returns the created status bar item instance.
 * @returns The StatusBarItem instance.
 */
function getStatusBarItem() {
    return statusBarItem;
}
exports.getStatusBarItem = getStatusBarItem;
