import React from "react";
import "../styles/toolbar.scss";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import canvasState from "../store/canvasState";
import Rect from "../tools/Rect";

const Toolbar = () => {
  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    toolState.setStrokeColor(e.target.value);
    toolState.setFillColor(e.target.value);
  };

  const download = () => {
    if (!canvasState.canvas) return;
    const dataUrl = canvasState.canvas.toDataURL();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = canvasState.sessionId + ".jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="toolbar">
      <button
        className="toolbar__btn brush"
        onClick={() =>
          toolState.setTool(
            new Brush(
              canvasState.canvas as HTMLCanvasElement,
              canvasState.socket as WebSocket,
              canvasState.sessionId as string
            )
          )
        }
      />
      <button
        className="toolbar__btn rect"
        onClick={() =>
          toolState.setTool(
            new Rect(
              canvasState.canvas as HTMLCanvasElement,
              canvasState.socket as WebSocket,
              canvasState.sessionId as string
            )
          )
        }
      />
      <button className="toolbar__btn circle" />
      <button className="toolbar__btn eraser" />
      <button className="toolbar__btn line" />
      <input
        onChange={changeColor}
        style={{ marginLeft: 10 }}
        type="color"
        name=""
        id=""
      />
      <button
        onClick={() => canvasState.undo()}
        className="toolbar__btn undo"
      />
      <button
        onClick={() => canvasState.redo()}
        className="toolbar__btn redo"
      />
      <button onClick={download} className="toolbar__btn save" />
    </div>
  );
};

export default Toolbar;
