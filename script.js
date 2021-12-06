const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');
const width = prompt("Image Width");
const depth = prompt("Image Height");
const height = prompt("Height (number of layers)");
class Layer {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.colorData = new Array(width);
    for (let i = 0; i < width; i++) {
      this.colorData.push(new Int32Array(height));
    }
    this.depthMapData = new Array(width);
    for (let i = 0; i < width; i++) {
      this.depthMapData.push(new Int32Array(height));
    }
  }
}
class IsometricRenderer {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Int32Array(width * height);
    this.depth = new Int32Array(width * height);
    this.whatWasDrawn = new Array(width * height);
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
        if (this.depth[index] <= localDepth && (!image.useDepthMap || image.depthMapData[i][j] != 0)) {
          this.depth[index] = localDepth;
          this.data[index] = image.colorData[i][j];
          this.whatWasDrawn[index] = id;
        }
      }
    }
  }

  copyToCanvas(ctx) {
    const imageData = ctx.getImageData(0, 0, this.width, this.height);
    for (let i = 0; i < this.data.length; i++) {
      imageData.data[i * 3] = (this.data[i] & 0xFF0000) >> 16;
      imageData.data[i * 3 + 1] = (this.data[i] & 0x00FF00) >> 8;
      imageData.data[i * 3 + 2] = (this.data[i] & 0x0000FF);
      imageData.data[i * 3 + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  idAt(x, y) {
    return this.whatWasDrawn[y * this.width + x];
  }
}