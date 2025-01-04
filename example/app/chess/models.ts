import { DataType, Model, Store } from "xorm";
import { makeObservable, observable, action, computed } from "mobx";
import {
  BaseData,
  Game,
  Move,
  Piece,
  PieceColor,
  PieceType,
  Player,
  Position,
} from "./types";

class BaseModel extends Model.withType(DataType<BaseData>()) {
  static idSelector(data: BaseData) {
    return data.id;
  }
}

export class GameModel extends BaseModel.withType(DataType<Game>()) {
  current_player_id: string;
  selected_piece_id: string | null = null;

  constructor(data: Game) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      current_player_id: observable,
      selected_piece_id: observable,
      players: computed,
      currentPlayer: computed,
      selectedPiece: computed,
      isOver: computed,
      winner: computed,
      selectPiece: action,
      switchPlayer: action,
    });
  }

  get players(): PlayerModel[] {
    return PlayerModel.getAll().filter((p) => p.game_id === this.id);
  }

  get currentPlayer(): PlayerModel {
    return this.players.find((p) => p.id === this.current_player_id)!;
  }

  get selectedPiece() {
    return this.pieces.find((p) => p.id === this.selected_piece_id) || null;
  }

  get isOver(): boolean {
    return this.players.some((p) => p.isInCheckMate);
  }

  get winner(): PlayerModel | null {
    return this.players.find((p) => !p.isInCheckMate) ?? null;
  }

  get pieces() {
    return this.players.flatMap((player) => player.pieces);
  }

  getPieceAtPosition(pos: Position) {
    return this.pieces.find(
      (piece) =>
        !piece.captured &&
        piece.position.x === pos.x &&
        piece.position.y === pos.y
    );
  }

  switchPlayer() {
    this.current_player_id = this.currentPlayer.opponent.id;
  }

  selectPiece(pieceId: string | null) {
    this.selected_piece_id = pieceId;
  }

  toJSON(): Game {
    return {
      id: this.id,
      current_player_id: this.current_player_id,
      selected_piece_id: this.selected_piece_id,
    };
  }

  loadJSON(data: Game) {
    this.current_player_id = data.current_player_id;
    this.selected_piece_id = data.selected_piece_id;
  }

  static initialize(): GameModel {
    const game = GameModel.create({
      id: "game",
      current_player_id: "white-player",
      selected_piece_id: null,
    });

    // Create players
    const whitePlayer = PlayerModel.create({
      id: "white-player",
      game_id: game.id,
      color: "white",
    });

    const blackPlayer = PlayerModel.create({
      id: "black-player",
      game_id: game.id,
      color: "black",
    });

    // Initialize pieces for each player
    const initializePieces = (player: PlayerModel, baseRank: number) => {
      // Pawns
      for (let i = 0; i < 8; i++) {
        PawnModel.create({
          id: `${player.color}-pawn-${i}`,
          player_id: player.id,
          type: "pawn",
          color: player.color,
          position: { x: i, y: baseRank + (player.color === "white" ? -1 : 1) },
          captured: false,
          has_moved: false,
        });
      }

      // Other pieces
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

      pieces.forEach((type, i) => {
        const ModelClass = {
          pawn: PawnModel,
          rook: RookModel,
          knight: KnightModel,
          bishop: BishopModel,
          queen: QueenModel,
          king: KingModel,
        }[type] as typeof PieceModel;

        ModelClass.create({
          id: `${player.color}-${type}-${i}`,
          player_id: player.id,
          type,
          color: player.color,
          position: { x: i, y: baseRank },
          captured: false,
          has_moved: false,
        });
      });
    };

    initializePieces(whitePlayer, 7);
    initializePieces(blackPlayer, 0);

    return game;
  }
}

export class PlayerModel extends BaseModel.withType(DataType<Player>()) {
  game_id: string;
  color: PieceColor;

  constructor(data: Player) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      opponent: computed,
      pieces: computed,
      moves: computed,
      game: computed,
      isTurn: computed,
      isInCheck: computed,
      isInCheckMate: computed,
    });
  }

  get opponent(): PlayerModel {
    return this.game.players.find((p) => p.id !== this.id)!;
  }

  get pieces(): PieceModel[] {
    return PieceModel.getAll().filter((p) => p.player_id === this.id);
  }

  get moves(): MoveModel[] {
    return MoveModel.getAll().filter((m) => m.player_id === this.id);
  }

  get game(): GameModel {
    return GameModel.getById(this.game_id)!;
  }

  get isTurn(): boolean {
    return this.game.current_player_id === this.id;
  }

  get isInCheck(): boolean {
    const king = this.pieces.find((p) => p.type === "king");
    if (!king) return false;

    return this.opponent.pieces.some((piece) =>
      piece.validNextPositions.some(
        (pos) => pos.x === king.position.x && pos.y === king.position.y
      )
    );
  }

  get isInCheckMate(): boolean {
    if (!this.isInCheck) return false;
    return this.pieces.every((piece) => piece.validNextPositions.length === 0);
  }

  toJSON(): Player {
    return {
      id: this.id,
      game_id: this.game_id,
      color: this.color,
    };
  }

  loadJSON(data: Player) {
    this.game_id = data.game_id;
    this.color = data.color;
  }
}

