// background.js
let startTime = {};
let activeTabId = null;
let activeUrl = null;

// Track tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab.url, activeInfo.tabId);
});

// Track URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tabId === activeTabId) {
    handleTabChange(changeInfo.url, tabId);
  }
});

function handleTabChange(url, tabId) {
  if (activeUrl) {
    updateTimeSpent(activeUrl);
  }
  
  activeTabId = tabId;
  activeUrl = new URL(url).hostname;
  startTime[activeUrl] = Date.now();
}

function updateTimeSpent(hostname) {
  const timeSpent = Date.now() - startTime[hostname];
  
  chrome.storage.local.get(['timeData'], (result) => {
    const timeData = result.timeData || {};
    const today = new Date().toISOString().split('T')[0];
    
    if (!timeData[hostname]) {
      timeData[hostname] = {
        daily: {},
        weekly: {},
        monthly: {},
        loginStatus: false,
        saveChoice: null
      };
    }
    
    // Update daily time
    timeData[hostname].daily[today] = (timeData[hostname].daily[today] || 0) + timeSpent;
    
    // Update weekly time
    const weekNumber = getWeekNumber(new Date());
    timeData[hostname].weekly[weekNumber] = (timeData[hostname].weekly[weekNumber] || 0) + timeSpent;
    
    // Update monthly time
    const monthYear = new Date().toISOString().slice(0, 7);
    timeData[hostname].monthly[monthYear] = (timeData[hostname].monthly[monthYear] || 0) + timeSpent;
    
    chrome.storage.local.set({ timeData });
  });
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((date - firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${weekNumber}`;
}