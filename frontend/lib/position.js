/**
 * Calculate position for inserting a track between two others
 * This matches the backend algorithm
 */
export function calculatePosition(prevPosition, nextPosition) {
  if (!prevPosition && !nextPosition) {
    return 1.0;
  }
  
  if (!prevPosition) {
    return nextPosition - 1;
  }
  
  if (!nextPosition) {
    return prevPosition + 1;
  }
  
  return (prevPosition + nextPosition) / 2;
}

