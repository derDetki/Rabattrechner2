(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function formatPct(v) {
    return `${(Number(v || 0) * 100).toFixed(2).replace(".", ",")} %`;
  }

  function formatMoney(v) {
    const n = Number(v || 0);
    return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  }

  function formatQty(v) {
    return Number(v || 0).toFixed(2).replace(".", ",");
  }

  function num(id) {
    const el = $(id);
    if (!el) return NaN;
    const v = parseFloat(el.value);
    return Number.isFinite(v) ? v : NaN;
  }

  function int(id) {
    const el = $(id);
    if (!el) return NaN;
    const v = parseInt(el.value, 10);
    return Number.isFinite(v) ? v : NaN;
  }

  function render() {
    // UC3: two prices
    const priceList = num("priceList");
    const priceBuy = num("priceBuy");
    const priceUseCaseQty = int("priceUseCaseQty");
    const priceCaseValid =
      priceList > 0 &&
      priceBuy >= 0 &&
      priceBuy <= priceList &&
      priceUseCaseQty > 0;

    const uc3Out = $("uc3-out");
    const uc3Hint = $("uc3-hint");
    if (priceCaseValid) {
      const priceDiffAbs = Math.max(0, priceList - priceBuy);
      const priceDiffPct = priceDiffAbs / priceList;
      const priceBarDiscount = priceDiffPct;
      let priceEquivalentFree = 0;
      if (priceBarDiscount > 0 && priceBarDiscount < 1) {
        priceEquivalentFree = (priceUseCaseQty * priceBarDiscount) / (1 - priceBarDiscount);
      }
      uc3Out.innerHTML = `
        <p><strong>Differenz:</strong> ${formatMoney(priceDiffAbs)} (${formatPct(priceDiffPct)})</p>
        <p><strong>Barrabatt:</strong> ${formatPct(priceBarDiscount)}</p>
        <p><strong>Naturalrabatt (gleichwertig):</strong> ca. <strong>${priceUseCaseQty} + ${formatQty(priceEquivalentFree)}</strong></p>
        <p class="small">Formel: freie Menge = bezahlte Menge × Rabatt / (1 − Rabatt)</p>
      `;
      uc3Out.classList.remove("hidden");
      uc3Hint.classList.add("hidden");
    } else {
      uc3Out.classList.add("hidden");
      uc3Hint.classList.remove("hidden");
    }

    // UC1: bar → natural
    const barPercentInput = num("barPercentInput");
    const barQtyInput = int("barQtyInput");
    const barToNaturalValid = barPercentInput >= 0 && barPercentInput < 100 && barQtyInput > 0;
    const uc1Out = $("uc1-out");
    const uc1Hint = $("uc1-hint");
    if (barToNaturalValid) {
      const d = barPercentInput / 100;
      let barEquivalentFreeQty = 0;
      if (d > 0 && d < 1) {
        barEquivalentFreeQty = (barQtyInput * d) / (1 - d);
      }
      uc1Out.innerHTML = `
        <p><strong>Entspricht Naturalrabatt:</strong> ca. <strong>${barQtyInput} + ${formatQty(barEquivalentFreeQty)}</strong></p>
        <p class="small">Bei Rundung auf volle Packungen empfehlenswert: ${barQtyInput} + ${Math.round(barEquivalentFreeQty)}</p>
      `;
      uc1Out.classList.remove("hidden");
      uc1Hint.classList.add("hidden");
    } else {
      uc1Out.classList.add("hidden");
      uc1Hint.classList.remove("hidden");
    }

    // UC2: natural → bar
    const natPaidQty = int("natPaidQty");
    const natFreeQty = int("natFreeQty");
    const naturalToBarValid = natPaidQty > 0 && natFreeQty >= 0;
    const uc2Out = $("uc2-out");
    const uc2Hint = $("uc2-hint");
    if (naturalToBarValid) {
      const naturalEquivalentBarPct = natFreeQty / (natPaidQty + natFreeQty);
      uc2Out.innerHTML = `
        <p><strong>Barrabatt-Äquivalent:</strong> ${formatPct(naturalEquivalentBarPct)}</p>
        <p><strong>Effektiver Faktor:</strong> Sie bezahlen ${natPaidQty} und erhalten ${natPaidQty + natFreeQty}.</p>
      `;
      uc2Out.classList.remove("hidden");
      uc2Hint.classList.add("hidden");
    } else {
      uc2Out.classList.add("hidden");
      uc2Hint.classList.remove("hidden");
    }

    // UC4: target discount
    const targetListPrice = num("targetListPrice");
    const targetBarPctInput = num("targetBarPctInput");
    const targetQty = int("targetQty");
    const targetPlanValid =
      targetListPrice > 0 &&
      targetBarPctInput >= 0 &&
      targetBarPctInput < 100 &&
      targetQty > 0;

    const uc4Out = $("uc4-out");
    const uc4Hint = $("uc4-hint");
    if (targetPlanValid) {
      const d = targetBarPctInput / 100;
      const targetMaxBuyPrice = targetListPrice * (1 - d);
      let targetEquivalentFreeQty = 0;
      if (d > 0 && d < 1) {
        targetEquivalentFreeQty = (targetQty * d) / (1 - d);
      }
      uc4Out.innerHTML = `
        <p><strong>Max. Einkaufspreis pro Packung:</strong> ${formatMoney(targetMaxBuyPrice)}</p>
        <p><strong>Naturalrabatt-Äquivalent:</strong> ca. <strong>${targetQty} + ${formatQty(targetEquivalentFreeQty)}</strong></p>
        <p class="small">Hilfreich für Verhandlungsziele und schnelle Preisprüfung.</p>
      `;
      uc4Out.classList.remove("hidden");
      uc4Hint.classList.add("hidden");
    } else {
      uc4Out.classList.add("hidden");
      uc4Hint.classList.remove("hidden");
    }
  }

  const inputs = document.querySelectorAll(
    "input[type=number]"
  );
  inputs.forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  render();
})();
