/**
 * Scrum Poker v3 — Pure Helper Functions
 * All functions here are side-effect-free and DOM-independent.
 * They can be imported by both scrum-poker.html and scrum-poker-tests.html.
 */

const CARD_VALUES = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '?', '☕'];

/**
 * Normalise a room name to lowercase alphanumeric only.
 * Property 1: result matches /^[a-z0-9]*$/
 * @param {string} input
 * @returns {string}
 */
function normaliseRoom(input) {
  return String(input).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Return users who are NOT spectators (eligible voters).
 * Property 2: no spectator user appears in the result.
 * @param {Object} users  — gameState.users map
 * @returns {Array}
 */
function getVoters(users) {
  return Object.values(users).filter(u => !u.spectator);
}

/**
 * Return users who ARE spectators.
 * @param {Object} users  — gameState.users map
 * @returns {Array}
 */
function getSpectators(users) {
  return Object.values(users).filter(u => u.spectator);
}

/**
 * Return names of non-spectator users who have voted for a specific card value
 * (only meaningful before reveal).
 * Property 4: result equals exactly the set of non-spectator names with that vote.
 * @param {Object} users
 * @param {string} cardValue
 * @returns {string[]}
 */
function getVotersForCard(users, cardValue) {
  return getVoters(users)
    .filter(u => u.vote === cardValue)
    .map(u => u.name);
}

/**
 * Round a numeric value to the nearest Fibonacci card in the deck.
 * Ties (equidistant between two Fibonacci numbers) round up.
 * @param {number} value
 * @returns {number}
 */
function roundToFibonacci(value) {
  const fibs = [0, 1, 2, 3, 5, 8, 13, 21, 34];
  return fibs.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

/**
 * Compute vote statistics from an array of vote strings.
 * Non-numeric values (?, ☕) are excluded.
 * Property 5: avg/min/max match manual calculation.
 * @param {string[]} votes
 * @returns {{ avg: string, min: number, max: number } | null}  null when no numeric votes
 */
function calculateStats(votes) {
  const numeric = votes
    .filter(v => v !== null && v !== undefined && !isNaN(parseFloat(v)))
    .map(v => parseFloat(v));
  if (numeric.length === 0) return null;
  const sum = numeric.reduce((a, b) => a + b, 0);
  return {
    avg: (sum / numeric.length).toFixed(1),
    min: Math.min(...numeric),
    max: Math.max(...numeric),
  };
}

/**
 * Compute consensus level from an array of vote strings.
 * Property 11:
 *   spread === 0           → 'full'
 *   spread === 1           → 'near'
 *   spread  >  1           → 'none'
 *   < 2 numeric votes      → 'n/a'
 * @param {string[]} votes
 * @returns {'full' | 'near' | 'none' | 'n/a'}
 */
function computeConsensus(votes) {
  const numeric = votes
    .filter(v => v !== null && v !== undefined && !isNaN(parseFloat(v)))
    .map(v => parseFloat(v));
  if (numeric.length < 2) return 'n/a';
  const spread = Math.max(...numeric) - Math.min(...numeric);
  if (spread === 0) return 'full';
  if (spread <= 1) return 'near';
  return 'none';
}

/**
 * Compute remaining seconds for a running timer. Always >= 0.
 * Property 10: result is non-negative and monotonically decreasing.
 * @param {number} startedAt  — epoch ms when timer started
 * @param {number} durationSeconds
 * @param {number} now  — current epoch ms
 * @returns {number}
 */
function computeTimerRemaining(startedAt, durationSeconds, now) {
  const elapsed = Math.floor((now - startedAt) / 1000);
  return Math.max(0, durationSeconds - elapsed);
}

/**
 * Build a HistoryItem from the current game state.
 * Property 6: all required fields are present and non-empty when there are votes.
 * @param {Object} gameState
 * @param {string} confirmedEstimate  — facilitator-confirmed final estimate
 * @returns {Object}
 */
function buildHistoryItem(gameState, confirmedEstimate) {
  const voters = getVoters(gameState.users);
  const votes = voters
    .filter(u => u.vote !== null && u.vote !== undefined)
    .map(u => ({ name: u.name, vote: u.vote }));

  const numericVotes = votes
    .filter(v => !isNaN(parseFloat(v.vote)))
    .map(v => parseFloat(v.vote));

  const avg = numericVotes.length > 0
    ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
    : '?';

  return {
    story: gameState.currentStory || 'Unnamed story',
    votes,
    average: avg,
    finalEstimate: confirmedEstimate,
    time: new Date().toLocaleTimeString(),
  };
}

/**
 * Compute the suggested final estimate (most common vote).
 * @param {Object} users  — gameState.users map
 * @returns {string}
 */
function suggestFinalEstimate(users) {
  const votes = getVoters(users)
    .filter(u => u.vote !== null && u.vote !== undefined)
    .map(u => u.vote);
  if (votes.length === 0) return '?';
  const counts = {};
  votes.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Build a CSV string from session history.
 * Property 9: header row + N data rows + TOTAL row.
 * @param {Array} history
 * @param {string} roomName
 * @returns {string}
 */
function buildCsv(history, roomName) {
  let csv = 'Ticket/Story,Final Estimate,Average,Votes,Time\n';
  history.forEach(item => {
    const votes = item.votes.map(v => `${v.name}:${v.vote}`).join('; ');
    csv += `"${item.story}",${item.finalEstimate},${item.average},"${votes}",${item.time}\n`;
  });
  const numericEstimates = history.filter(h => !isNaN(parseFloat(h.finalEstimate)));
  const totalPoints = numericEstimates.reduce((sum, h) => sum + parseFloat(h.finalEstimate), 0);
  csv += `\nTOTAL,${totalPoints},,${history.length} items,`;
  return csv;
}

/**
 * Compute total story points from history (sum of numeric finalEstimates).
 * Property 7: equals sum of parseFloat(item.finalEstimate) for numeric items only.
 * @param {Array} history
 * @returns {number}
 */
function computeHistoryTotal(history) {
  return history
    .filter(h => !isNaN(parseFloat(h.finalEstimate)))
    .reduce((sum, h) => sum + parseFloat(h.finalEstimate), 0);
}

/**
 * Save history to localStorage for a given room.
 * @param {string} roomName
 * @param {Array} history
 */
function saveHistoryToStorage(roomName, history) {
  try {
    localStorage.setItem(`scrumpoker-history-${roomName}`, JSON.stringify(history));
  } catch (e) {
    // SecurityError or QuotaExceededError — silently skip
  }
}

/**
 * Load history from localStorage for a given room.
 * Property 8: round-trip produces deeply equivalent array.
 * @param {string} roomName
 * @returns {Array}
 */
function loadHistoryFromStorage(roomName) {
  try {
    const raw = localStorage.getItem(`scrumpoker-history-${roomName}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Build a room URL from the current page URL + room query param.
 * @param {string} roomName
 * @returns {string}
 */
function buildRoomUrl(roomName) {
  const url = new URL(window.location.href);
  url.searchParams.set('room', roomName);
  // Remove hash if any
  url.hash = '';
  return url.toString();
}

/**
 * Read the 'room' query parameter from the current URL.
 * @returns {string | null}
 */
function getRoomFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
}
