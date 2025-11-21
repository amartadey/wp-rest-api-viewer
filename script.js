// ===== Global State =====
let apiData = null;
let searchTerm = '';
let filterMethod = 'ALL';
let filterNamespace = 'ALL';
let requestHistory = [];
let favorites = [];
let settings = {
    autoFormatJson: true,
    saveHistory: true,
    showLineNumbers: false,
    requestTimeout: 30
};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadHistory();
    loadFavorites();
    initializeEventListeners();
    updateBadges();
});

// ===== Event Listeners =====
function initializeEventListeners() {
    // File upload
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('reloadFile').addEventListener('change', handleFileUpload);
    
    // URL loading
    document.getElementById('loadUrlBtn').addEventListener('click', handleUrlLoad);
    document.getElementById('urlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUrlLoad();
    });
    
    // Demo
    document.getElementById('loadDemoBtn').addEventListener('click', loadDemoAPI);
    
    // Search and filters
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderRoutes();
    });
    
    document.getElementById('namespaceFilter').addEventListener('change', (e) => {
        filterNamespace = e.target.value;
        renderRoutes();
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Export
    document.getElementById('exportBtn').addEventListener('click', () => showModal('exportModal'));
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => showModal('settingsModal'));
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // API Tester
    document.getElementById('sendRequestBtn').addEventListener('click', sendAPIRequest);
    document.getElementById('clearRequestBtn').addEventListener('click', clearRequestForm);
    document.getElementById('generateCodeBtn').addEventListener('click', () => showModal('codeModal'));
    document.getElementById('copyResponseBtn').addEventListener('click', copyResponse);
    document.getElementById('formatResponseBtn').addEventListener('click', formatResponse);
    
    // History
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    
    // Favorites
    document.getElementById('clearFavoritesBtn').addEventListener('click', clearFavorites);
    
    // Documentation
    document.getElementById('exportDocsBtn').addEventListener('click', () => exportData('markdown'));
    document.getElementById('exportPostmanBtn').addEventListener('click', exportPostmanCollection);
    
    // Export modal
    document.querySelectorAll('.export-option').forEach(btn => {
        btn.addEventListener('click', () => {
            exportData(btn.dataset.format);
            hideModal('exportModal');
        });
    });
    
    // Code generator tabs
    document.querySelectorAll('.code-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            generateCode(btn.dataset.lang);
        });
    });
    
    // Copy code
    document.querySelector('.copy-code-btn').addEventListener('click', copyGeneratedCode);
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.add('hidden');
        });
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Settings
    document.getElementById('autoFormatJson').addEventListener('change', (e) => {
        settings.autoFormatJson = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('saveHistory').addEventListener('change', (e) => {
        settings.saveHistory = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('showLineNumbers').addEventListener('change', (e) => {
        settings.showLineNumbers = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('requestTimeout').addEventListener('change', (e) => {
        settings.requestTimeout = parseInt(e.target.value);
        saveSettings();
    });
    
    // Panel actions
    document.getElementById('expandAllBtn')?.addEventListener('click', () => {
        // Expand all routes - future implementation
        showToast('Feature coming soon!', 'info');
    });
    
    document.getElementById('collapseAllBtn')?.addEventListener('click', () => {
        // Collapse all routes - future implementation
        showToast('Feature coming soon!', 'info');
    });
}

// ===== File Upload =====
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            apiData = JSON.parse(event.target.result);
            initializeApp();
            showToast('API data loaded successfully!', 'success');
        } catch (error) {
            showToast('Invalid JSON file. Please upload a valid WordPress REST API JSON.', 'error');
        }
    };
    reader.readAsText(file);
}

// ===== URL Loading =====
async function handleUrlLoad() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    const errorEl = document.getElementById('urlError');
    const loadingEl = document.getElementById('urlLoading');

    if (!url) {
        showError('Please enter a URL');
        return;
    }

    let apiUrl = url;
    if (!apiUrl.includes('/wp-json')) {
        apiUrl = apiUrl.replace(/\/$/, '') + '/wp-json';
    }

    errorEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    document.getElementById('loadUrlBtn').disabled = true;

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        apiData = data;
        initializeApp();
        showToast('API data loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading API:', error);
        showError(`Failed to load API: ${error.message}. Make sure the URL is correct and CORS is enabled.`);
    } finally {
        loadingEl.classList.add('hidden');
        document.getElementById('loadUrlBtn').disabled = false;
    }
}

