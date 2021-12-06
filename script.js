/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("#canvas");
/** @type {HTMLCanvasElement} */
const targetCanvas = document.querySelector("#target");
const ctx = canvas.getContext('2d');
const targetCtx = targetCanvas.getContext('2d');
const width = parseInt(prompt("Image Width"));
const depth = parseInt(prompt("Image Height"));
class Layer {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.colorData = [];
    for (let i = 0; i < width; i++) {
      this.colorData.push(new Int32Array(height));
      for (let j = 0; j < height; j++) {
        this.colorData[i][j] = Math.floor(Math.random() * 0xFFFFFF);
      }
    }
    this.depthMapData = [];
    for (let i = 0; i < width; i++) {
      this.depthMapData.push(new Int32Array(height));
      for (let j = 0; j < height; j++) {
        this.depthMapData[i][j] = 128;
      }
    }
    this.active = true;
    this.important = false;
    this.useDepthMap = true;
  }

  setImportant(value) {
    this.important = value;
    
  }
}
class IsometricRenderer {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Int32Array(width * height);
    this.depth = new Int32Array(width * height);
    this.whatWasDrawn = new Array(width * height);
    this.noOverride = new Array(width * height);

    for (let i = 0; i < this.noOverride.length; i++) {
      this.noOverride[i] = false;
    }
    this.setTranslation(0, 0);
    this.setAdditionalTranslation(0, 0);
  }

  resize(newWidth, newHeight) {
    if (this.width == newWidth && this.height == newHeight) {
      return;
    }
    this.width = newWidth;
    this.height = newHeight;
    this.data = new Int32Array(width * height);
    this.depth = new Int32Array(width * height);
    this.whatWasDrawn = new Array(width * height);
    this.noOverride = new Array(width * height);

    for (let i = 0; i < this.noOverride.length; i++) {
      this.noOverride[i] = false;
    }
  }

  setTranslation(x, y) {
    this.xOffset = x;
    this.yOffset = y;
  }

  setAdditionalTranslation(x, y) {
    this.xTranslation = x;
    this.yTranslation = y;
  }

  clear() {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = 0;
    }
    for (let i = 0; i < this.depth.length; i++) {
      this.depth[i] = -2147483648;
    }
    for (let i = 0; i < this.whatWasDrawn.length; i++) {
      this.whatWasDrawn[i] = 0;
    }
    for (let i = 0; i < this.noOverride.length; i++) {
      this.noOverride[i] = false;
    }
  }

  transformPoint(x, y, z) {
    let targetX = (x - z);
    let targetY = -(x + z) / 2 - y;
    return [targetX, targetY];
  }

  drawImage(image, x, y, z, id) {
    let targetX = (x - z);
    let targetY = -(x + z) / 2 - y;
    let baseDepth = -(x + z) / 2 + y;
    let rx = targetX + (this.xOffset + this.xTranslation) - image.width / 2;
    let ry = targetY + (this.yOffset + this.yTranslation) - image.height;
    if (rx >= this.width || ry >= this.height || (rx + image.width) < 0 || (ry + image.height) < 0) {
      return;
    }
    for (let i = 0; i < image.width; i++) {
      for (let j = 0; j < image.height; j++) {
        let tx = targetX + i - image.width / 2 + (this.xOffset + this.xTranslation);
        let ty = targetY + j - image.height + (this.yOffset + this.yTranslation);
        if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) {
          continue;
        }
        let index = (ty * this.width + tx);
        let localDepth = image.useDepthMap ? (baseDepth + (image.depthMapData[i][j] - 128)) : baseDepth;
        if (this.depth[index] <= localDepth) {
          if ((!image.useDepthMap || image.depthMapData[i][j] != 0)) {
            this.depth[index] = localDepth;
            this.data[index] = image.colorData[i][j];
            if (!this.noOverride[index]) {
              this.whatWasDrawn[index] = id;
            }
          }
        } else if (image.depthMapData[i][j] == 255) {
          this.noOverride[index] = true;
          this.whatWasDrawn[index] = id;
        }
      }
    }
  }

  copyToCanvas(ctx) {
    const imageData = ctx.getImageData(0, 0, this.width, this.height);
    for (let i = 0; i < this.data.length; i++) {
      imageData.data[i * 4] = (this.data[i] & 0xFF0000) >> 16;
      imageData.data[i * 4 + 1] = (this.data[i] & 0x00FF00) >> 8;
      imageData.data[i * 4 + 2] = (this.data[i] & 0x0000FF);
      imageData.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  idAt(x, y) {
    return this.whatWasDrawn[y * this.width + x];
  }
}
let layers = [];
layers.push(new Layer(width, depth));
let renderer = new IsometricRenderer(100, 100);
function render() {
  renderer.clear();
  renderer.setTranslation(50, 100);
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].active) {
      renderer.drawImage(layers[i], 0, i, 0, 0);
    }
  }
  targetCtx.clearRect(0, 0, 100, 100);
  renderer.copyToCanvas(targetCtx);
  ctx.clearRect(0, 0, 200, 200);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(targetCanvas, 0, 0, 400, 400);
}
render();