# 3D Animation Project

This project contains a collection of 3D animations created with Three.js for video production.

## Setup

1. Install dependencies:

```
npm install
```

2. Start the development server:

```
npm start
```

3. Access the application at `http://localhost:5173`

## Project Structure

- `index.html` - Main entry point
- `js/main.js` - Core application setup with Three.js
- `js/animations/` - Individual animation scenes
- `styles.css` - Basic styling

## Adding New Animations

1. Create a new file in the `js/animations/` folder
2. Follow the pattern of existing animations with `init()`, `update()`, and `dispose()` methods
3. Import and register the new animation in `main.js`