// ===== Demo API =====
function loadDemoAPI() {
    // Demo WordPress API data
    apiData = {
        name: "Demo WordPress Site",
        description: "A demonstration WordPress REST API",
        url: "https://demo.wp-api.org/wp-json/",
        namespaces: ["wp/v2", "wp/v1", "oembed/1.0"],
        authentication: ["cookie"],
        timezone_string: "UTC",
        routes: {
            "/wp/v2/posts": {
                namespace: "wp/v2",
                methods: ["GET", "POST"],
                endpoints: [{
                    methods: ["GET", "POST"],
                    args: {
                        context: {
                            description: "Scope under which the request is made",
                            type: "string",
                            enum: ["view", "embed", "edit"],
                            default: "view"
                        },
                        page: {
                            description: "Current page of the collection",
                            type: "integer",
                            default: 1
                        },
                        per_page: {
                            description: "Maximum number of items to be returned",
                            type: "integer",
                            default: 10
                        },
                        search: {
                            description: "Limit results to those matching a string",
                            type: "string"
                        }
                    }
                }]
            },
            "/wp/v2/posts/(?P<id>[\\d]+)": {
                namespace: "wp/v2",
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                endpoints: [{
                    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                    args: {
                        id: {
                            description: "Unique identifier for the post",
                            type: "integer",
                            required: true
                        },
                        context: {
                            description: "Scope under which the request is made",
                            type: "string",
                            enum: ["view", "embed", "edit"]
                        }
                    }
                }]
            },
            "/wp/v2/pages": {
                namespace: "wp/v2",
                methods: ["GET", "POST"],
                endpoints: [{
                    methods: ["GET", "POST"],
                    args: {
                        context: {
                            description: "Scope under which the request is made",
                            type: "string",
                            enum: ["view", "embed", "edit"],
                            default: "view"
                        }
                    }
                }]
            },
            "/wp/v2/media": {
                namespace: "wp/v2",
                methods: ["GET", "POST"],
                endpoints: [{
                    methods: ["GET", "POST"],
                    args: {
                        context: {
                            description: "Scope under which the request is made",
                            type: "string"
                        }
                    }
                }]
            },
            "/wp/v2/users": {
                namespace: "wp/v2",
                methods: ["GET", "POST"],
                endpoints: [{
                    methods: ["GET", "POST"],
                    args: {}
                }]
            }
        }
    };
    
    initializeApp();
    showToast('Demo API loaded successfully!', 'success');
}

