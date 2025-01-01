let editingNoteId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  setupEventListeners();
});

function setupEventListeners() {
  // Toggle AI Panel
  document.getElementById('toggleAI').addEventListener('click', () => {
    document.getElementById('aiPanel').classList.toggle('active');
  });

  // Add Note
  document.getElementById('addNote').addEventListener('click', () => {
    editingNoteId = null;
    document.getElementById('noteForm').classList.add('active');
  });

  // Save Note
  document.getElementById('saveNote').addEventListener('click', saveNote);

  // Cancel Note
  document.getElementById('cancelNote').addEventListener('click', () => {
    document.getElementById('noteForm').classList.remove('active');
    clearNoteForm();
  });

  // Send Message
  document.getElementById('sendMessage').addEventListener('click', sendMessage);
  document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

function saveNote() {
  const title = document.getElementById('noteTitle').value;
  const type = document.getElementById('noteType').value;
  const content = document.getElementById('noteContent').value;

  if (!title || !content) {
    alert('Please fill in all fields');
    return;
  }

  const note = {
    id: editingNoteId || Date.now(),
    title,
    type,
    content,
    date: new Date().toISOString()
  };

  chrome.storage.local.get(['notes'], (result) => {
    let notes = result.notes || [];
    
    if (editingNoteId) {
      notes = notes.map(n => n.id === editingNoteId ? note : n);
    } else {
      notes.unshift(note);
    }

    chrome.storage.local.set({ notes }, () => {
      loadNotes();
      clearNoteForm();
      document.getElementById('noteForm').classList.remove('active');
    });
  });
}

function loadNotes() {
  chrome.storage.local.get(['notes'], (result) => {
    const notes = result.notes || [];
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    
    notes.forEach(note => {
      const noteCard = createNoteCard(note);
      notesList.appendChild(noteCard);
    });
  });
}

function createNoteCard(note) {
  const div = document.createElement('div');
  div.className = 'note-card';
  
  div.innerHTML = `
    <div class="note-header">
      <div>
        <span class="note-title">${note.title}</span>
        <small>(${note.type})</small>
      </div>
      <div class="note-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    </div>
    <div class="note-content">${note.content}</div>
    <small>${new Date(note.date).toLocaleString()}</small>
  `;

  // Edit Note
  div.querySelector('.edit-btn').addEventListener('click', () => {
    editingNoteId = note.id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteType').value = note.type;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteForm').classList.add('active');
  });

  // Delete Note
  div.querySelector('.delete-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
    }
  });

  return div;
}

function deleteNote(noteId) {
  chrome.storage.local.get(['notes'], (result) => {
    const notes = result.notes.filter(note => note.id !== noteId);
    chrome.storage.local.set({ notes }, loadNotes);
  });
}

function clearNoteForm() {
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteType').value = 'meeting';
  document.getElementById('noteContent').value = '';
  editingNoteId = null;
}

// Simple AI chat functionality
function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (message) {
    addMessage('user-message', message);
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
      const response = getAIResponse(message);
      addMessage('ai-message', response);
    }, 1000);
  }
}

function addMessage(className, content) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `message ${className}`;
  div.textContent = content;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function getAIResponse(message) {
  // Simple response logic - can be enhanced with actual AI integration
  const responses = [
    "I can help you organize your notes better. What specific help do you need?",
    "Would you like me to help you summarize your notes?",
    "I can suggest some ways to structure your notes more effectively.",
    "Let me know if you need help with formatting or organizing your thoughts."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}