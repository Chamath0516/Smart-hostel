const PIN_LIFETIME_MS = 60 * 1000;

let currentPin = "";
let expiresAt = 0;

const generatePin = () => String(Math.floor(Math.random() * 10000)).padStart(4, "0");

const ensureCurrentPin = () => {
  const now = Date.now();

  if (!currentPin || now >= expiresAt) {
    currentPin = generatePin();
    expiresAt = now + PIN_LIFETIME_MS;
  }

  return { pin: currentPin, expiresAt };
};

export const getCurrentPin = () => ensureCurrentPin().pin;

export const verifyPin = (pin) => {
  const normalizedPin = String(pin || "").trim();
  return normalizedPin === getCurrentPin();
};

export const getPinMeta = () => {
  const { pin, expiresAt: activeExpiresAt } = ensureCurrentPin();

  return {
    pin,
    expiresAt: new Date(activeExpiresAt).toISOString(),
    remainingSeconds: Math.max(0, Math.ceil((activeExpiresAt - Date.now()) / 1000))
  };
};
