import React, { useEffect, useState } from "react";

const STORAGE_KEY = "pw_to_msg_pairs_v2";

export default function App() {
  const [pairs, setPairs] = useState([]);
  const [passwordInput, setPasswordInput] = useState("");
  const [revealMessage, setRevealMessage] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [filter, setFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPairs(JSON.parse(raw));
    } catch (e) {
      console.error("load failed", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
    } catch (e) {
      console.error("save failed", e);
    }
  }, [pairs]);

  function handleSubmitNew(e) {
    e.preventDefault();
    if (!newPw) return alert("Parola boş olamaz.");
    const item = { pw: newPw, msg: newMsg, category: newCategory };
    if (editingIndex >= 0) {
      const copy = [...pairs];
      copy[editingIndex] = item;
      setPairs(copy);
      setEditingIndex(-1);
    } else {
      setPairs([...pairs, item]);
    }
    setNewPw("");
    setNewMsg("");
    setNewCategory("");
  }

  function handleTryReveal(e) {
    e.preventDefault();
    const found = pairs.find(p => p.pw === passwordInput);
    if (found) {
      setRevealMessage(found.msg || "(mesaj boş)");
    } else {
      setRevealMessage("Eşleşen mesaj bulunamadı.");
    }
  }

  function handleEdit(i) {
    setEditingIndex(i);
    setNewPw(pairs[i].pw);
    setNewMsg(pairs[i].msg);
    setNewCategory(pairs[i].category || "");
  }

  function handleDelete(i) {
    if (!confirm("Silmek istediğine emin misin?")) return;
    const copy = [...pairs];
    copy.splice(i, 1);
    setPairs(copy);
  }

  function exportJSON() {
    const data = JSON.stringify(pairs, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pw_to_msg_export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)) setPairs(parsed);
        else alert("Beklenen format: [{pw, msg, category}, ...]");
      } catch (err) {
        alert("JSON ayrıştırılamadı: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  const visiblePairs = pairs.filter((p) => {
    if (!filter) return true;
    return (
      p.pw.includes(filter) ||
      (p.msg || "").includes(filter) ||
      (p.category || "").includes(filter)
    );
  });

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-b from-purple-50 via-pink-50 to-yellow-50 text-gray-900"} min-h-screen p-6`}>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-3xl p-8 transition-colors">
        <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-6 text-center">
          🔐 Şifre → Mesaj Yönetici
        </h1>

        {/* Tema Seçici */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {darkMode ? "Açık Mod" : "Karanlık Mod"}
          </button>
        </div>

        {/* Parola gir ve mesaj göster */}
        <section className="mb-8">
          <form onSubmit={handleTryReveal} className="flex flex-col sm:flex-row gap-3">
            <input
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="Parolanı gir ve Göster'e bas"
              className="flex-1 px-4 py-3 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            />
            <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
              Göster
            </button>
          </form>
          {revealMessage !== null && (
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-xl shadow-inner text-gray-700 font-medium">
              {revealMessage}
            </div>
          )}
        </section>

        {/* Yeni parola / mesaj ekle */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Yeni eşleme ekle / düzenle</h2>
          <form onSubmit={handleSubmitNew} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type={showPassword ? "text" : "password"}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="Parola"
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:outline-none transition"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-2 py-1 bg-gray-300 rounded">
              {showPassword ? "Gizle" : "Göster"}
            </button>
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Mesaj"
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:outline-none transition"
            />
            <input
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Kategori"
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:outline-none transition"
            />
            <button className="px-4 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition col-span-full sm:col-span-1">
              Kaydet
            </button>
            {editingIndex >= 0 && (
              <button
                type="button"
                onClick={() => { setEditingIndex(-1); setNewPw(""); setNewMsg(""); setNewCategory(""); }}
                className="px-4 py-3 rounded-xl bg-gray-300 hover:bg-gray-400 transition col-span-full sm:col-span-1"
              >
                İptal
              </button>
            )}
          </form>
        </section>

        {/* Kayıtlı eşlemeler */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Kayıtlı eşlemeler ({pairs.length})</h2>
          <input
            placeholder="Ara veya kategori filtrele..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 mb-4 border rounded w-full"
          />
          <div className="space-y-4">
            {visiblePairs.length === 0 && <div className="text-gray-500 italic dark:text-gray-400">Kayıt yok.</div>}
            {visiblePairs.map((p, i) => (
              <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gradient-to-r from-white via-indigo-50 to-white rounded-2xl shadow-md transition hover:shadow-xl dark:bg-gray-700">
                <div className="flex-1">
                  <div className="font-medium text-gray-800 dark:text-gray-200">Parola: <code className="bg-indigo-100 px-2 py-1 rounded">{p.pw}</code></div>
                  <div className="text-gray-500 dark:text-gray-300 mt-1 truncate">Mesaj: {p.msg || <em>boş</em>}</div>
                  {p.category && <div className="text-sm text-gray-400 dark:text-gray-400 mt-1">Kategori: {p.category}</div>}
                </div>
                <div className="flex gap-2 mt-3 sm:mt-0">
                  <button onClick={() => handleEdit(pairs.indexOf(p))} className="px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 transition">Düzenle</button>
                  <button onClick={() => handleDelete(pairs.indexOf(p))} className="px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition">Sil</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
