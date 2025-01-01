document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['timeData'], (result) => {
      const timeData = result.timeData || {};
      const statsDiv = document.getElementById('timeStats');
      
      for (const hostname in timeData) {
        const siteData = timeData[hostname];
        const siteDiv = document.createElement('div');
        siteDiv.className = 'site-entry';
        
        // Website name
        const nameH3 = document.createElement('h3');
        nameH3.textContent = hostname;
        siteDiv.appendChild(nameH3);
        
        // Time statistics
        const today = new Date().toISOString().split('T')[0];
        const weekNumber = getWeekNumber(new Date());
        const monthYear = new Date().toISOString().slice(0, 7);
        
        const timeStats = document.createElement('div');
        timeStats.innerHTML = `
          <p>Today: ${formatTime(siteData.daily[today] || 0)}</p>
          <p>This Week: ${formatTime(siteData.weekly[weekNumber] || 0)}</p>
          <p>This Month: ${formatTime(siteData.monthly[monthYear] || 0)}</p>
        `;
        siteDiv.appendChild(timeStats);
        
        // Login status toggle
        const loginDiv = document.createElement('div');
        loginDiv.className = 'login-toggle';
        loginDiv.innerHTML = `
          <label>
            <input type="checkbox" ${siteData.loginStatus ? 'checked' : ''}>
            Logged In
          </label>
        `;
        loginDiv.querySelector('input').addEventListener('change', (e) => {
          siteData.loginStatus = e.target.checked;
          chrome.storage.local.set({ timeData });
        });
        siteDiv.appendChild(loginDiv);
        
        // Save choice
        const saveDiv = document.createElement('div');
        saveDiv.className = 'save-choice';
        saveDiv.innerHTML = `
          <label>Save data for this site:</label>
          <select>
            <option value="">Choose...</option>
            <option value="yes" ${siteData.saveChoice === 'yes' ? 'selected' : ''}>Yes</option>
            <option value="no" ${siteData.saveChoice === 'no' ? 'selected' : ''}>No</option>
          </select>
        `;
        saveDiv.querySelector('select').addEventListener('change', (e) => {
          siteData.saveChoice = e.target.value;
          chrome.storage.local.set({ timeData });
        });
        siteDiv.appendChild(saveDiv);
        
        statsDiv.appendChild(siteDiv);
      }
    });
  });
  
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