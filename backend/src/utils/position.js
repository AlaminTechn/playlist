/**
 * Calculate position for inserting a track between two others
 * This allows infinite insertions without reindexing
 * 
 * @param {number|null} prevPosition - Position of previous track
 * @param {number|null} nextPosition - Position of next track
 * @returns {number} Calculated position
 */
export function calculatePosition(prevPosition, nextPosition) {
  // No previous or next track - first item
  if (!prevPosition && !nextPosition) {
    return 1.0;
  }
  
  // No previous track - insert at beginning
  if (!prevPosition) {
    return nextPosition - 1;
  }
  
  // No next track - insert at end
  if (!nextPosition) {
    return prevPosition + 1;
  }
  
  // Insert between two tracks - use midpoint
  return (prevPosition + nextPosition) / 2;
}

/**
 * Get position for adding at the end of playlist
 * @param {number} maxPosition - Current maximum position
 * @returns {number} Next position
 */
export function getEndPosition(maxPosition) {
  return (maxPosition || 0) + 1.0;
}

