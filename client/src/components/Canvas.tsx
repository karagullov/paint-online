import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "../styles/canvas.scss";
import { observer } from "mobx-react-lite";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import { Modal, Button } from "react-bootstrap";
import Rect from "../tools/Rect";
import axios from "axios";

const Canvas = observer(() => {
  const canvasRef = useRef<any>();
  const usernameRef = useRef<any>();
  const params = useParams();
  const [modal, setModal] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasState.setCanvas(canvasRef.current);
    const ctx = canvasRef.current.getContext("2d");

    axios.get(`http://localhost:5000/image?id=${params.id}`).then((res) => {
      const img = new Image();
      img.src = res.data;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          img,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        ctx.stroke();
      };
    });
  }, []);

  const mouseDownHandler = () => {
    canvasState.pushToUndo(canvasRef.current.toDataURL());
    axios
      .post(`http://localhost:5000/image?id=${params.id}`, {
        img: canvasRef.current.toDataURL(),
      })
      .then((res) => console.log(res.data));
  };

  const connectHandler = () => {
    canvasState.setUsername(usernameRef.current.value);
    if (!canvasState.username) return;

    const socket = new WebSocket("ws://localhost:5000/");
    canvasState.setSocket(socket);
    canvasState.setSessionId(params.id as string);
    toolState.setTool(
      new Brush(canvasRef.current, socket, params.id as string)
    );
    socket.onopen = () => {
      console.log("Connected");
      socket.send(
        JSON.stringify({
          id: params.id,
          username: canvasState.username,
          method: "connection",
        })
      );
    };
    setModal(false);
    socket.onmessage = (event) => {
      let msg = JSON.parse(event.data);
      switch (msg.method) {
        case "connection":
          console.log("User " + msg.username + " connected");
          break;
        case "draw":
          drawHandler(msg);
          break;
      }
    };
  };

  const drawHandler = (msg: any) => {
    const fiqure = msg.fiqure;
    const ctx = canvasRef.current.getContext("2d");

    switch (fiqure.type) {
      case "brush":
        Brush.draw(ctx, fiqure.x, fiqure.y);
        break;
      case "rect":
        Rect.staticDraw(
          ctx,
          fiqure.x,
          fiqure.y,
          fiqure.width,
          fiqure.height,
          fiqure.color
        );
        break;
      case "finish":
        ctx.beginPath();
        break;
    }
  };

  return (
    <div className="canvas">
      <Modal show={modal} onHide={() => {}}>
        <Modal.Header closeButton>
          <Modal.Title>Enter your name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="text" ref={usernameRef} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={connectHandler}>
            Login
          </Button>
        </Modal.Footer>
      </Modal>
      <canvas
        onMouseDown={mouseDownHandler}
        ref={canvasRef as any}
        width={600}
        height={400}
      ></canvas>
    </div>
  );
});

export default Canvas;
