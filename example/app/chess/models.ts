import { DataType, Model, Store } from "xorm";
import { makeObservable, observable, action, computed } from "mobx";

export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";
export type PieceColor = "white" | "black";
export type Position = { x: number; y: number };

interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
}

interface Game {
  id: string;
  currentTurn: PieceColor;
  pieces: Piece[];
  selectedPieceId: string | null;
  moves: Move[];
}

interface Move {
  id: string;
  pieceId: string;
  from: Position;
  to: Position;
  capturedPieceId?: string;
  timestamp: number;
}

export class PieceModel extends Model.withType(DataType<Piece>()) {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;

  constructor(data: Piece) {
    super(data);
    this.type = data.type;
    this.color = data.color;
    this.position = data.position;
    this.hasMoved = data.hasMoved;

    makeObservable(this, {
      position: observable.ref,
      hasMoved: observable,
      setPosition: action,
      setHasMoved: action,
    });
  }

  setPosition(position: Position) {
    this.position = position;
  }

  setHasMoved(hasMoved: boolean) {
    this.hasMoved = hasMoved;
  }

  loadJSON(data: Piece) {
    this.id = data.id;
    this.type = data.type;
    this.color = data.color;
    this.position = data.position;
    this.hasMoved = data.hasMoved;
  }

  toJSON(): Piece {
    return {
      id: this.id,
      type: this.type,
      color: this.color,
      position: this.position,
      hasMoved: this.hasMoved,
    };
  }

  getValidMoves(): Position[] {
    return [];
  }

  protected isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  protected getSlidingMoves(
    game: GameModel,
    directions: Position[]
  ): Position[] {
    const moves: Position[] = [];

    for (const dir of directions) {
      let newPos = {
        x: this.position.x + dir.x,
        y: this.position.y + dir.y,
      };

      while (this.isValidPosition(newPos)) {
        const piece = game.getPieceAt(newPos);
        if (!piece) {
          moves.push(newPos);
        } else {
          if (piece.color !== this.color) {
            moves.push(newPos);
          }
          break;
        }

        newPos = {
          x: newPos.x + dir.x,
          y: newPos.y + dir.y,
        };
      }
    }

    return moves;
  }
}

export class PawnModel extends PieceModel {
  type: "pawn" = "pawn";

  getValidMoves(): Position[] {
    const moves: Position[] = [];
    const game = GameModel.getById("game");
    if (!game) return moves;

    const direction = this.color === "white" ? -1 : 1;
    const startRank = this.color === "white" ? 6 : 1;

    // Forward move
    const forward = { x: this.position.x, y: this.position.y + direction };
    if (this.isValidPosition(forward) && !game.getPieceAt(forward)) {
      moves.push(forward);

      // Double move from starting position
      if (this.position.y === startRank) {
        const doubleForward = {
          x: this.position.x,
          y: this.position.y + 2 * direction,
        };
        if (!game.getPieceAt(doubleForward)) {
          moves.push(doubleForward);
        }
      }
    }

    // Capture moves
    const captures = [
      { x: this.position.x - 1, y: this.position.y + direction },
      { x: this.position.x + 1, y: this.position.y + direction },
    ];

    for (const capture of captures) {
      if (this.isValidPosition(capture)) {
        const piece = game.getPieceAt(capture);
        if (piece && piece.color !== this.color) {
          moves.push(capture);
        }
      }
    }

    return moves;
  }
}

export class RookModel extends PieceModel {
  type: "rook" = "rook";

  getValidMoves(): Position[] {
    const game = GameModel.getById("game");
    if (!game) return [];

    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ];

    return this.getSlidingMoves(game, directions);
  }
}

export class KnightModel extends PieceModel {
  type: "knight" = "knight";

  getValidMoves(): Position[] {
    const moves: Position[] = [];
    const game = GameModel.getById("game");
    if (!game) return moves;

    const knightMoves = [
      { x: 2, y: 1 },
      { x: 2, y: -1 },
      { x: -2, y: 1 },
      { x: -2, y: -1 },
      { x: 1, y: 2 },
      { x: 1, y: -2 },
      { x: -1, y: 2 },
      { x: -1, y: -2 },
    ];

    for (const move of knightMoves) {
      const newPos = {
        x: this.position.x + move.x,
        y: this.position.y + move.y,
      };

      if (this.isValidPosition(newPos)) {
        const piece = game.getPieceAt(newPos);
        if (!piece || piece.color !== this.color) {
          moves.push(newPos);
        }
      }
    }

    return moves;
  }
}

export class BishopModel extends PieceModel {
  type: "bishop" = "bishop";

  getValidMoves(): Position[] {
    const game = GameModel.getById("game");
    if (!game) return [];

    const directions = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    return this.getSlidingMoves(game, directions);
  }
}

export class QueenModel extends PieceModel {
  type: "queen" = "queen";

  getValidMoves(): Position[] {
    const game = GameModel.getById("game");
    if (!game) return [];

    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    return this.getSlidingMoves(game, directions);
  }
}

export class KingModel extends PieceModel {
  type: "king" = "king";

  getValidMoves(): Position[] {
    const moves: Position[] = [];
    const game = GameModel.getById("game");
    if (!game) return moves;

    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    for (const dir of directions) {
      const newPos = {
        x: this.position.x + dir.x,
        y: this.position.y + dir.y,
      };

      if (this.isValidPosition(newPos)) {
        const piece = game.getPieceAt(newPos);
        if (!piece || piece.color !== this.color) {
          moves.push(newPos);
        }
      }
    }

    return moves;
  }
}