export class PieceModel extends BaseModel.withType(DataType<Piece>()) {
  type: PieceType;
  player_id: string;
  color: PieceColor;
  position: Position;
  captured: boolean;
  has_moved: boolean;

  constructor(data: Piece) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      position: observable.ref,
      captured: observable.ref,
      has_moved: observable.ref,
      player: computed,
      validNextPositions: computed,
      isSelected: computed,
      canMove: computed,
      move: action,
    });
  }

  get player(): PlayerModel {
    return PlayerModel.getById(this.player_id)!;
  }

  get validNextPositions(): Position[] {
    return [];
  }

  get canMove(): boolean {
    return this.validNextPositions.length > 0;
  }

  move(to: Position): MoveModel | null {
    if (!this.player.isTurn) return null;
    if (!this.validNextPositions.some((p) => p.x === to.x && p.y === to.y))
      return null;

    const capturedPiece = this.player.game.getPieceAtPosition(to);

    if (capturedPiece) {
      capturedPiece.captured = true;
    }

    const move = MoveModel.create({
      id: `move-${Date.now()}`,
      game_id: this.player.game_id,
      player_id: this.player.id,
      piece_id: this.id,
      from: { ...this.position },
      to: { ...to },
      captured_piece_id: capturedPiece?.id,
      timestamp: Date.now(),
    });

    this.position = to;
    this.has_moved = true;

    this.player.game.switchPlayer();

    return move;
  }

  get isSelected() {
    return this.player.game.selected_piece_id === this.id;
  }

  protected isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  protected getSlidingMoves(directions: Position[]): Position[] {
    const moves: Position[] = [];

    for (const dir of directions) {
      let newPos = {
        x: this.position.x + dir.x,
        y: this.position.y + dir.y,
      };

      while (this.isValidPosition(newPos)) {
        const piece = this.player.game.getPieceAtPosition(newPos);

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

  toJSON(): Piece {
    return {
      id: this.id,
      player_id: this.player_id,
      type: this.type,
      color: this.color,
      position: this.position,
      captured: this.captured,
      has_moved: this.has_moved,
    };
  }

  loadJSON(data: Piece) {
    this.type = data.type;
    this.player_id = data.player_id;
    this.color = data.color;
    this.position = data.position;
    this.captured = data.captured;
    this.has_moved = data.has_moved;
  }
}

export class MoveModel extends BaseModel.withType(DataType<Move>()) {
  game_id: string;
  player_id: string;
  piece_id: string;
  from: Position;
  to: Position;
  captured_piece_id?: string;
  timestamp: number;

  constructor(data: Move) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      from: observable.ref,
      to: observable.ref,
      captured_piece_id: observable,
    });
  }

  toJSON(): Move {
    return {
      id: this.id,
      game_id: this.game_id,
      player_id: this.player_id,
      piece_id: this.piece_id,
      from: this.from,
      to: this.to,
      captured_piece_id: this.captured_piece_id,
      timestamp: this.timestamp,
    };
  }

  loadJSON(data: Move) {
    this.game_id = data.game_id;
    this.player_id = data.player_id;
    this.piece_id = data.piece_id;
    this.from = data.from;
    this.to = data.to;
    this.captured_piece_id = data.captured_piece_id;
    this.timestamp = data.timestamp;
  }
}

// Implement piece-specific models with their move logic
export class PawnModel extends PieceModel {
  type: "pawn" = "pawn";

  get validNextPositions(): Position[] {
    const moves: Position[] = [];
    const direction = this.color === "white" ? -1 : 1;
    const startRank = this.color === "white" ? 6 : 1;

    // Forward move
    const forward = { x: this.position.x, y: this.position.y + direction };
    if (
      this.isValidPosition(forward) &&
      !this.player.game.getPieceAtPosition(forward)
    ) {
      moves.push(forward);

      // Double move from starting position
      if (!this.has_moved) {
        const doubleForward = {
          x: this.position.x,
          y: this.position.y + 2 * direction,
        };
        if (!this.player.game.getPieceAtPosition(doubleForward)) {
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
        const piece = this.player.game.getPieceAtPosition(capture);
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

  get validNextPositions(): Position[] {
    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ];

    return this.getSlidingMoves(directions);
  }
}

export class KnightModel extends PieceModel {
  type: "knight" = "knight";

  get validNextPositions(): Position[] {
    const moves: Position[] = [];
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
        const piece = this.player.game.getPieceAtPosition(newPos);
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

  get validNextPositions(): Position[] {
    const directions = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    return this.getSlidingMoves(directions);
  }
}

export class QueenModel extends PieceModel {
  type: "queen" = "queen";

  get validNextPositions(): Position[] {
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

    return this.getSlidingMoves(directions);
  }
}

export class KingModel extends PieceModel {
  type: "king" = "king";

  get validNextPositions(): Position[] {
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

    return directions
      .map((dir) => ({
        x: this.position.x + dir.x,
        y: this.position.y + dir.y,
      }))
      .filter((pos) => {
        if (!this.isValidPosition(pos)) return false;
        const piece = this.player.game.getPieceAtPosition(pos);
        return !piece || piece.color !== this.color;
      });
  }
}

export const store = new Store({
  schemaVersion: 0,
  models: {
    GameModel,
    PlayerModel,
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
