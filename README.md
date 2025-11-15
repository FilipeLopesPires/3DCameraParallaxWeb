# 3D Camera Parallax Web

An interactive web-based "virtual screen portal" experience that uses face tracking to create a dynamic 3D parallax viewing experience. Move your head to control the 3D camera and explore a 3D environment in real-time.

This was a personal demo project I created in 2021 to experiment with face tracking, 3D graphics, and web technologies.

## Features

- **Real-time Face Tracking**: Uses TensorFlow.js and FaceMesh for accurate face detection
- **3D Virtual Environment**: Interactive 3D room with textured walls and geometric objects
- **Parallax Camera Control**: Virtual camera responds to your head movements
- **Web-based**: No downloads or installations required - runs directly in your browser
- **Responsive Design**: Adapts to different screen sizes and window dimensions
- **Cross-platform**: Works on desktop and mobile devices with camera access

<p float="left">
  <img src="https://github.com/FilipeLopesPires/3DCameraParallaxWeb/blob/main/demo.gif" width="720px">
</p>

## Live Demo

Open `index.html` in a modern web browser to experience the 3D parallax effect.

## Quick Start

### Option 1: Simple File Opening
You can open `index.html` directly in your browser by double-clicking the file or dragging it into a browser window. However, this method has limitations mainly in asset loading.

### Option 2: Using a Local Web Server (Recommended)

The recommended way to run this application is using a simple local web server. Here's how:

#### Using Python (Most Common)

1. **Open Terminal/Command Prompt**
   - **Windows**: Press `Win + R`, type `cmd`, press Enter
   - **macOS**: Press `Cmd + Space`, type `Terminal`, press Enter
   - **Linux**: Press `Ctrl + Alt + T`

2. **Navigate to Project Directory**
   ```bash
   cd path/to/3DCameraParallaxWeb
   ```

3. **Start the Server**
   ```bash
   python3 -m http.server 8000
   ```
   
   If you're on Windows and `python3` doesn't work, try:
   ```bash
   python -m http.server 8000
   ```

4. **Open in Browser**
   - Open your web browser
   - Navigate to: `http://localhost:8000`
   - The application will load automatically

#### Using Node.js (Alternative)
If you have Node.js installed:
```bash
npx http-server
```

#### Using PHP (Alternative)
If you have PHP installed:
```bash
php -S localhost:8000
```

## Why Use a Web Server?

When you open `index.html` directly in a browser (using `file://` protocol), several issues occur:

1. **CORS Policy Errors**: Modern browsers block certain features when running from `file://` protocol
2. **Asset Loading Failures**: Textures and external resources may not load properly
3. **Security Restrictions**: Many web APIs are disabled for security reasons
4. **Inconsistent Behavior**: Different browsers handle `file://` protocol differently
5. **Development Issues**: Debugging and development tools may not work properly

Using a local web server simply avoids these issues.

## Technologies Used

- **A-Frame** (1.1.0) - Web framework for building 3D experiences
- **TensorFlow.js** (2.1.0) - Machine learning library for face detection
- **FaceMesh** (0.0.4) - Pre-trained model for facial landmark detection
- **WebGL** - 3D graphics rendering
- **WebRTC** - Camera access and video streaming
- **Three.js** - 3D mathematics and matrix operations

## Prerequisites

- Modern web browser with WebGL support
- Camera access (webcam required)
- Internet connection (for loading external libraries)

## How It Works

### 1. Camera Initialization
The application requests access to your webcam and sets up a video stream at 640x480 resolution.

### 2. Face Detection
Using TensorFlow.js and FaceMesh, the app continuously detects your face position in the video feed and calculates the center point.

### 3. 3D Scene Rendering
A virtual 3D room is created with:
- Textured walls using custom images
- Various 3D geometric objects (box, sphere, cylinder, plane)
- Dynamic lighting and shadows

### 4. Parallax Effect
Your head movements control the virtual camera:
- **Left/Right movement** → Camera moves horizontally
- **Up/Down movement** → Camera moves vertically
- The effect creates depth perception similar to real-world vision

### 5. Real-time Updates
The application runs at 60fps using `requestAnimationFrame` for smooth, responsive movement.

## Usage

1. **Open the Application**: Load `index.html` in your web browser
2. **Grant Camera Permission**: Allow the browser to access your webcam when prompted
3. **Position Yourself**: Sit in front of your camera with good lighting
4. **Start Moving**: Gently move your head left, right, up, or down
5. **Explore**: Watch as the 3D scene responds to your movements

## Customization

### Adding New 3D Objects

To add new objects to the scene, modify the `objects` entity in `index.html`:

```html
<a-entity id="objects" position="0 0 -0.5" scale="1 1 1">
    <!-- Add your custom objects here -->
    <a-box position="0 0 0" scale="0.1 0.1 0.1" color="#FF0000"></a-box>
</a-entity>
```

### Changing Textures

Replace the texture files in the `assets/` folder and update the references in the room entity:

```html
<a-plane position="0 0.5 -0.5" rotation="90 0 0" src="/assets/your-texture.png"></a-plane>
```

### Adjusting Sensitivity

Modify the camera movement sensitivity by changing the `half_width` and `half_height` calculations in the `faceTracking()` function.

## Troubleshooting

### Common Issues

**Camera not working:**
- Ensure you've granted camera permissions
- Check if another application is using the camera
- Try refreshing the page

**Face detection not working:**
- Improve lighting conditions
- Ensure your face is clearly visible
- Check browser console for errors

**Poor performance:**
- Close other browser tabs
- Reduce browser window size
- Update to the latest browser version

**3D scene not loading:**
- Check internet connection (required for external libraries)
- Ensure WebGL is enabled in your browser
- Try a different browser

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

I'm the sole author of this repository. For further information, feel free to reach out.
