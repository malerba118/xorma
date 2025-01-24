"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GameModel, PieceModel, PlayerModel, store } from "./models";
import { observer } from "mobx-react-lite";
import { cn } from "@/lib/utils";
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
        <div className="absolute inset-0 bg-fuchsia-400/60" />
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
    const isValidMove = game.selectedPiece?.validNextPositions.some(
      (p) => p.x === pos.x && p.y === pos.y
    );

    return (
      <button
        key={`${pos.x}-${pos.y}`}
        className={cn(
          "aspect-[1] flex items-center justify-center cursor-pointer relative ring-inset transition-colors duration-100",
          isLight
            ? "bg-white/[5%] hover:bg-white/[13.5%]"
            : "bg-white/[10%] hover:bg-white/[13.5%]"
        )}
        onClick={() => {
          const clickedPiece = game.getPieceAtPosition(pos);
          if (game.selectedPiece) {
            if (game.selectedPiece.move(pos)) {
              store.history.commit();
              game.setSelectedPieceId(null);
              return;
            }
          }
          if (clickedPiece?.player.isTurn) {
            game.setSelectedPieceId(clickedPiece.id);
            return;
          }
          game.setSelectedPieceId(null);
        }}
        aria-label={`Board position ${pos.x}, ${pos.y}`}
      >
        {piece && <Piece piece={piece} />}
        {isValidMove && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-1/2 ring-2 ring-fuchsia-400/60 rounded-full" />
          </div>
        )}
      </button>
    );
  }
);

const ChessGame = observer(() => {
  const [game] = useState<GameModel>(() => GameModel.initialize());

  useEffect(() => {
    store.history.commit();
  }, []);

  useEffect(() => {
    if (game.winner) {
      alert(`${game.winner.color} wins!`);
    }
  }, [game.winner]);

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
                game.setSelectedPieceId(null);
              }}
            >
              Undo
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                store.history.redo();
                game.setSelectedPieceId(null);
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
