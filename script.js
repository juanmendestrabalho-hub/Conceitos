(() => {
  "use strict";

  const STORAGE_KEY = "devNotesData";

  const state = {
    notes: [],
    activeNoteId: null
  };

  const el = {
    list: document.getElementById("notesList"),
    editor: document.getElementById("editor"),
    preview: document.getElementById("preview"),
    newBtn: document.getElementById("newNoteBtn"),
    search: document.getElementById("searchInput"),
    theme: document.getElementById("themeToggle")
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const load = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) Object.assign(state, JSON.parse(data));
  };

  const createNote = () => {
    const note = {
      id: Date.now(),
      content: "# Nova Nota\n\nComece a escrever..."
    };

    state.notes.push(note);
    state.activeNoteId = note.id;

    save();
    render();
  };

  const setActive = (id) => {
    state.activeNoteId = id;
    render();
  };

  const updateNote = (content) => {
    const note = state.notes.find(n => n.id === state.activeNoteId);
    if (!note) return;

    note.content = content;
    save();
    renderPreview();
  };

  const deleteNote = (id) => {
    state.notes = state.notes.filter(n => n.id !== id);
    if (state.activeNoteId === id) {
      state.activeNoteId = state.notes[0]?.id || null;
    }
    save();
    render();
  };

  const parseMarkdown = (text) => {
    return text
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
      .replace(/\*(.*?)\*/gim, "<i>$1</i>")
      .replace(/\n$/gim, "<br>");
  };

  const renderList = (filter = "") => {
    el.list.innerHTML = "";

    state.notes
      .filter(n => n.content.toLowerCase().includes(filter.toLowerCase()))
      .forEach(note => {
        const li = document.createElement("li");

        li.textContent = note.content.split("\n")[0];

        if (note.id === state.activeNoteId) {
          li.classList.add("active");
        }

        li.addEventListener("click", () => setActive(note.id));

        li.addEventListener("dblclick", () => deleteNote(note.id));

        el.list.appendChild(li);
      });
  };

  const renderEditor = () => {
    const note = state.notes.find(n => n.id === state.activeNoteId);
    el.editor.value = note ? note.content : "";
  };

  const renderPreview = () => {
    el.preview.innerHTML = parseMarkdown(el.editor.value);
  };

  const render = () => {
    renderList(el.search.value);
    renderEditor();
    renderPreview();
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  const loadTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
  };

  const initEvents = () => {
    el.newBtn.addEventListener("click", createNote);

    el.editor.addEventListener("input", (e) => {
      updateNote(e.target.value);
    });

    el.search.addEventListener("input", (e) => {
      renderList(e.target.value);
    });

    el.theme.addEventListener("click", toggleTheme);
  };

  const init = () => {
    load();
    loadTheme();

    if (!state.notes.length) createNote();

    initEvents();
    render();
  };

  init();

})();
