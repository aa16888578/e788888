"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTeamSpend = exports.fetchTeamDetails = exports.fetchTeams = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const BASE_URL = 'https://www.cursor.com/api/dashboard';
/**
 * A generic and secure wrapper for making POST requests to the Cursor API.
 * It ensures the cookie is only used here and not logged.
 * @param endpoint The API endpoint to hit.
 * @param cookie The user's authentication cookie.
 * @param body The request body.
 * @returns A promise that resolves to the JSON response.
 */
async function post(endpoint, cookie, body) {
    const url = `${BASE_URL}/${endpoint}`;
    console.log(`[Cursor Usage] Fetching data from ${endpoint}`);
    console.log(`[Cursor Usage] Full URL: ${url}`);
    console.log(`[Cursor Usage] Request body:`, JSON.stringify(body));
    const headers = {
        'Content-Type': 'application/json',
        'Cookie': `WorkosCursorSessionToken=${cookie}`,
    };
    console.log(`[Cursor Usage] Request headers:`, headers);
    const response = await (0, node_fetch_1.default)(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });
    console.log(`[Cursor Usage] Response status: ${response.status} ${response.statusText}`);
    console.log(`[Cursor Usage] Response headers:`, Object.fromEntries(response.headers.entries()));
    if (!response.ok) {
        // We avoid logging the response body here as it could contain sensitive information.
        console.error(`[Cursor Usage] API Error on ${endpoint}: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch data from ${endpoint}. Status: ${response.status}`);
    }
    return response.json();
}
/** Fetches all teams the user belongs to. */
async function fetchTeams(cookie) {
    return post('teams', cookie, {});
}
exports.fetchTeams = fetchTeams;
/** Fetches details for a specific team, including the user's ID within that team. */
async function fetchTeamDetails(teamId, cookie) {
    return post('team', cookie, { teamId });
}
exports.fetchTeamDetails = fetchTeamDetails;
/** Fetches the spend data for all members of a specific team. */
async function fetchTeamSpend(teamId, cookie) {
    return post('get-team-spend', cookie, { teamId });
}
exports.fetchTeamSpend = fetchTeamSpend;
