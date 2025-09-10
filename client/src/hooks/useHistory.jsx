import { useState } from "react";
import { socket } from "../api/socket";

export default function useHistory(initialState, session) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const setState = (action, overwrite = false, emit = true) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;

    if (session) {
      if (action == "prevState") return;

      if (overwrite) {
        // In collaboration mode, we still need to maintain history for undo/redo
        const historyCopy = [...history];
        historyCopy[index] = newState;
        setHistory(historyCopy);
      } else {
        // Add to history normally
        const updatedState = [...history].slice(0, index + 1);
        setHistory([...updatedState, newState]);
        setIndex((prevState) => prevState + 1);
      }

      if (emit) {
        socket.emit("getElements", { elements: newState, room: session });
      }
      return;
    }

    if (action == "prevState") {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, history[index - 1]]);
      setIndex((prevState) => prevState - 1);
      return;
    }

    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prevState) => prevState + 1);
    }
  };

  const undo = () => {
    const newIndex = index > 0 ? index - 1 : index;
    setIndex(newIndex);

    if (session && newIndex !== index) {
      // Emit the current state after undo
      socket.emit("getElements", { elements: history[newIndex], room: session });
    }
  };

  const redo = () => {
    const newIndex = index < history.length - 1 ? index + 1 : index;
    setIndex(newIndex);

    if (session && newIndex !== index) {
      // Emit the current state after redo
      socket.emit("getElements", { elements: history[newIndex], room: session });
    }
  };

  return [history[index], setState, undo, redo];
}
