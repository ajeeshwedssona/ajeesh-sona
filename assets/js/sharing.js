(function () {
  "use strict";

  function initSharing(config, utils) {
    const shareButton = document.getElementById("shareInvitation");
    const whatsappLink = document.getElementById("whatsappShare");
    const copyLinkButton = document.getElementById("copyLink");
    const downloadButton = document.getElementById("downloadSaveDate");
    const qrContainer = document.getElementById("qrCode");
    const qrUrlText = document.getElementById("qrUrlText");
    const downloadQrButton = document.getElementById("downloadQr");
    const copyQrButton = document.getElementById("copyQrUrl");

    const guestDialog = document.getElementById("guestDialog");
    const openGuestDialogButton = document.getElementById("openGuestGenerator");
    const closeGuestDialogButton = document.getElementById("closeGuestDialog");
    const guestNameInput = document.getElementById("guestName");
    const guestDialogStatus = document.getElementById("guestDialogStatus");
    const generateGuestLinkButton = document.getElementById("generateGuestLink");
    const generatedLinkGroup = document.getElementById("generatedLinkGroup");
    const guestLinkInput = document.getElementById("guestLink");
    const copyGuestLinkButton = document.getElementById("copyGuestLink");
    const guestWhatsappLink = document.getElementById("guestWhatsapp");

    const qrUrl = utils.getQrUrl();

    try {
      window.WeddingQr.render(qrContainer, qrUrl);
      if (qrUrlText) {
        qrUrlText.textContent = qrUrl;
      }
    } catch (error) {
      if (qrContainer) {
        qrContainer.textContent = "QR unavailable";
      }
      if (qrUrlText) {
        qrUrlText.textContent = qrUrl;
      }
    }

    function invitationMessage(url, guestName) {
      const greeting = guestName ? `Dear ${guestName}, ` : "";
      return `${greeting}${config.share.message} ${url}`;
    }

    function whatsappUrl(url, guestName) {
      return `https://wa.me/?text=${encodeURIComponent(invitationMessage(url, guestName))}`;
    }

    function refreshWhatsAppLink() {
      const url = utils.getShareUrl();
      if (whatsappLink) {
        whatsappLink.href = whatsappUrl(url, utils.getGuestName());
      }
    }

    refreshWhatsAppLink();

    if (shareButton) {
      shareButton.addEventListener("click", async function () {
        const url = utils.getShareUrl();
        const shareData = {
          title: `${config.couple.displayNames} — Wedding Invitation`,
          text: config.share.message,
          url
        };

        if (typeof navigator.share === "function") {
          try {
            await navigator.share(shareData);
            return;
          } catch (error) {
            if (error && error.name === "AbortError") {
              return;
            }
          }
        }

        const fallbackUrl = whatsappUrl(url, utils.getGuestName());
        if (typeof navigator.share === "function") {
          window.location.assign(fallbackUrl);
        } else {
          window.open(fallbackUrl, "_blank", "noopener,noreferrer");
        }
      });
    }

    if (copyLinkButton) {
      copyLinkButton.addEventListener("click", async function () {
        const copied = await utils.copyText(utils.getShareUrl());
        utils.showToast(copied ? "Invitation link copied." : "Select and copy the address from your browser.");
      });
    }

    if (downloadButton) {
      downloadButton.addEventListener("click", async function () {
        const originalLabel = downloadButton.textContent;
        downloadButton.disabled = true;
        downloadButton.textContent = "Preparing…";
        try {
          await createSaveDateCard(config, utils.getQrUrl());
          utils.showToast("Save-the-date downloaded.");
        } catch (error) {
          utils.showToast("The card could not be created on this browser.");
        } finally {
          downloadButton.disabled = false;
          downloadButton.textContent = originalLabel;
        }
      });
    }

    if (downloadQrButton) {
      downloadQrButton.addEventListener("click", function () {
        try {
          window.WeddingQr.download(qrUrl, "ajeesh-sona-wedding-qr.svg");
          utils.showToast("QR code downloaded.");
        } catch (error) {
          utils.showToast("The QR code could not be downloaded.");
        }
      });
    }

    if (copyQrButton) {
      copyQrButton.addEventListener("click", async function () {
        const copied = await utils.copyText(qrUrl);
        utils.showToast(copied ? "Website address copied." : "Select and copy the address shown above.");
      });
    }

    function openGuestDialog() {
      if (!guestDialog) {
        return;
      }
      if (typeof guestDialog.showModal === "function") {
        guestDialog.showModal();
      } else {
        guestDialog.setAttribute("open", "");
      }
      if (guestDialogStatus) {
        guestDialogStatus.textContent = "";
      }
      window.setTimeout(() => guestNameInput && guestNameInput.focus(), 50);
    }

    function closeGuestDialog() {
      if (!guestDialog) {
        return;
      }
      if (typeof guestDialog.close === "function") {
        guestDialog.close();
      } else {
        guestDialog.removeAttribute("open");
      }
      if (openGuestDialogButton) {
        openGuestDialogButton.focus();
      }
    }

    if (openGuestDialogButton) {
      openGuestDialogButton.addEventListener("click", openGuestDialog);
    }

    if (closeGuestDialogButton) {
      closeGuestDialogButton.addEventListener("click", closeGuestDialog);
    }

    if (guestDialog) {
      guestDialog.addEventListener("click", function (event) {
        const bounds = guestDialog.getBoundingClientRect();
        const outside = (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        );
        if (outside) {
          closeGuestDialog();
        }
      });
    }

    if (generateGuestLinkButton) {
      generateGuestLinkButton.addEventListener("click", function () {
        const guestName = utils.sanitizeGuestName(guestNameInput ? guestNameInput.value : "");
        if (!guestName) {
          if (guestDialogStatus) {
            guestDialogStatus.textContent = "Enter a guest name first.";
          }
          if (guestNameInput) {
            guestNameInput.focus();
          }
          return;
        }

        const guestUrl = new URL(utils.getBaseInvitationUrl());
        guestUrl.search = "";
        guestUrl.hash = "";
        guestUrl.searchParams.set("guest", guestName);
        const finalUrl = guestUrl.toString();

        if (guestLinkInput) {
          guestLinkInput.value = finalUrl;
        }
        if (guestWhatsappLink) {
          guestWhatsappLink.href = whatsappUrl(finalUrl, guestName);
        }
        if (generatedLinkGroup) {
          generatedLinkGroup.hidden = false;
        }
        if (guestDialogStatus) {
          guestDialogStatus.textContent = "Personalised link ready.";
        }
      });
    }

    if (guestNameInput) {
      guestNameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          generateGuestLinkButton.click();
        }
      });
    }

    if (copyGuestLinkButton) {
      copyGuestLinkButton.addEventListener("click", async function () {
        const value = guestLinkInput ? guestLinkInput.value : "";
        const copied = value && await utils.copyText(value);
        if (guestDialogStatus) {
          guestDialogStatus.textContent = copied ? "Personalised link copied." : "Generate a guest link first.";
        }
      });
    }
  }

  function drawLine(ctx, x1, y1, x2, y2, color, width) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function drawQrToCanvas(ctx, text, x, y, moduleSize) {
    const matrix = window.WeddingQr.createMatrix(text);
    const quiet = 4;
    const total = matrix.length + quiet * 2;
    ctx.fillStyle = "#f7efe3";
    ctx.fillRect(x, y, total * moduleSize, total * moduleSize);
    ctx.fillStyle = "#2c1b2b";
    for (let row = 0; row < matrix.length; row += 1) {
      for (let column = 0; column < matrix.length; column += 1) {
        if (matrix[row][column]) {
          ctx.fillRect(
            x + (column + quiet) * moduleSize,
            y + (row + quiet) * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }

  function fitText(ctx, text, maxWidth, initialSize, fontFamily, minimumSize) {
    let size = initialSize;
    do {
      ctx.font = `${size}px ${fontFamily}`;
      if (ctx.measureText(text).width <= maxWidth) {
        return size;
      }
      size -= 2;
    } while (size >= minimumSize);
    return minimumSize;
  }

  function downloadCanvas(canvas, filename) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(function (blob) {
        if (!blob) {
          reject(new Error("Canvas export failed."));
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        resolve();
      }, "image/png", 1);
    });
  }

  async function createSaveDateCard(config, qrUrl) {
    if (document.fonts && document.fonts.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => window.setTimeout(resolve, 2500))
      ]);
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d", { alpha: false });

    const background = ctx.createLinearGradient(0, 0, 1080, 1350);
    background.addColorStop(0, "#f3eadb");
    background.addColorStop(0.58, "#e9ddca");
    background.addColorStop(1, "#dfccb3");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#bc8d4d";
    ctx.lineWidth = 5;
    ctx.strokeRect(32, 32, 1016, 1286);
    ctx.strokeStyle = "rgba(59,33,56,.24)";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 980, 1250);

    ctx.beginPath();
    ctx.arc(540, 330, 220, Math.PI, 0);
    ctx.lineTo(760, 600);
    ctx.strokeStyle = "rgba(188,141,77,.62)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(540, 330, 200, Math.PI, 0);
    ctx.lineTo(740, 585);
    ctx.strokeStyle = "rgba(188,141,77,.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#8d4038";
    ctx.font = "600 22px 'DM Sans', Arial, sans-serif";
    ctx.fillText("SAVE THE DATE", 540, 118);

    ctx.fillStyle = "#bc8d4d";
    ctx.font = "82px Italiana, Georgia, serif";
    ctx.fillText(`${config.couple.shortOne.charAt(0)} · ${config.couple.shortTwo.charAt(0)}`, 540, 235);

    ctx.fillStyle = "#3b2138";
    fitText(ctx, config.couple.displayNames, 860, 116, "Italiana, Georgia, serif", 78);
    ctx.fillText(config.couple.displayNames, 540, 390);

    ctx.fillStyle = "#6b5d65";
    ctx.font = "36px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(config.wedding.dateLabel, 540, 458);
    ctx.font = "italic 29px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(config.wedding.malayalamDate, 540, 505);

    drawLine(ctx, 150, 555, 930, 555, "rgba(59,33,56,.22)", 2);
    ctx.fillStyle = "#bc8d4d";
    ctx.save();
    ctx.translate(540, 555);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();

    ctx.textAlign = "left";
    ctx.fillStyle = "#8d4038";
    ctx.font = "600 19px 'DM Sans', Arial, sans-serif";
    ctx.fillText("WEDDING CEREMONY", 105, 635);
    ctx.fillStyle = "#3b2138";
    ctx.font = "54px Italiana, Georgia, serif";
    ctx.fillText(`${config.wedding.startTime} ${config.wedding.startMeridiem} — ${config.wedding.endTime}`, 105, 700);
    ctx.font = "34px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(config.wedding.venue, 105, 755);
    ctx.fillStyle = "#6b5d65";
    ctx.font = "28px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(config.wedding.address, 105, 796);

    drawLine(ctx, 105, 850, 975, 850, "rgba(59,33,56,.18)", 2);

    ctx.fillStyle = "#355f5a";
    ctx.font = "600 19px 'DM Sans', Arial, sans-serif";
    ctx.fillText("WEDDING RECEPTION", 105, 925);
    ctx.fillStyle = "#3b2138";
    ctx.font = "54px Italiana, Georgia, serif";
    ctx.fillText(`${config.reception.startTime} — ${config.reception.endTime}`, 105, 990);
    ctx.font = "34px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(config.reception.venue, 105, 1045);
    ctx.fillStyle = "#6b5d65";
    ctx.font = "28px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(config.reception.address, 105, 1086);

    drawQrToCanvas(ctx, qrUrl, 730, 1050, 5);

    ctx.fillStyle = "#3b2138";
    ctx.font = "600 18px 'DM Sans', Arial, sans-serif";
    ctx.fillText("SCAN FOR THE INVITATION", 105, 1192);
    ctx.fillStyle = "#6b5d65";
    ctx.font = "19px 'DM Sans', Arial, sans-serif";
    const displayUrl = qrUrl.length > 60 ? `${qrUrl.slice(0, 57)}…` : qrUrl;
    ctx.fillText(displayUrl, 105, 1230);

    ctx.textAlign = "center";
    ctx.fillStyle = "#8d4038";
    ctx.font = "italic 29px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("We would be delighted to celebrate with you.", 540, 1280);

    await downloadCanvas(canvas, "ajeesh-sona-save-the-date.png");
  }

  window.WeddingSharing = Object.freeze({
    createSaveDateCard,
    init: initSharing
  });
})();
