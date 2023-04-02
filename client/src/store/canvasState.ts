import { makeAutoObservable } from "mobx";

class CanvasState {
  canvas: HTMLCanvasElement | null = null;
  undoList: string[] = [];
  redoList: string[] = [];
  username = "";
  socket: WebSocket | null = null;
  sessionId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  setUsername(username: string) {
    this.username = username;
  }

  setSocket(socket: WebSocket) {
    this.socket = socket;
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  pushToUndo(data: string) {
    this.undoList.push(data);
  }

  redoToUndo(data: string) {
    this.redoList.push(data);
  }

  undo() {
    if (!this.canvas) return;

    let ctx = this.canvas.getContext("2d");
    if (this.undoList.length > 0) {
      let dataUrl = this.undoList.pop();
      this.redoList.push(this.canvas.toDataURL());
      let img = new Image();
      img.src = dataUrl as string;
      img.onload = () => {
        if (!this.canvas) return;
        ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx?.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      };
    } else {
      ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  redo() {
    if (!this.canvas) return;

    let ctx = this.canvas.getContext("2d");
    if (this.redoList.length > 0) {
      let dataUrl = this.redoList.pop();
      this.undoList.push(this.canvas.toDataURL());
      let img = new Image();
      img.src = dataUrl as string;
      img.onload = () => {
        if (!this.canvas) return;
        ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx?.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      };
    } else {
      ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

export default new CanvasState();
