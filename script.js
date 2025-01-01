document.addEventListener('DOMContentLoaded', () => {
    loadWebsiteStats();
    loadNotes();
    setupNoteFormListeners();
  });
  
  function loadWebsiteStats() {
    chrome.storage.local.get(['timeData'], (result) => {
      const timeData = result.timeData || {};
      const statsDiv = document.getElementById('timeStats');
      statsDiv.innerHTML = '';
      
      for (const hostname in timeData) {
        const siteData = timeData[hostname];
        const siteDiv = createSiteEntry(hostname, siteData);
        statsDiv.appendChild(siteDiv);
      }
    });
  }
  
  function createSiteEntry(hostname, siteData) {
    const siteDiv = document.createElement('div');
    siteDiv.className = 'site-entry';
    
    const today = new Date().toISOString().split('T')[0];
    const weekNumber = getWeekNumber(new Date());
    const monthYear = new Date().toISOString().slice(0, 7);
    
    siteDiv.innerHTML = `
      <div class="site-name">${hostname}</div>
      <div class="time-stats">
        <div class="stat-box">
          <div class="stat-label">Today</div>
          <div class="stat-value">${formatTime(siteData.daily[today] || 0)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">This Week</div>
          <div class="stat-value">${formatTime(siteData.weekly[weekNumber] || 0)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">This Month</div>
          <div class="stat-value">${formatTime(siteData.monthly[monthYear] || 0)}</div>
        </div>
      </div>
      <div class="controls">
        <label class="login-toggle">
          <span>Login Status:</span>
          <label class="toggle-switch">
            <input type="checkbox" ${siteData.loginStatus ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </label>
      </div>
    `;
    
    siteDiv.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
      siteData.loginStatus = e.target.checked;
      chrome.storage.local.set({ timeData: { ...timeData, [hostname]: siteData } });
    });
    
    return siteDiv;
  }
  
  function setupNoteFormListeners() {
    const addNoteBtn = document.getElementById('addNote');
    const noteForm = document.getElementById('noteForm');
    const saveNoteBtn = document.getElementById('saveNote');
    const cancelNoteBtn = document.getElementById('cancelNote');
    
    addNoteBtn.addEventListener('click', () => {
      noteForm.classList.add('active');
    });
    
    cancelNoteBtn.addEventListener('click', () => {
      noteForm.classList.remove('active');
      clearNoteForm();
    });
    
    saveNoteBtn.addEventListener('click', saveNote);
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
      id: Date.now(),
      title,
      type,
      content,
      date: new Date().toISOString(),
      website: activeUrl || 'General'
    };
    
    chrome.storage.local.get(['notes'], (result) => {
      const notes = result.notes || [];
      notes.unshift(note);
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
      const notesSection = document.getElementById('notesSection');
      notesSection.innerHTML = '';
      
      notes.forEach(note => {
        const noteDiv = createNoteEntry(note);
        notesSection.appendChild(noteDiv);
      });
    });
  }
  
  function createNoteEntry(note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note-entry';
    
    noteDiv.innerHTML = `
      <div class="note-header">
        <span class="note-title">${note.title} (${note.type})</span>
        <span class="note-date">${new Date(note.date).toLocaleString()}</span>
      </div>
      <div class="note-content">${note.content}</div>
    `;
    
    return noteDiv;
  }
  
  function clearNoteForm() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteType').value = 'meeting';
    document.getElementById('noteContent').value = '';
  }
  
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((date - firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNumber}`;
  }