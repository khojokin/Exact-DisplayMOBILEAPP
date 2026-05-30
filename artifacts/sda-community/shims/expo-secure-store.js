// Web shim for expo-secure-store — uses localStorage so native calls don't crash
const getItemAsync = async (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const setItemAsync = async (key, value) => {
  try { localStorage.setItem(key, value); } catch {}
};
const deleteItemAsync = async (key) => {
  try { localStorage.removeItem(key); } catch {}
};
const getItem = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const setItem = (key, value) => {
  try { localStorage.setItem(key, value); } catch {}
};
const deleteItem = (key) => {
  try { localStorage.removeItem(key); } catch {}
};

module.exports = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  getItem,
  setItem,
  deleteItem,
};
