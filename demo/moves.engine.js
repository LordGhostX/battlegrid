let colPerPiece = {};
// Columns 'A' to 'K'
const columns = "ABCDEFGHIJK".split("");

// Rows 1 to 11
for (let col of columns) {
  for (let row = 1; row <= 11; row++) {
    const cellId = `cell-${col}${row}`;
    colPerPiece[cellId] = null;
  }
}

function suggestMoves(cell) {
  clearHighlights();
  const piece = cell.querySelector(".piece");
  const pieceType = piece.getAttribute("pieceType");
  const name = piece.getAttribute("name");

  switch (name) {
    case INFANTRY:
      const moves = getInfantryMoves(cell.id, pieceType);
      legalMoves = moves;
      highlightSquares(moves);
      break;
    default:
      console.log("Not Implemented");
  }
}

function getInfantryMoves(currentCell, pieceColor) {
  const moves = [];

  // Extract the column and row from the current cell
  const column = currentCell.charAt(5); // 'A'
  const row = parseInt(currentCell.slice(6)); // 2

  // Determine the direction of movement based on the piece color
  const direction = pieceColor === "black" ? 1 : -1;

  // Forward moves (1 or 2 squares)
  for (let i = 1; i <= 2; i++) {
    const newRow = row + i * direction;
    if (newRow >= 1 && newRow <= 11) {
      moves.push(`cell-${column}${newRow}`);
    }
  }

  // Diagonal captures (up to 2 squares)
  // Using ASCII values to calculate neighboring columns
  const columnCharCode = column.charCodeAt(0);
  for (let i = 1; i <= 2; i++) {
    const newRow = row + i * direction;
    if (newRow >= 1 && newRow <= 11) {
      // Left diagonal capture
      if (columnCharCode - i >= "A".charCodeAt(0)) {
        const id = `cell-${String.fromCharCode(columnCharCode - i)}${newRow}`;
        checkIfCellContainsAPiece(id) ? moves.push(id) : null;
      }
      // Right diagonal capture
      if (columnCharCode + i <= "K".charCodeAt(0)) {
        const id = `cell-${String.fromCharCode(columnCharCode + i)}${newRow}`;
        checkIfCellContainsAPiece(id) ? moves.push(id) : null;
      }
    }
  }

  return moves;
}

function highlightSquares(cellIds) {
  console.log(cellIds);
  cellIds.forEach((cellId) => {
    const cell = document.getElementById(cellId);
    if (cell) {
      checkIfCellContainsAPiece(cell.id)
        ? cell.classList.add("capture-highlight")
        : cell.classList.add("positive-highlight");
    }
  });
}

function clearHighlights() {
  const captureHighlights = document.querySelectorAll(".capture-highlight");
  captureHighlights.forEach((element) => {
    element.classList.remove("capture-highlight");
  });

  const positiveHighlights = document.querySelectorAll(".positive-highlight");
  positiveHighlights.forEach((element) => {
    element.classList.remove("positive-highlight");
  });
}

function checkIfCellContainsAPiece(id) {
  const piece = colPerPiece[id].querySelector(".piece");
  if (piece) {
    return true;
  }

  return false;
}

/**
 * Check if the move if legal from the moves piece is allowed to move
 * @param {*} cellId 
 */
function isMoveLegal(cellId) {
  if (legalMoves.includes(cellId)) {
    return true;
  }
  return false;
}