// ===== Initialize App =====
function initializeApp() {
    document.getElementById('uploadScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    document.getElementById('apiName').textContent = apiData.name || 'WordPress REST API';
    document.getElementById('apiUrl').textContent = apiData.url || '';
    document.getElementById('apiDescription').textContent = apiData.description || '';
    
    renderStats();
    renderNamespaceFilter();
    renderMethodFilters();
    renderRoutes();
    generateDocumentation();
}

// ===== Stats =====
function renderStats() {
    const routeCount = Object.keys(apiData.routes || {}).length;
    const namespaceCount = (apiData.namespaces || []).length;
    const authCount = (apiData.authentication || []).length;
    const timezone = apiData.timezone_string || 'UTC';
    
    // Count methods
    const methodCounts = {};
    Object.values(apiData.routes || {}).forEach(route => {
        (route.methods || []).forEach(method => {
            methodCounts[method] = (methodCounts[method] || 0) + 1;
        });
    });
    
    const stats = [
        { icon: 'mdi:routes', value: routeCount, label: 'Routes', color: 'blue' },
        { icon: 'mdi:folder-network', value: namespaceCount, label: 'Namespaces', color: 'green' },
        { icon: 'mdi:shield-lock', value: authCount, label: 'Auth Methods', color: 'purple' },
        { icon: 'mdi:clock-outline', value: timezone, label: 'Timezone', color: 'orange' },
        { icon: 'mdi:eye', value: methodCounts['GET'] || 0, label: 'GET Endpoints', color: 'cyan' },
        { icon: 'mdi:pencil', value: methodCounts['POST'] || 0, label: 'POST Endpoints', color: 'pink' }
    ];

    const html = stats.map(stat => `
        <div class="stat-card ${stat.color}">
            <span class="iconify stat-icon" data-icon="${stat.icon}"></span>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');

    document.getElementById('statsGrid').innerHTML = html;
}

// ===== Namespace Filter =====
function renderNamespaceFilter() {
    const namespaces = apiData.namespaces || [];
    const select = document.getElementById('namespaceFilter');
    
    const options = ['<option value="ALL">All Namespaces</option>'];
    namespaces.forEach(ns => {
        options.push(`<option value="${ns}">${ns}</option>`);
    });
    
    select.innerHTML = options.join('');
}

// ===== Method Filters =====
function renderMethodFilters() {
    const methods = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const html = methods.map(method => `
        <button class="method-btn ${method === filterMethod ? 'active' : ''}" 
                onclick="setMethodFilter('${method}')">
            ${method}
        </button>
    `).join('');
    document.getElementById('methodFilters').innerHTML = html;
}

function setMethodFilter(method) {
    filterMethod = method;
    renderMethodFilters();
    renderRoutes();
}

// ===== Routes =====
function getFilteredRoutes() {
    if (!apiData?.routes) return [];
    
    return Object.entries(apiData.routes).filter(([route, details]) => {
        const matchesSearch = route.toLowerCase().includes(searchTerm);
        const methods = details.methods || [];
        const matchesMethod = filterMethod === 'ALL' || methods.includes(filterMethod);
        const matchesNamespace = filterNamespace === 'ALL' || details.namespace === filterNamespace;
        return matchesSearch && matchesMethod && matchesNamespace;
    });
}

function renderRoutes() {
    const filteredRoutes = getFilteredRoutes();
    document.getElementById('routeCount').textContent = filteredRoutes.length;

    const html = filteredRoutes.map(([route, details]) => {
        const isFavorite = favorites.includes(route);
        return `
        <div class="route-item">
            <button class="route-button" onclick='selectRoute(${JSON.stringify(route)})'>
                <div class="route-info">
                    <code class="route-path">${route}</code>
                    <div class="route-methods">
                        ${(details.methods || []).slice(0, 5).map(method => 
                            `<span class="method-badge ${method.toLowerCase()}">${method}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="route-actions">
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleFavorite('${route}')" 
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <span class="iconify" data-icon="${isFavorite ? 'mdi:star' : 'mdi:star-outline'}"></span>
                    </button>
                </div>
            </button>
        </div>
    `}).join('');

    const listEl = document.getElementById('routesList');
    listEl.innerHTML = html || '<p style="color: var(--text-secondary); padding: 1rem;">No routes found</p>';
}

function selectRoute(route) {
    const details = apiData.routes[route];
    renderRouteDetails(route, details);
    
    // Pre-fill API tester
    document.getElementById('testEndpoint').value = route;
    if (details.methods && details.methods.length > 0) {
        document.getElementById('testMethod').value = details.methods[0];
    }
}

function renderRouteDetails(route, details) {
    const html = `
        <div class="route-header">
            <h3 class="route-title">${route}</h3>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
                ${(details.methods || []).map(method => 
                    `<span class="method-badge ${method.toLowerCase()}">${method}</span>`
                ).join('')}
            </div>
            ${details.namespace ? `<p class="route-namespace"><strong>Namespace:</strong> ${details.namespace}</p>` : ''}
        </div>

        ${(details.endpoints || []).map((endpoint, idx) => `
            <div class="endpoint-section">
                <div class="endpoint-methods">
                    ${(endpoint.methods || []).map(method => 
                        `<span class="method-badge ${method.toLowerCase()}">${method}</span>`
                    ).join('')}
                </div>

                ${endpoint.args && Object.keys(endpoint.args).length > 0 ? `
                    <h4 class="parameters-title">Parameters:</h4>
                    <div>
                        ${Object.entries(endpoint.args).map(([argName, argDetails]) => `
                            <div class="parameter-item">
                                <div class="parameter-header">
                                    <div>
                                        <code class="parameter-name">${argName}</code>
                                        ${argDetails.required ? '<span class="required-badge">Required</span>' : ''}
                                    </div>
                                    ${argDetails.type ? `<span class="parameter-type">${Array.isArray(argDetails.type) ? argDetails.type.join(' | ') : argDetails.type}</span>` : ''}
                                </div>
                                ${argDetails.description ? `<p class="parameter-description">${argDetails.description}</p>` : ''}
                                ${argDetails.default !== undefined ? `<p class="parameter-meta">Default: <code>${JSON.stringify(argDetails.default)}</code></p>` : ''}
                                ${argDetails.enum ? `<p class="parameter-meta">Values: ${argDetails.enum.map(v => `<code>${v}</code>`).join(', ')}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary);">No parameters defined</p>'}
            </div>
        `).join('')}
    `;

    document.getElementById('detailsPanel').innerHTML = html;
}

// ===== Favorites =====
function toggleFavorite(route) {
    const index = favorites.indexOf(route);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites', 'info');
    } else {
        favorites.push(route);
        showToast('Added to favorites', 'success');
    }
    saveFavorites();
    updateBadges();
    renderRoutes();
    renderFavorites();
}

function renderFavorites() {
    const container = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="iconify empty-icon" data-icon="mdi:star-outline"></span>
                <p class="empty-text">No favorite routes yet. Click the star icon on any route to add it here.</p>
            </div>
        `;
        return;
    }
    
    const html = favorites.map(route => {
        const details = apiData.routes[route];
        if (!details) return '';
        
        return `
            <div class="favorite-item">
                <div class="favorite-item-header">
                    <div>
                        <code class="history-item-url">${route}</code>
                        <div class="route-methods">
                            ${(details.methods || []).map(method => 
                                `<span class="method-badge ${method.toLowerCase()}">${method}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="favorite-item-actions">
                        <button class="small-btn" onclick='selectRoute("${route}")' title="View Details">
                            <span class="iconify" data-icon="mdi:eye"></span>
                        </button>
                        <button class="small-btn" onclick='toggleFavorite("${route}")' title="Remove">
                            <span class="iconify" data-icon="mdi:delete"></span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function clearFavorites() {
    if (confirm('Are you sure you want to clear all favorites?')) {
        favorites = [];
        saveFavorites();
        updateBadges();
        renderFavorites();
        renderRoutes();
        showToast('Favorites cleared', 'info');
    }
}

// ===== API Tester =====
async function sendAPIRequest() {
    const method = document.getElementById('testMethod').value;
    const endpoint = document.getElementById('testEndpoint').value.trim();
    const headersText = document.getElementById('testHeaders').value.trim();
    const bodyText = document.getElementById('testBody').value.trim();
    
    if (!endpoint) {
        showToast('Please enter an endpoint URL', 'error');
        return;
    }
    
    let headers = {};
    if (headersText) {
        try {
            headers = JSON.parse(headersText);
        } catch (e) {
            showToast('Invalid JSON in headers', 'error');
            return;
        }
    }
    
    let body = null;
    if (bodyText && ['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
            body = JSON.parse(bodyText);
        } catch (e) {
            showToast('Invalid JSON in request body', 'error');
            return;
        }
    }
    
    const statusEl = document.getElementById('responseStatus');
    const containerEl = document.getElementById('responseContainer');
    
    statusEl.textContent = 'Sending request...';
    statusEl.className = 'response-status';
    statusEl.style.display = 'block';
    
    const startTime = Date.now();
    
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), settings.requestTimeout * 1000);
        
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        const duration = Date.now() - startTime;
        const responseData = await response.json();
        
        statusEl.textContent = `Status: ${response.status} ${response.statusText} • ${duration}ms`;
        statusEl.className = `response-status ${response.ok ? 'success' : 'error'}`;
        
        const formattedJson = JSON.stringify(responseData, null, 2);
        containerEl.innerHTML = `<pre><code class="language-json">${escapeHtml(formattedJson)}</code></pre>`;
        
        if (window.Prism) {
            Prism.highlightAll();
        }
        
        // Save to history
        if (settings.saveHistory) {
            addToHistory({
                method,
                endpoint,
                status: response.status,
                timestamp: new Date().toISOString(),
                duration
            });
        }
        
        showToast('Request completed', 'success');
        
    } catch (error) {
        const duration = Date.now() - startTime;
        statusEl.textContent = `Error: ${error.message} • ${duration}ms`;
        statusEl.className = 'response-status error';
        containerEl.innerHTML = `<pre><code>${escapeHtml(error.message)}</code></pre>`;
        showToast('Request failed', 'error');
    }
}

function clearRequestForm() {
    document.getElementById('testMethod').value = 'GET';
    document.getElementById('testEndpoint').value = '';
    document.getElementById('testHeaders').value = '';
    document.getElementById('testBody').value = '';
    document.getElementById('responseStatus').style.display = 'none';
    document.getElementById('responseContainer').innerHTML = `
        <div class="empty-state">
            <span class="iconify empty-icon" data-icon="mdi:send-circle-outline"></span>
            <p class="empty-text">Send a request to see the response</p>
        </div>
    `;
}

function copyResponse() {
    const responseEl = document.querySelector('#responseContainer code');
    if (responseEl) {
        copyToClipboard(responseEl.textContent);
        showToast('Response copied to clipboard', 'success');
    }
}

function formatResponse() {
    const responseEl = document.querySelector('#responseContainer code');
    if (responseEl) {
        try {
            const json = JSON.parse(responseEl.textContent);
            const formatted = JSON.stringify(json, null, 2);
            responseEl.textContent = formatted;
            if (window.Prism) {
                Prism.highlightAll();
            }
            showToast('Response formatted', 'success');
        } catch (e) {
            showToast('Unable to format response', 'error');
        }
    }
}

// ===== History =====
function addToHistory(item) {
    requestHistory.unshift(item);
    if (requestHistory.length > 50) {
        requestHistory = requestHistory.slice(0, 50);
    }
    saveHistory();
    updateBadges();
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyList');
    
    if (requestHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="iconify empty-icon" data-icon="mdi:history"></span>
                <p class="empty-text">No request history yet</p>
            </div>
        `;
        return;
    }
    
    const html = requestHistory.map((item, index) => `
        <div class="history-item">
            <div class="history-item-header">
                <div>
                    <span class="method-badge ${item.method.toLowerCase()} history-item-method">${item.method}</span>
                    <code class="history-item-url">${item.endpoint}</code>
                    <div class="history-item-time">
                        ${new Date(item.timestamp).toLocaleString()} • ${item.duration}ms • Status: ${item.status}
                    </div>
                </div>
                <div class="history-item-actions">
                    <button class="small-btn" onclick="replayRequest(${index})" title="Replay">
                        <span class="iconify" data-icon="mdi:replay"></span>
                    </button>
                    <button class="small-btn" onclick="deleteHistoryItem(${index})" title="Delete">
                        <span class="iconify" data-icon="mdi:delete"></span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function replayRequest(index) {
    const item = requestHistory[index];
    document.getElementById('testMethod').value = item.method;
    document.getElementById('testEndpoint').value = item.endpoint;
    switchTab('tester');
    showToast('Request loaded in API Tester', 'info');
}

function deleteHistoryItem(index) {
    requestHistory.splice(index, 1);
    saveHistory();
    updateBadges();
    renderHistory();
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        requestHistory = [];
        saveHistory();
        updateBadges();
        renderHistory();
        showToast('History cleared', 'info');
    }
}

// ===== Code Generator =====
function generateCode(lang) {
    const method = document.getElementById('testMethod').value;
    const endpoint = document.getElementById('testEndpoint').value;
    const headersText = document.getElementById('testHeaders').value.trim();
    const bodyText = document.getElementById('testBody').value.trim();
    
    let headers = {};
    try {
        if (headersText) headers = JSON.parse(headersText);
    } catch (e) {}
    
    let body = null;
    try {
        if (bodyText) body = JSON.parse(bodyText);
    } catch (e) {}
    
    const codeEl = document.getElementById('generatedCode');
    let code = '';
    
    switch (lang) {
        case 'curl':
            code = generateCurl(method, endpoint, headers, body);
            codeEl.className = 'language-bash';
            break;
        case 'javascript':
            code = generateJavaScript(method, endpoint, headers, body);
            codeEl.className = 'language-javascript';
            break;
        case 'python':
            code = generatePython(method, endpoint, headers, body);
            codeEl.className = 'language-python';
            break;
        case 'php':
            code = generatePHP(method, endpoint, headers, body);
            codeEl.className = 'language-php';
            break;
    }
    
    codeEl.textContent = code;
    if (window.Prism) {
        Prism.highlightAll();
    }
}

function generateCurl(method, endpoint, headers, body) {
    let code = `curl -X ${method} '${endpoint}'`;
    
    Object.entries(headers).forEach(([key, value]) => {
        code += ` \\\n  -H '${key}: ${value}'`;
    });
    
    if (body) {
        code += ` \\\n  -d '${JSON.stringify(body)}'`;
    }
    
    return code;
}

function generateJavaScript(method, endpoint, headers, body) {
    return `fetch('${endpoint}', {
  method: '${method}',
  headers: ${JSON.stringify(headers, null, 2)},
  ${body ? `body: JSON.stringify(${JSON.stringify(body, null, 2)})` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
}

function generatePython(method, endpoint, headers, body) {
    return `import requests
import json

url = '${endpoint}'
headers = ${JSON.stringify(headers, null, 2)}
${body ? `data = ${JSON.stringify(body, null, 2)}` : ''}

response = requests.${method.toLowerCase()}(url, headers=headers${body ? ', json=data' : ''})
print(response.json())`;
}

function generatePHP(method, endpoint, headers, body) {
    return `<?php
$url = '${endpoint}';
$headers = ${JSON.stringify(headers, null, 2)};
${body ? `$data = ${JSON.stringify(body, null, 2)};` : ''}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
${body ? 'curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));' : ''}

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`;
}

function copyGeneratedCode() {
    const code = document.getElementById('generatedCode').textContent;
    copyToClipboard(code);
    showToast('Code copied to clipboard', 'success');
}

// ===== Documentation =====
function generateDocumentation() {
    if (!apiData) return;
    
    let markdown = `# ${apiData.name || 'WordPress REST API'}\n\n`;
    markdown += `${apiData.description || ''}\n\n`;
    markdown += `**Base URL:** ${apiData.url || ''}\n\n`;
    markdown += `## Namespaces\n\n`;
    
    (apiData.namespaces || []).forEach(ns => {
        markdown += `- ${ns}\n`;
    });
    
    markdown += `\n## Endpoints\n\n`;
    
    Object.entries(apiData.routes || {}).forEach(([route, details]) => {
        markdown += `### ${route}\n\n`;
        markdown += `**Methods:** ${(details.methods || []).join(', ')}\n\n`;
        markdown += `**Namespace:** ${details.namespace || 'N/A'}\n\n`;
        
        (details.endpoints || []).forEach(endpoint => {
            if (endpoint.args && Object.keys(endpoint.args).length > 0) {
                markdown += `**Parameters:**\n\n`;
                Object.entries(endpoint.args).forEach(([name, arg]) => {
                    markdown += `- \`${name}\`${arg.required ? ' (required)' : ''}: ${arg.description || ''}\n`;
                });
                markdown += '\n';
            }
        });
        
        markdown += '---\n\n';
    });
    
    document.getElementById('docsContent').innerHTML = `<pre>${escapeHtml(markdown)}</pre>`;
}

// ===== Export =====
function exportData(format) {
    if (!apiData) return;
    
    let content, filename, mimeType;
    
    switch (format) {
        case 'json':
            content = JSON.stringify(apiData, null, 2);
            filename = 'wordpress-api.json';
            mimeType = 'application/json';
            break;
            
        case 'csv':
            content = generateCSV();
            filename = 'wordpress-api-routes.csv';
            mimeType = 'text/csv';
            break;
            
        case 'markdown':
            content = document.getElementById('docsContent').textContent;
            filename = 'wordpress-api-docs.md';
            mimeType = 'text/markdown';
            break;
    }
    
    downloadFile(content, filename, mimeType);
    showToast(`Exported as ${format.toUpperCase()}`, 'success');
}

function generateCSV() {
    let csv = 'Route,Methods,Namespace\n';
    
    Object.entries(apiData.routes || {}).forEach(([route, details]) => {
        const methods = (details.methods || []).join(';');
        const namespace = details.namespace || '';
        csv += `"${route}","${methods}","${namespace}"\n`;
    });
    
    return csv;
}

function exportPostmanCollection() {
    const collection = {
        info: {
            name: apiData.name || 'WordPress REST API',
            description: apiData.description || '',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: []
    };
    
    Object.entries(apiData.routes || {}).forEach(([route, details]) => {
        (details.methods || []).forEach(method => {
            collection.item.push({
                name: `${method} ${route}`,
                request: {
                    method: method,
                    header: [],
                    url: {
                        raw: (apiData.url || '') + route,
                        host: [(apiData.url || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '')],
                        path: route.split('/').filter(p => p)
                    }
                }
            });
        });
    });
    
    const content = JSON.stringify(collection, null, 2);
    downloadFile(content, 'wordpress-api-postman.json', 'application/json');
    showToast('Postman collection exported', 'success');
}

// ===== Theme =====
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showToast(`${isDark ? 'Dark' : 'Light'} theme activated`, 'info');
}

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// ===== Tabs =====
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
    
    // Render content when switching to certain tabs
    if (tabName === 'history') {
        renderHistory();
    } else if (tabName === 'favorites') {
        renderFavorites();
    }
}

// ===== Modals =====
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    
    if (modalId === 'codeModal') {
        generateCode('curl');
    }
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// ===== Local Storage =====
function saveSettings() {
    localStorage.setItem('apiExplorerSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('apiExplorerSettings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
        document.getElementById('autoFormatJson').checked = settings.autoFormatJson;
        document.getElementById('saveHistory').checked = settings.saveHistory;
        document.getElementById('showLineNumbers').checked = settings.showLineNumbers;
        document.getElementById('requestTimeout').value = settings.requestTimeout;
    }
}

function saveHistory() {
    localStorage.setItem('apiExplorerHistory', JSON.stringify(requestHistory));
}

function loadHistory() {
    const saved = localStorage.getItem('apiExplorerHistory');
    if (saved) {
        requestHistory = JSON.parse(saved);
    }
}

function saveFavorites() {
    localStorage.setItem('apiExplorerFavorites', JSON.stringify(favorites));
}

function loadFavorites() {
    const saved = localStorage.getItem('apiExplorerFavorites');
    if (saved) {
        favorites = JSON.parse(saved);
    }
}

function updateBadges() {
    document.getElementById('historyBadge').textContent = requestHistory.length;
    document.getElementById('favoritesBadge').textContent = favorites.length;
}

// ===== Utilities =====
function showError(message) {
    const errorEl = document.getElementById('urlError');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Ctrl/Cmd + /: Toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
});
