// =========================================================
// ILUMÍNATE · Interacciones de la página
// =========================================================

// Número de WhatsApp y email de la empresa (cámbialos aquí si cambian)
const WHATSAPP = "584241782227";
const EMAIL = "iluminateve@gmail.com";

// ---------- 1. Escena de temperatura de color ----------
// Colores aproximados de la luz según los grados Kelvin.
const KELVIN_COLORS = [
  [2700, [255, 169, 87]],
  [3000, [255, 180, 107]],
  [4000, [255, 209, 163]],
  [5000, [255, 228, 206]],
  [6500, [255, 249, 253]],
];

function kelvinToColor(k) {
  for (let i = 0; i < KELVIN_COLORS.length - 1; i++) {
    const [k1, c1] = KELVIN_COLORS[i];
    const [k2, c2] = KELVIN_COLORS[i + 1];
    if (k <= k2) {
      const t = (k - k1) / (k2 - k1);
      const rgb = c1.map((v, j) => Math.round(v + (c2[j] - v) * t));
      return `rgb(${rgb.join(",")})`;
    }
  }
  return "rgb(255,249,253)";
}

function kelvinName(k) {
  if (k < 3500) return "Cálida";
  if (k < 5000) return "Neutra";
  return "Fría";
}

const slider = document.getElementById("kelvin");
const output = document.getElementById("kelvinOut");

function updateLight() {
  const k = Number(slider.value);
  document.documentElement.style.setProperty("--light", kelvinToColor(k));
  output.textContent = `${k} K · ${kelvinName(k)}`;
}

if (slider) {
  slider.addEventListener("input", updateLight);
  updateLight();
}

// ---------- 2. Formulario de contacto ----------
// "Enviar mensaje" lo recibe Netlify Forms y lo reenvía al correo de la empresa.
// "Enviar por WhatsApp" arma el mismo mensaje y abre el chat.
const form = document.getElementById("waForm");
const waSend = document.getElementById("waSend");
const formSend = document.getElementById("formSend");
const formStatus = document.getElementById("formStatus");

function buildMessage() {
  const nombre = form.nombre.value.trim();
  const espacio = form.espacio.value;
  const servicio = form.servicio.value;
  const mensaje = form.mensaje.value.trim();

  let texto = "Hola Ilumínate";
  if (nombre) texto += `, soy ${nombre}`;
  texto += `. Me interesa: ${servicio}, para un ${espacio.toLowerCase()}.`;
  if (mensaje) texto += ` ${mensaje}`;
  return texto;
}

function updateWhatsApp() {
  waSend.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage())}`;
}

function showStatus(text, ok) {
  formStatus.textContent = text;
  formStatus.className = "form-status " + (ok ? "is-ok" : "is-error");
  formStatus.hidden = false;
}

async function sendForm(e) {
  e.preventDefault();
  if (!form.nombre.value.trim() || !form.contacto.value.trim()) {
    showStatus("Escribe tu nombre y un email o teléfono para poder responderte.", false);
    (form.nombre.value.trim() ? form.contacto : form.nombre).focus();
    return;
  }
  formSend.disabled = true;
  formSend.textContent = "Enviando…";
  try {
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    updateWhatsApp();
    showStatus("¡Gracias! Recibimos tu mensaje y te responderemos pronto.", true);
  } catch {
    showStatus(`No se pudo enviar. Escríbenos por WhatsApp o a ${EMAIL}.`, false);
  } finally {
    formSend.disabled = false;
    formSend.textContent = "Enviar mensaje";
  }
}

if (form) {
  form.addEventListener("input", updateWhatsApp);
  form.addEventListener("submit", sendForm);
  updateWhatsApp();
}

// ---------- 3. Botón "Copiar" del email ----------
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copiado";
    } catch {
      // Si el navegador no permite copiar, seleccionamos el texto
      const link = btn.parentElement.querySelector("a");
      const range = document.createRange();
      range.selectNodeContents(link);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      btn.textContent = "Selecciona y copia";
    }
    setTimeout(() => (btn.textContent = "Copiar"), 2000);
  });
});

// ---------- 4. Año automático en el pie ----------
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// ---------- 5. Carrusel de productos ----------
const carousel = document.getElementById("carousel");
document.querySelectorAll(".carousel-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = carousel.querySelector(".product");
    const step = card ? card.offsetWidth + 20 : 300;
    carousel.scrollBy({ left: step * Number(btn.dataset.dir), behavior: "smooth" });
  });
});
