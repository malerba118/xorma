"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GameModel, PieceModel, PlayerModel, store } from "./models";
import { observer } from "mobx-react-lite";
import { cn } from "@/lib/utils";
import { action, autorun } from "mobx";
import { motion } from "framer-motion";
import { Position } from "./types";

const Piece = observer(({ piece }: { piece: PieceModel }) => {
  return (
    <motion.div
      key={piece.id}
      layout
      layoutId={piece.id}
      className={cn(
        "relative w-full h-full flex justify-center items-center p-3"
      )}
    >
      {piece.isSelected && (
        <div className="absolute inset-0 bg-fuchsia-400/50" />
      )}
      <img
        src={`/pieces/${piece.type}.svg`}
        className="relative h-full"
        style={{
          filter: `${
            piece.color === "black"
              ? "invert(1) drop-shadow(1px 1px 0px rgba(255,255,255,0.5))"
              : ""
          }`,
        }}
      />
    </motion.div>
  );
});

const BoardPosition = observer(
  ({ pos, game }: { pos: Position; game: GameModel }) => {
    const isLight = (pos.x + pos.y) % 2 === 0;
    const piece = game.getPieceAtPosition(pos);
    const isSelected = piece?.id === game.selected_piece_id;
    const isValidMove = game.selectedPiece?.validNextPositions.some(
      (p) => p.x === pos.x && p.y === pos.y
    );

    return (
      <div
        key={`${pos.x}-${pos.y}`}
        className={cn(
          "aspect-[1] flex items-center justify-center cursor-pointer relative ring-inset",
          isLight ? "bg-white/[5%]" : "bg-white/[9%]",
          isValidMove && "ring-1 ring-fuchsia-400/30"
        )}
        onClick={() => {
          const clickedPiece = game.getPieceAtPosition(pos);
          if (game.selectedPiece) {
            if (game.selectedPiece.move(pos)) {
              store.history.commit();
              game.selectPiece(null);
              return;
            }
          }
          if (clickedPiece?.player.isTurn) {
            game.selectPiece(clickedPiece.id);
            return;
          }
          game.selectPiece(null);
        }}
      >
        {isValidMove && <div className="absolute inset-0 bg-fuchsia-400/5" />}
        {piece && <Piece piece={piece} />}
      </div>
    );
  }
);

const ChessGame = observer(() => {
  const [game] = useState<GameModel>(() => GameModel.initialize());

  useEffect(() => {
    store.history.commit();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="relative flex gap-4">
        <motion.div
          layout="position"
          style={{
            alignSelf: game.currentPlayer.color === "white" ? "end" : "start",
          }}
          className="h-20 bg-white w-1 rounded-full mt-2 mb-14"
        />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-8 gap-[0px] w-full max-w-xl rounded-xl overflow-hidden">
            {Array.from({ length: 8 }, (_, y) =>
              Array.from({ length: 8 }, (_, x) => (
                <BoardPosition key={`${x}-${y}`} game={game} pos={{ x, y }} />
              ))
            )}
          </div>
          <div className="flex w-full justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => {
                store.history.undo();
                game.selectPiece(null);
              }}
            >
              Undo
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                store.history.redo();
                game.selectPiece(null);
              }}
            >
              Redo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChessGame;
