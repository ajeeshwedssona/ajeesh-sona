(function () {
  "use strict";

  // Compact, dependency-free QR encoder for URLs up to 134 UTF-8 bytes.
  // It generates a standards-compliant Version 6, error-correction level L code.
  const VERSION = 6;
  const SIZE = VERSION * 4 + 17;
  const DATA_CODEWORDS = 136;
  const ECC_CODEWORDS_PER_BLOCK = 18;
  const BLOCK_COUNT = 2;
  const MASK = 0;
  const FORMAT_ECL_L = 1;

  const gfExp = new Uint8Array(512);
  const gfLog = new Uint8Array(256);
  let value = 1;
  for (let index = 0; index < 255; index += 1) {
    gfExp[index] = value;
    gfLog[value] = index;
    value <<= 1;
    if (value & 0x100) {
      value ^= 0x11d;
    }
  }
  for (let index = 255; index < gfExp.length; index += 1) {
    gfExp[index] = gfExp[index - 255];
  }

  function gfMultiply(left, right) {
    if (left === 0 || right === 0) {
      return 0;
    }
    return gfExp[gfLog[left] + gfLog[right]];
  }

  function multiplyPolynomials(left, right) {
    const result = new Uint8Array(left.length + right.length - 1);
    for (let i = 0; i < left.length; i += 1) {
      for (let j = 0; j < right.length; j += 1) {
        result[i + j] ^= gfMultiply(left[i], right[j]);
      }
    }
    return result;
  }

  function createGenerator(degree) {
    let generator = new Uint8Array([1]);
    for (let index = 0; index < degree; index += 1) {
      generator = multiplyPolynomials(generator, new Uint8Array([1, gfExp[index]]));
    }
    return generator;
  }

  const generator = createGenerator(ECC_CODEWORDS_PER_BLOCK);

  function calculateEcc(data) {
    const working = new Uint8Array(data.length + ECC_CODEWORDS_PER_BLOCK);
    working.set(data);
    for (let index = 0; index < data.length; index += 1) {
      const factor = working[index];
      if (factor === 0) {
        continue;
      }
      for (let offset = 0; offset < generator.length; offset += 1) {
        working[index + offset] ^= gfMultiply(generator[offset], factor);
      }
    }
    return Array.from(working.slice(data.length));
  }

  function appendBits(bits, number, length) {
    for (let shift = length - 1; shift >= 0; shift -= 1) {
      bits.push((number >>> shift) & 1);
    }
  }

  function encodeData(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    if (bytes.length > 134) {
      throw new Error("The website URL is too long for the local QR code.");
    }

    const bits = [];
    appendBits(bits, 0b0100, 4);
    appendBits(bits, bytes.length, 8);
    bytes.forEach((byte) => appendBits(bits, byte, 8));

    const capacity = DATA_CODEWORDS * 8;
    appendBits(bits, 0, Math.min(4, capacity - bits.length));
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }

    const data = [];
    for (let index = 0; index < bits.length; index += 8) {
      let byte = 0;
      for (let offset = 0; offset < 8; offset += 1) {
        byte = (byte << 1) | bits[index + offset];
      }
      data.push(byte);
    }

    let useFirstPad = true;
    while (data.length < DATA_CODEWORDS) {
      data.push(useFirstPad ? 0xec : 0x11);
      useFirstPad = !useFirstPad;
    }
    return data;
  }

  function createCodewords(text) {
    const data = encodeData(text);
    const blockSize = DATA_CODEWORDS / BLOCK_COUNT;
    const blocks = [];
    const eccBlocks = [];

    for (let block = 0; block < BLOCK_COUNT; block += 1) {
      const part = data.slice(block * blockSize, (block + 1) * blockSize);
      blocks.push(part);
      eccBlocks.push(calculateEcc(part));
    }

    const result = [];
    for (let index = 0; index < blockSize; index += 1) {
      for (let block = 0; block < BLOCK_COUNT; block += 1) {
        result.push(blocks[block][index]);
      }
    }
    for (let index = 0; index < ECC_CODEWORDS_PER_BLOCK; index += 1) {
      for (let block = 0; block < BLOCK_COUNT; block += 1) {
        result.push(eccBlocks[block][index]);
      }
    }
    return result;
  }

  function createBlankMatrix() {
    return {
      modules: Array.from({ length: SIZE }, () => Array(SIZE).fill(false)),
      reserved: Array.from({ length: SIZE }, () => Array(SIZE).fill(false))
    };
  }

  function setFunction(matrix, x, y, dark) {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) {
      return;
    }
    matrix.modules[y][x] = Boolean(dark);
    matrix.reserved[y][x] = true;
  }

  function drawFinder(matrix, centerX, centerY) {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        const dark = distance !== 2 && distance !== 4;
        setFunction(matrix, centerX + dx, centerY + dy, dark);
      }
    }
  }

  function drawAlignment(matrix, centerX, centerY) {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        setFunction(matrix, centerX + dx, centerY + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  function reserveFormatAreas(matrix) {
    for (let index = 0; index <= 5; index += 1) {
      setFunction(matrix, 8, index, false);
    }
    setFunction(matrix, 8, 7, false);
    setFunction(matrix, 8, 8, false);
    setFunction(matrix, 7, 8, false);
    for (let index = 9; index < 15; index += 1) {
      setFunction(matrix, 14 - index, 8, false);
    }
    for (let index = 0; index < 8; index += 1) {
      setFunction(matrix, SIZE - 1 - index, 8, false);
    }
    for (let index = 8; index < 15; index += 1) {
      setFunction(matrix, 8, SIZE - 15 + index, false);
    }
    setFunction(matrix, 8, SIZE - 8, true);
  }

  function drawFunctionPatterns(matrix) {
    drawFinder(matrix, 3, 3);
    drawFinder(matrix, SIZE - 4, 3);
    drawFinder(matrix, 3, SIZE - 4);

    for (let index = 8; index < SIZE - 8; index += 1) {
      setFunction(matrix, 6, index, index % 2 === 0);
      setFunction(matrix, index, 6, index % 2 === 0);
    }

    drawAlignment(matrix, 34, 34);
    reserveFormatAreas(matrix);
  }

  function maskBit(x, y) {
    return (x + y) % 2 === 0;
  }

  function drawCodewords(matrix, codewords) {
    const bits = [];
    codewords.forEach((byte) => appendBits(bits, byte, 8));
    let bitIndex = 0;
    let upward = true;

    for (let right = SIZE - 1; right >= 1; right -= 2) {
      if (right === 6) {
        right -= 1;
      }
      for (let vertical = 0; vertical < SIZE; vertical += 1) {
        const y = upward ? SIZE - 1 - vertical : vertical;
        for (let offset = 0; offset < 2; offset += 1) {
          const x = right - offset;
          if (matrix.reserved[y][x]) {
            continue;
          }
          const rawBit = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
          matrix.modules[y][x] = rawBit !== maskBit(x, y);
          bitIndex += 1;
        }
      }
      upward = !upward;
    }
  }

  function formatBit(bits, index) {
    return ((bits >>> index) & 1) !== 0;
  }

  function drawFormatBits(matrix) {
    const data = (FORMAT_ECL_L << 3) | MASK;
    let remainder = data;
    for (let index = 0; index < 10; index += 1) {
      remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) * 0x537);
    }
    const bits = ((data << 10) | remainder) ^ 0x5412;

    for (let index = 0; index <= 5; index += 1) {
      setFunction(matrix, 8, index, formatBit(bits, index));
    }
    setFunction(matrix, 8, 7, formatBit(bits, 6));
    setFunction(matrix, 8, 8, formatBit(bits, 7));
    setFunction(matrix, 7, 8, formatBit(bits, 8));
    for (let index = 9; index < 15; index += 1) {
      setFunction(matrix, 14 - index, 8, formatBit(bits, index));
    }
    for (let index = 0; index < 8; index += 1) {
      setFunction(matrix, SIZE - 1 - index, 8, formatBit(bits, index));
    }
    for (let index = 8; index < 15; index += 1) {
      setFunction(matrix, 8, SIZE - 15 + index, formatBit(bits, index));
    }
    setFunction(matrix, 8, SIZE - 8, true);
  }

  function createMatrix(text) {
    const matrix = createBlankMatrix();
    drawFunctionPatterns(matrix);
    drawCodewords(matrix, createCodewords(text));
    drawFormatBits(matrix);
    return matrix.modules;
  }

  function toSvg(text, options) {
    const settings = Object.assign({
      dark: "#2c1b2b",
      light: "#f7efe3",
      quietZone: 4
    }, options || {});
    const matrix = createMatrix(text);
    const totalSize = SIZE + settings.quietZone * 2;
    const paths = [];

    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        if (matrix[y][x]) {
          paths.push(`M${x + settings.quietZone},${y + settings.quietZone}h1v1h-1z`);
        }
      }
    }

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" role="img" aria-label="QR code">`,
      `<rect width="${totalSize}" height="${totalSize}" fill="${settings.light}"/>`,
      `<path d="${paths.join("")}" fill="${settings.dark}"/>`,
      "</svg>"
    ].join("");
  }

  function render(element, text, options) {
    if (!element) {
      return;
    }
    element.innerHTML = toSvg(text, options);
  }

  function download(text, filename) {
    const blob = new Blob([toSvg(text)], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename || "ajeesh-sona-wedding-qr.svg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  window.WeddingQr = Object.freeze({
    createMatrix,
    download,
    render,
    size: SIZE,
    toSvg
  });
})();
