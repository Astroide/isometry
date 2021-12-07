let currentColor = '#000000';
function createColorElement(color) {
  let colorElement = document.createElement('div');
  colorElement.className = 'color';
  colorElement.style.backgroundColor = color;
  colorElement.addEventListener('click', () => {
    setColor(color);
  });
  return colorElement;
}
function setColor(color, fromInput) {
  currentColor = color;
  if (!fromInput) {
    document.querySelector('input[type=color]').value = currentColor;
  } else {
    document.querySelector('#colors').appendChild(createColorElement(currentColor));
  }
}
function generatePng(element) {
  let canvas = document.createElement('canvas');
  canvas.width = layers[0].width;
  canvas.height = layers[0].height + (layers.length - 1);
  document.body.appendChild(canvas);
  let ctx = canvas.getContext('2d');
  for (let i = 0; i < layers.length; i++) {
    for (let x = 0; x < layers[i].width; x++) {
      for (let y = 0; y < layers[i].height; y++) {
        if (layers[i].colorData[y][x]) {
          let color = (layers[i].colorData[y][x] || '#000000') + (layers[i].colorData[y][x] ? 'ff' : '00');
          let r = parseInt(color.slice(1, 3), 16);
          let g = parseInt(color.slice(3, 5), 16);
          let b = parseInt(color.slice(5, 7), 16);
          let a = parseInt(color.slice(7, 9), 16);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
          ctx.fillRect(x, y + (layers.length - 1) - i, 1, 1);
          // console.log(r, g, b);
          // setPixel(data, x, y + (layers.length - 1) - i, r, g, b, a);
        }
      }
    }
  }
  // ctx.putImageData(data, 0, 0);
  element.download = 'image.png';
  element.href = canvas.toDataURL('image/png');
  canvas.remove();
}
function generateDmPng(element) {
  let canvas = document.createElement('canvas');
  canvas.width = layers[0].width;
  canvas.height = layers[0].height + (layers.length - 1);
  document.body.appendChild(canvas);
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < layers.length; i++) {
    for (let x = 0; x < layers[i].width; x++) {
      for (let y = 0; y < layers[i].height; y++) {
        if (layers[i].colorData[y][x]) {
          let layerHeight = ((layers.length - 1) - i) - layers[i].height;
          let depth = layerHeight + (layers[i].height - y) + 128;
          ctx.fillStyle = `rgba(${depth}, ${depth}, ${depth}, 1)`;
          ctx.fillRect(x, y + (layers.length - 1) - i, 1, 1);
          // console.log(r, g, b);
          // setPixel(data, x, y + (layers.length - 1) - i, r, g, b, a);
        }
      }
    }
  }
  // ctx.putImageData(data, 0, 0);
  element.download = 'image.dm.png';
  element.href = canvas.toDataURL('image/png');
  canvas.remove();
}
class Layer {
  constructor(width, height, id, maxLayers) {
    this.width = width;
    this.height = height;
    this.colorData = [];
    for (let i = 0; i < width; i++) {
      this.colorData.push(new Array(height));
      for (let j = 0; j < height; j++) {
        this.colorData[i][j] = null;
      }
    }
    const layerElement = document.createElement('div');
    layerElement.className = 'layer';
    layerElement.style.zIndex = id * 10;
    for (let i = 0; i < height; i++) {
      const row = document.createElement('div');
      row.className = 'row';
      for (let j = 0; j < width; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.zIndex = id * 10;
        let self = this;
        cell.addEventListener('click', () => {
          if (cell.parentElement.parentElement.classList.contains('active')) {
            let x = i;
            let y = j;
            cell.style.backgroundColor = currentColor;
            self.colorData[x][y] = currentColor;
          }
        });
        row.appendChild(cell);
      }
      layerElement.appendChild(row);
    }
    const numberElement = document.createElement('div');
    this.numberElement = numberElement;
    numberElement.className = 'layer-number';
    numberElement.innerText = id;
    numberElement.style.top = `${(maxLayers - id) * 20 + 40}px`;
    let layer = this;
    numberElement.addEventListener('click', () => {
      layer.setActive(true);
    });
    document.querySelector('#layers').appendChild(numberElement);
    layerElement.style.left = '40px';
    layerElement.style.top = `${(maxLayers - id) * 20 + 40}px`;
    this.element = layerElement;
    document.querySelector('#layers').appendChild(layerElement);
  }

  setActive(value) {
    if (value) {
      document.querySelectorAll('.layer').forEach(layer => {
        layer.classList.remove('active');
      });
      document.querySelectorAll('.layer-number').forEach(layer => {
        layer.classList.remove('active');
      });
      this.element.classList.add('active');
      this.numberElement.classList.add('active');
    } else {
      this.element.classList.remove('active');
      this.numberElement.classList.remove('active');
    }
  }
}
let layers = [];
const width = parseInt(prompt('width'));
const height = parseInt(prompt('height'));
const depth = parseInt(prompt('depth'));
for (let i = 0; i < height; i++) {
  layers.push(new Layer(width, depth, i, height));
}
layers[0].setActive(true);