# Sounds For Work

A beautiful web application for playing ambient sounds while working. Features different categories of sounds including Classical, Lo-Fi Jazz, and Nature sounds.

## Features

- Three sound categories: Classical, Lo-Fi Jazz, and Nature
- Timer functionality (30 min, 1 hour, Unlimited)
- Volume control with smooth transitions
- Different vibes for each category (Deadline/Chill for music, Rain/Stream for nature)
- Beautiful UI with category-specific styling
- Equalizer optimization for jazz music
- Responsive design

## Hosting on GitHub Pages

### Creating the Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Enter "soundsforwork" (or another name of your choice) as the Repository name
4. Add a description if desired
5. Choose "Public" for the repository visibility
6. Click "Create repository"

### Uploading Your Files

#### Using GitHub Web Interface:
1. In your new repository, click "uploading an existing file" link
2. Drag and drop all your project files or use the file selector
3. Commit the changes directly to the main branch
4. Click "Commit changes"

#### Using Git Command Line:
```bash
# Navigate to your project directory
cd /path/to/soundsforwork

# Initialize a Git repository
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit"

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/soundsforwork.git

# Push to GitHub
git push -u origin main
```

### Enabling GitHub Pages

1. Go to your repository's Settings tab
2. Scroll down to the "GitHub Pages" section (or click "Pages" in the left sidebar)
3. Under "Source", select "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click "Save"
6. After a few minutes, your site will be published at `https://YOUR_USERNAME.github.io/soundsforwork/`
7. You can share this URL with anyone to access your audio player

## Local Development

To test locally, you can use any simple HTTP server. For example:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx http-server
```

Then open `http://localhost:8000` in your browser.

## Directory Structure

```
soundsforwork/
├── index.html
├── 404.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── img/
│   ├── bcg.png
│   ├── nature.png
│   ├── Frame 1.png
│   ├── JAZZ.png
│   ├── NAT.png
│   └── favicon/
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       └── apple-touch-icon.png
└── audio/ (hosted on Cloudinary)
```

## Audio Files

All audio files are hosted on Cloudinary to optimize the repository size and loading times. The audio sources are configured in `js/script.js`.

## Browser Compatibility

The application has been tested and works well on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use this project for personal or commercial purposes.