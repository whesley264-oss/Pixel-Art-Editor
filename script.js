const canvas = document.querySelector(".canvas");
const inputSize = document.querySelector(".input-size");
const inputColor = document.querySelector(".input-color");
const usedColors = document.querySelector(".used-colors");
const brushBtn = document.getElementById("brush");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const saveBtn = document.getElementById("save");

let currentColor = inputColor.value;
let isPainting = false;
let isEraser = false;
let undoStack = [];
let redoStack = [];

function createElement(tag, className = "") {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
}

function setPixelColor(pixel) {
    const prevColor = pixel.style.backgroundColor;
    undoStack.push({ pixel: pixel, prevColor: prevColor });
    redoStack = [];
    pixel.style.backgroundColor = isEraser ? "#444" : currentColor;

    // histórico de cores diferentes
    if (!isEraser && currentColor != "#444") {
        const saved = Array.from(usedColors.children);
        if (saved.every(b => b.getAttribute("data-color") !== currentColor)) {
            const btn = createElement("button", "button-color");
            btn.style.backgroundColor = currentColor;
            btn.setAttribute("data-color", currentColor);
            btn.addEventListener("click", () => {
                currentColor = btn.getAttribute("data-color");
                inputColor.value = currentColor;
                isEraser = false;
            });
            usedColors.appendChild(btn);
        }
    }
}

function createPixel() {
    const pixel = createElement("div", "pixel");
    pixel.addEventListener("mousedown", () => {
        isPainting = true;
        setPixelColor(pixel);
    });
    pixel.addEventListener("mouseover", () => {
        if (isPainting) {
            setPixelColor(pixel);
        }
    });
    return pixel;
}

function loadCanvas() {
    const size = inputSize.value;
    canvas.innerHTML = "";
    for (let i = 0; i < size; i++) {
        const row = createElement("div", "row");
        for (let j = 0; j < size; j++) {
            row.appendChild(createPixel());
        }
        canvas.appendChild(row);
    }
}

// eventos
canvas.addEventListener("mouseup", () => isPainting = false);
inputSize.addEventListener("change", loadCanvas);
inputColor.addEventListener("change", () => {
    currentColor = inputColor.value;
    isEraser = false;
});

// desfazer e refazer
function undo() {
    if (undoStack.length === 0) return;
    const last = undoStack.pop();
    redoStack.push({ pixel: last.pixel, prevColor: last.pixel.style.backgroundColor });
    last.pixel.style.backgroundColor = last.prevColor;
}

function redo() {
    if (redoStack.length === 0) return;
    const last = redoStack.pop();
    undoStack.push({ pixel: last.pixel, prevColor: last.pixel.style.backgroundColor });
    last.pixel.style.backgroundColor = last.prevColor;
}

// borracha
brushBtn.addEventListener("click", () => isEraser = true);
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

// salvar imagem
saveBtn.addEventListener("click", () => {
    // Primeiro, o html2canvas processa a imagem do canvas de forma assíncrona
    html2canvas(canvas).then(c => {
        // Depois que a imagem estiver pronta, perguntamos o nome do arquivo
        let filename = prompt("Digite o nome do arquivo:", "pixelart");

        // Se o usuário cancelar ou não digitar nada, usamos um nome padrão
        if (!filename) {
            filename = "pixelart";
        }

        // Criamos o link de download
        const link = createElement("a");
        link.href = c.toDataURL("image/png"); // Define a imagem como URL
        link.download = filename + ".png";  // Define o nome do arquivo

        // Adicionamos o link ao corpo do documento, clicamos e removemos
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});