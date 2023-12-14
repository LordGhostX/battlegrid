// Piece icons
const whitePiecesOrder = ["♙", "♖", "♘", "◎", "♗", "♕", "♔", "♕", "♗", "◎", "♘", "♖"];
const blackPiecesOrder = ["♟", "♜", "♞", "◉", "♝", "♛", "♚", "♛", "♝", "◉", "♞", "♜"];

// Game state
let selectedCell = null;
let moveHistory = [];
let lastMovedPiece = "black";

// Utility functions
const createLabelCell = (text) => {
    const labelCell = document.createElement("div");
    labelCell.className = "label";
    labelCell.textContent = text;
    return labelCell;
};

const createPiece = (icon, color) => {
    const piece = document.createElement("span");
    piece.className = `piece ${color}`;
    piece.setAttribute("pieceType", color);
    piece.textContent = icon;
    return piece;
};

function resetGameState() {
    // Clear the move history, selected cell, and grid
    moveHistory = [];
    selectedCell = null;
    lastMovedPiece = "black";
    document.getElementById("grid").innerHTML = "";

    initializeBoard();
}

function undoMove() {
    const lastMove = moveHistory.pop();
    if (lastMove) {
        lastMove.from.appendChild(lastMove.movedPiece);
        if (lastMove.capturedPiece) {
            lastMove.to.appendChild(lastMove.capturedPiece);
        }
        lastMovedPiece = lastMove.movedPiece.getAttribute("pieceType") === "white" ?  "black" : "white";
    }
}

function exportMoves() {
    if (moveHistory.length === 0) return;

    const moveStrings = moveHistory.map(move => {
        const fromCellId = move.from.id.replace("cell-", "");
        const toCellId = move.to.id.replace("cell-", "");
        const movedPiece = move.movedPiece.textContent;
        const capturedPiece = move.capturedPiece ? move.capturedPiece.textContent : "";
        return `${movedPiece} from ${fromCellId} to ${toCellId}${capturedPiece ? ` capturing ${capturedPiece}` : ""}`;
    });

    const exportString = moveStrings.join(";");
    console.log(exportString);

    // Copy to clipboard or present it to the user in some way
    navigator.clipboard.writeText(exportString).then(() => {
        alert("Moves exported to clipboard!");
    }).catch(err => {
        console.error("Could not copy moves to clipboard: ", err);
    });
}

function importMoves(importString) {
    if (importString.trim().length === 0) return;
    
    // Clear current game state before importing new moves
    resetGameState();

    const moveStrings = importString.split(";");
    moveStrings.forEach(moveString => {
        if (moveString.trim() === "") return;
        
        // Extract the details of the move
        const [movedPiece, fromText, fromCellId, toText, toCellId] = moveString.split(" ");
        const captured = moveString.includes("capturing");

        // Find the corresponding cells in the DOM
        const fromCell = document.getElementById(`cell-${fromCellId}`);
        const toCell = document.getElementById(`cell-${toCellId}`);

        // If there is a capturing move, handle the captured piece
        let capturedPieceElement = null;
        if (captured) {
            capturedPieceElement = toCell.querySelector(".piece");
            if (capturedPieceElement) {
                toCell.removeChild(capturedPieceElement);
            }
        }

        // Move the piece to the new cell
        let pieceElement = fromCell.querySelector(".piece");
        if (!pieceElement) {
            let color = whitePiecesOrder.includes(movedPiece) ?  "white" : "black";
            pieceElement = document.createElement("span");
            pieceElement.className = `piece ${color}`;
            pieceElement.setAttribute("pieceType", color);
            pieceElement.textContent = movedPiece;
        }
        toCell.appendChild(pieceElement);
        
        // Update the move history
        moveHistory.push({
            from: fromCell,
            to: toCell,
            movedPiece: pieceElement,
            capturedPiece: capturedPieceElement
        });
        lastMovedPiece = pieceElement.getAttribute("pieceType");
    });
}

function handleImportClick() {
    const importString = prompt("Please enter the move history string:");
    if (importString) {
        importMoves(importString);
    }
}

function handleSkipClick() {
    lastMovedPiece = lastMovedPiece === "white" ?  "black" : "white";
    if (selectedCell) {
        selectedCell.classList.remove("selected");
        selectedCell = null;
    }
}

// Event handlers
function onCellClick(event) {
    const cell = event.currentTarget;

    if (selectedCell && selectedCell !== cell) {
        const pieceToMove = selectedCell.querySelector(".piece");
        if (pieceToMove) {
            const capturedPiece = cell.querySelector(".piece");
            if (capturedPiece) {
                if (pieceToMove.className === capturedPiece.className) {
                    selectedCell.classList.remove("selected");
                    selectedCell = null;
                    capturedPiece.click();
                    return;
                }
                cell.removeChild(capturedPiece);
            }

            cell.appendChild(pieceToMove);

            moveHistory.push({
                from: selectedCell,
                to: cell,
                movedPiece: pieceToMove,
                capturedPiece: capturedPiece
            });

            selectedCell.classList.remove("selected");
            selectedCell = null;
            lastMovedPiece = pieceToMove.getAttribute("pieceType");
        }
    } else if (cell.querySelector(".piece")) {
        const piece = cell.querySelector(".piece");
        if (piece.getAttribute("pieceType") === lastMovedPiece) return;

        if (selectedCell) {
            selectedCell.classList.remove("selected");
        }

        cell.classList.add("selected");
        selectedCell = cell;
    }
}

// Initialize the game board
const initializeBoard = () => {
    const grid = document.getElementById("grid");
    grid.appendChild(createLabelCell(" "));

    // Create column labels A-K
    for (let i = 0; i < 11; i++) {
        grid.appendChild(createLabelCell(String.fromCharCode("A".charCodeAt(0) + i)));
    }

    // Create grid cells with pieces
    for (let row = 1; row <= 11; row++) {
        grid.appendChild(createLabelCell(row.toString()));

        for (let col = 1; col <= 11; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `cell-${String.fromCharCode("A".charCodeAt(0) + col - 1)}${row}`;

            if (row === 1 || row === 11) {
                const color = (row === 1) ? "black" : "white";
                const icons = (row === 1) ? blackPiecesOrder : whitePiecesOrder;
                cell.appendChild(createPiece(icons[col], color));
            } else if (row === 2 || row === 10) {
                const color = (row === 2) ? "black" : "white";
                const icons = (row === 2) ? blackPiecesOrder : whitePiecesOrder;
                cell.appendChild(createPiece(icons[0], color));
            }
            
            if (row % 2 == col % 2) {
                // If both row and col are even or odd, the cell should be dark
                cell.classList.add("dark-square");
            }

            grid.appendChild(cell);
        }
    }

    // Attach event listeners to cells
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.addEventListener("click", onCellClick);
    });

    // Attach event listeners to buttons
    const restartButton = document.getElementById("restart");
    restartButton.addEventListener("click", resetGameState);

    const undoButton = document.getElementById("undo");
    undoButton.addEventListener("click", undoMove);
    
    const exportMovesButton = document.getElementById("export");
    exportMovesButton.addEventListener("click", exportMoves);
    
    const importButton = document.getElementById("import");
    importButton.addEventListener("click", handleImportClick);

    const skipButton = document.getElementById("skip");
    skipButton.addEventListener("click", handleSkipClick);
};

// When the DOM is fully loaded, initialize the game board
document.addEventListener("DOMContentLoaded", initializeBoard);
