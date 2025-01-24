export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";
export type PieceColor = "white" | "black";
export type Position = { x: number; y: number };

export interface BaseData {
  id: string;
}

export interface Piece extends BaseData {
  player_id: string;
  type: PieceType;
  color: PieceColor;
  position: Position;
  captured: boolean;
  has_moved: boolean;
}

export interface Game extends BaseData {
  current_player_id: string;
  selected_piece_id: string | null;
}

export interface Player extends BaseData {
  game_id: string;
  color: PieceColor;
}

export interface Move extends BaseData {
  game_id: string;
  player_id: string;
  piece_id: string;
  from: Position;
  to: Position;
  captured_piece_id?: string;
  timestamp: number;
}