class MoveModel extends Model.withType(DataType<Move>()) {
  pieceId: string;
  from: Position;
  to: Position;
  capturedPieceId?: string;
  timestamp: number;

  constructor(data: Move) {
    super(data);
    this.pieceId = data.pieceId;
    this.from = data.from;
    this.to = data.to;
    this.capturedPieceId = data.capturedPieceId;
    this.timestamp = data.timestamp;

    makeObservable(this, {
      from: observable.ref,
      to: observable.ref,
      capturedPieceId: observable,
    });
  }

  toJSON(): Move {
    return {
      id: this.id,
      pieceId: this.pieceId,
      from: this.from,
      to: this.to,
      capturedPieceId: this.capturedPieceId,
      timestamp: this.timestamp,
    };
  }
}

export class GameModel extends Model.withType(DataType<Game>()) {
  currentTurn: PieceColor = "white";
  selectedPieceId: string | null = null;

  constructor(data: Game) {
    super(data);
    this.id = "game";
    this.currentTurn = data.currentTurn;
    this.selectedPieceId = data.selectedPieceId;
    this.loadJSON(data);

    makeObservable(this, {
      currentTurn: observable,
      selectedPieceId: observable,
      pieces: computed,
      moves: computed,
      selectPiece: action,
      movePiece: action,
    });
  }

  get pieces() {
    return PieceModel.getAll();
  }

  get moves() {
    return MoveModel.getAll();
  }

  getPieceAt(position: Position): PieceModel | undefined {
    return this.pieces.find(
      (p) => p.position.x === position.x && p.position.y === position.y
    );
  }

  selectPiece(pieceId: string | null) {
    this.selectedPieceId = pieceId;
  }

  movePiece(from: Position, to: Position) {
    const piece = this.getPieceAt(from);
    if (!piece) return false;

    // Validate it's the correct player's turn
    if (piece.color !== this.currentTurn) return false;

    // Get valid moves for the piece
    const validMoves = piece.getValidMoves();
    if (!validMoves.some((m) => m.x === to.x && m.y === to.y)) return false;

    // Check if there's a piece to capture
    const capturedPiece = this.getPieceAt(to);
    if (capturedPiece) {
      if (capturedPiece.color === piece.color) return false;
      capturedPiece._deleted = true;
    }

    // Create move record
    MoveModel.create({
      id: `move-${Date.now()}`,
      pieceId: piece.id,
      from,
      to,
      capturedPieceId: capturedPiece?.id,
      timestamp: Date.now(),
    });

    // Update piece position using actions
    piece.setPosition(to);
    piece.setHasMoved(true);

    // Switch turns
    this.currentTurn = this.currentTurn === "white" ? "black" : "white";

    return true;
  }

  toJSON(): Game {
    return {
      id: this.id,
      currentTurn: this.currentTurn,
      selectedPieceId: this.selectedPieceId,
      pieces: this.pieces.map((piece) => piece.toJSON()),
      moves: this.moves.map((move) => move.toJSON()),
    };
  }

  loadJSON(data: Game) {
    this.currentTurn = data.currentTurn;
    this.selectedPieceId = data.selectedPieceId;

    // Load pieces
    data.pieces.forEach((piece) => {
      const ModelClass = {
        pawn: PawnModel,
        rook: RookModel,
        knight: KnightModel,
        bishop: BishopModel,
        queen: QueenModel,
        king: KingModel,
      }[piece.type] as typeof PieceModel;

      ModelClass.create(piece);
    });

    // Load moves
    data.moves.forEach((move) => {
      MoveModel.create(move);
    });
  }

  static initialize() {
    const initialPieces: Piece[] = [];

    // Initialize pawns
    for (let i = 0; i < 8; i++) {
      initialPieces.push({
        id: `white-pawn-${i}`,
        type: "pawn",
        color: "white",
        position: { x: i, y: 6 },
        hasMoved: false,
      });
      initialPieces.push({
        id: `black-pawn-${i}`,
        type: "pawn",
        color: "black",
        position: { x: i, y: 1 },
        hasMoved: false,
      });
    }

    // Initialize other pieces
    const pieces: PieceType[] = [
      "rook",
      "knight",
      "bishop",
      "queen",
      "king",
      "bishop",
      "knight",
      "rook",
    ];
    pieces.forEach((piece, i) => {
      initialPieces.push({
        id: `white-${piece}-${i}`,
        type: piece,
        color: "white",
        position: { x: i, y: 7 },
        hasMoved: false,
      });
      initialPieces.push({
        id: `black-${piece}-${i}`,
        type: piece,
        color: "black",
        position: { x: i, y: 0 },
        hasMoved: false,
      });
    });

    return GameModel.create({
      id: "game",
      currentTurn: "white",
      selectedPieceId: null,
      pieces: initialPieces,
      moves: [],
    });
  }
}

export const store = new Store({
  schemaVersion: 0,
  models: {
    GameModel,
    PieceModel,
    PawnModel,
    RookModel,
    KnightModel,
    BishopModel,
    QueenModel,
    KingModel,
    MoveModel,
  },
});
