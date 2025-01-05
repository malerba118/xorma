import { DataType, Model, Store } from "xorm";
import {
  makeObservable,
  observable,
  action,
  computed,
  runInAction,
} from "mobx";
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
  currentPlayerId: string;
  selectedPieceId: string | null = null;

  constructor(data: Game) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      currentPlayerId: observable,
      selectedPieceId: observable,
      players: computed,
      currentPlayer: computed,
      selectedPiece: computed,
      isOver: computed,
      winner: computed,
      loser: computed,
      selectPiece: action,
      switchPlayer: action,
    });
  }

  get players(): PlayerModel[] {
    return PlayerModel.getAll().filter((p) => p.gameId === this.id);
  }

  get currentPlayer(): PlayerModel {
    return this.players.find((p) => p.id === this.currentPlayerId)!;
  }

  get selectedPiece() {
    return this.pieces.find((p) => p.id === this.selectedPieceId) || null;
  }

  get isOver(): boolean {
    return this.players.some((p) => p.isInCheckMate);
  }

  get winner(): PlayerModel | null {
    return this.loser?.opponent ?? null;
  }

  get loser(): PlayerModel | null {
    return this.players.find((p) => p.isInCheckMate) ?? null;
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
    this.currentPlayerId = this.currentPlayer.opponent.id;
  }

  selectPiece(pieceId: string | null) {
    this.selectedPieceId = pieceId;
  }

  toJSON(): Game {
    return {
      id: this.id,
      current_player_id: this.currentPlayerId,
      selected_piece_id: this.selectedPieceId,
    };
  }

  loadJSON(data: Game) {
    this.currentPlayerId = data.current_player_id;
    this.selectedPieceId = data.selected_piece_id;
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
  gameId: string;
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
    return PieceModel.getAll().filter((p) => p.playerId === this.id);
  }

  get moves(): MoveModel[] {
    return MoveModel.getAll().filter((m) => m.playerId === this.id);
  }

  get game(): GameModel {
    return GameModel.getById(this.gameId)!;
  }

  get isTurn(): boolean {
    return this.game.currentPlayerId === this.id;
  }

  get isInCheck(): boolean {
    const king = this.pieces.find((p) => p.type === "king");
    if (!king) return false;

    return this.opponent.pieces.some((piece) => {
      if (piece.captured) return false;
      return piece
        .getBasicMoves()
        .some((pos) => pos.x === king.position.x && pos.y === king.position.y);
    });
  }

  get isInCheckMate(): boolean {
    if (!this.isInCheck) return false;
    return this.pieces
      .filter((piece) => !piece.captured)
      .every((piece) => piece.validNextPositions.length === 0);
  }

  toJSON(): Player {
    return {
      id: this.id,
      game_id: this.gameId,
      color: this.color,
    };
  }

  loadJSON(data: Player) {
    this.gameId = data.game_id;
    this.color = data.color;
  }
}

export class PieceModel extends BaseModel.withType(DataType<Piece>()) {
  type: PieceType;
  playerId: string;
  color: PieceColor;
  position: Position;
  captured: boolean;
  hasMoved: boolean;

  constructor(data: Piece) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      position: observable.ref,
      captured: observable.ref,
      hasMoved: observable.ref,
      player: computed,
      validNextPositions: computed,
      isSelected: computed,
      canMove: computed,
      move: action,
    });
  }

  get player(): PlayerModel {
    return PlayerModel.getById(this.playerId)!;
  }

  getBasicMoves(): Position[] {
    return [];
  }

  protected wouldMoveResultInCheck(to: Position): boolean {
    return store.batch((options) => {
      options.revertChanges();
      const capturedPiece = this.player.game.getPieceAtPosition(to);
      this.position = to;
      if (capturedPiece) {
        capturedPiece.captured = true;
      }
      return this.player.isInCheck;
    });
  }

  get validNextPositions(): Position[] {
    if (!this.player.isTurn) return [];
    let positions: Position[] = [];
    runInAction(() => {
      positions = this.getBasicMoves().filter(
        (pos) => !this.wouldMoveResultInCheck(pos)
      );
    });
    return positions;
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

    var move = MoveModel.create({
      id: `move-${Date.now()}`,
      game_id: this.player.gameId,
      player_id: this.player.id,
      piece_id: this.id,
      from: { ...this.position },
      to: { ...to },
      captured_piece_id: capturedPiece?.id,
      timestamp: Date.now(),
    });

    this.position = to;
    this.hasMoved = true;

    this.player.game.switchPlayer();

    return move;
  }

  get isSelected() {
    return this.player.game.selectedPieceId === this.id;
  }

  protected isInBounds(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  protected getSlidingMoves(directions: Position[]): Position[] {
    const moves: Position[] = [];

    for (const dir of directions) {
      let newPos = {
        x: this.position.x + dir.x,
        y: this.position.y + dir.y,
      };

      while (this.isInBounds(newPos)) {
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
      player_id: this.playerId,
      type: this.type,
      color: this.color,
      position: this.position,
      captured: this.captured,
      has_moved: this.hasMoved,
    };
  }

  loadJSON(data: Piece) {
    this.type = data.type;
    this.playerId = data.player_id;
    this.color = data.color;
    this.position = data.position;
    this.captured = data.captured;
    this.hasMoved = data.has_moved;
  }
}

export class MoveModel extends BaseModel.withType(DataType<Move>()) {
  gameId: string;
  playerId: string;
  pieceId: string;
  from: Position;
  to: Position;
  capturedPieceId?: string;
  timestamp: number;

  constructor(data: Move) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      from: observable.ref,
      to: observable.ref,
      capturedPieceId: observable,
    });
  }

  toJSON(): Move {
    return {
      id: this.id,
      game_id: this.gameId,
      player_id: this.playerId,
      piece_id: this.pieceId,
      from: this.from,
      to: this.to,
      captured_piece_id: this.capturedPieceId,
      timestamp: this.timestamp,
    };
  }

  loadJSON(data: Move) {
    this.gameId = data.game_id;
    this.playerId = data.player_id;
    this.pieceId = data.piece_id;
    this.from = data.from;
    this.to = data.to;
    this.capturedPieceId = data.captured_piece_id;
    this.timestamp = data.timestamp;
  }
}

// Implement piece-specific models with their move logic
export class PawnModel extends PieceModel {
  type: "pawn" = "pawn";

  getBasicMoves(): Position[] {
    const moves: Position[] = [];
    const direction = this.color === "white" ? -1 : 1;

    // Forward move
    const forward = { x: this.position.x, y: this.position.y + direction };
    if (
      this.isInBounds(forward) &&
      !this.player.game.getPieceAtPosition(forward)
    ) {
      moves.push(forward);

      // Double move from starting position
      if (!this.hasMoved) {
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
      if (this.isInBounds(capture)) {
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

  getBasicMoves(): Position[] {
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

  getBasicMoves(): Position[] {
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

      if (this.isInBounds(newPos)) {
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

  getBasicMoves(): Position[] {
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

  getBasicMoves(): Position[] {
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

  getBasicMoves(): Position[] {
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
        if (!this.isInBounds(pos)) return false;
        const piece = this.player.game.getPieceAtPosition(pos);
        return !piece || piece.color !== this.color;
      });
  }
}

export const store = new Store({
  schemaVersion: 0,
  models: {
    BaseModel,
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
