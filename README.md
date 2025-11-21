# WordPress REST API Explorer Pro

A powerful, feature-rich web application for exploring, testing, and documenting WordPress REST APIs. Built with vanilla HTML, CSS, and JavaScript - perfect for GitHub Pages hosting.

## 🚀 Features

### Core Functionality
- **📁 File Upload**: Load WordPress REST API JSON files directly
- **🌐 URL Loading**: Fetch API data from any WordPress site URL
- **🎮 Demo Mode**: Try the app with a built-in demo API

### API Explorer
- **🔍 Advanced Search**: Search routes by name, namespace, or method
- **🏷️ Smart Filtering**: Filter by HTTP methods (GET, POST, PUT, PATCH, DELETE) and namespaces
- **⭐ Favorites**: Bookmark frequently used routes
- **📊 Statistics Dashboard**: View comprehensive API statistics at a glance
- **📝 Detailed Route Information**: View all parameters, types, and descriptions

### API Tester
- **🧪 Live Testing**: Send real HTTP requests to any endpoint
- **📋 Request Builder**: Configure method, headers, and body
- **📈 Response Viewer**: View formatted responses with syntax highlighting
- **⏱️ Performance Metrics**: See request duration and status codes
- **📜 Request History**: Track all your API requests with timestamps

### Code Generation
Generate ready-to-use code snippets in multiple languages:
- **cURL** - Command-line requests
- **JavaScript** - Fetch API implementation
- **Python** - Requests library
- **PHP** - cURL implementation

### Documentation
- **📖 Auto-Generated Docs**: Create comprehensive API documentation
- **📤 Multiple Export Formats**:
  - JSON (complete API data)
  - CSV (routes and methods)
  - Markdown (human-readable docs)
  - Postman Collection (import into Postman)

### User Experience
- **🌓 Dark/Light Theme**: Toggle between themes with persistence
- **💾 Local Storage**: Save settings, history, and favorites
- **⌨️ Keyboard Shortcuts**:
  - `Ctrl/Cmd + K` - Focus search
  - `Ctrl/Cmd + /` - Toggle theme
  - `Esc` - Close modals
- **📱 Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **🎨 Modern UI**: Beautiful gradients, animations, and micro-interactions
- **🔔 Toast Notifications**: User-friendly feedback messages

## 🎯 Live Demo

Try it now: [GitHub Pages Demo](#) *(Add your GitHub Pages URL here)*

## 📦 Installation

### Option 1: GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings → Pages
3. Select your branch (usually `main`) and root folder
4. Click Save
5. Your site will be live at `https://yourusername.github.io/repository-name`

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wordpress-api-explorer.git
cd wordpress-api-explorer
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

3. Navigate to `http://localhost:8000`

## 🎮 Usage

### Loading API Data

**Method 1: Upload JSON File**
1. Click "Upload JSON File"
2. Select your WordPress REST API JSON file
3. Start exploring!

**Method 2: Load from URL**
1. Enter your WordPress site URL (e.g., `https://example.com`)
2. Click "Load from URL"
3. The app will automatically fetch `/wp-json` endpoint

**Method 3: Try Demo**
1. Click "Try Demo API"
2. Explore with pre-loaded sample data

### Exploring Routes

1. Use the search box to find specific routes
2. Filter by HTTP method or namespace
3. Click any route to view detailed information
4. Star routes to add them to favorites

### Testing APIs

1. Switch to the "API Tester" tab
2. Select HTTP method
3. Enter endpoint URL
4. Add headers and body (if needed)
5. Click "Send Request"
6. View formatted response with status and timing

### Generating Code

1. Configure your request in the API Tester
2. Click "Generate Code"
3. Select your preferred language
4. Copy the generated code snippet

### Exporting Data

1. Click the export icon in the header
2. Choose your format:
   - JSON for complete data
   - CSV for spreadsheet import
   - Markdown for documentation
3. File downloads automatically

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks, pure JS
- **Iconify** - Beautiful icon system
- **Prism.js** - Syntax highlighting

## 📁 Project Structure

```
wordpress-api-explorer/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # All JavaScript functionality
└── README.md          # This file
```

## ⚙️ Configuration

### Settings

Access settings by clicking the gear icon:
- **Auto-format JSON**: Automatically format JSON responses
- **Save History**: Enable/disable request history tracking
- **Show Line Numbers**: Display line numbers in code blocks
- **Request Timeout**: Set timeout for API requests (5-120 seconds)

### Local Storage

The app stores the following data locally:
- Theme preference (dark/light)
- Request history (last 50 requests)
- Favorite routes
- User settings

## 🔒 CORS & Security

When loading APIs from URLs, you may encounter CORS issues. Solutions:

1. **Use a CORS proxy** (for testing only):
   ```
   https://cors-anywhere.herokuapp.com/https://your-site.com/wp-json
   ```

2. **Enable CORS on your WordPress site**:
   Add to your theme's `functions.php`:
   ```php
   add_action('rest_api_init', function() {
       remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
       add_filter('rest_pre_serve_request', function($value) {
           header('Access-Control-Allow-Origin: *');
           header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
           header('Access-Control-Allow-Credentials: true');
           return $value;
       });
   }, 15);
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Icons by [Iconify](https://iconify.design/)
- Syntax highlighting by [Prism.js](https://prismjs.com/)
- Inspired by the WordPress REST API

## 📧 Support

If you have any questions or run into issues:
- Open an [Issue](https://github.com/yourusername/wordpress-api-explorer/issues)
- Check existing issues for solutions
- Read the [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)

## 🎨 Screenshots

*(Add screenshots of your application here)*

---

**Made with ❤️ for the WordPress community**
