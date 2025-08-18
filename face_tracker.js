let video_element;                        // video camera 
let face_model;                        // for face detection 
let virtual_camera;                       // virtual camera ( = view point )
let canvas_element;                       // drawing area
let screen_width, screen_height;    // size of drawing area
let half_width, half_height;        // half the size of drawing area
let face_tracking_enabled = false;  // flag to control face tracking
let https_available = false;        // flag to check HTTPS availability

// Executed after loading the page.
window.onload = function() {
    // Check HTTPS availability first
    checkHttpsAvailability();
    
    // Access to canvas element
    canvas_element = document.getElementsByClassName("a-canvas")[0];
    // Access a-scene (id=scene)
    let scene = document.getElementById("scene");
    // Access virtual camera of a-frame 
    virtual_camera = scene.camera;  
    
    // Initialize the scene
    initializeScene();
    
    // Always try to initialize camera and face tracking (works without HTTPS)
    initializeCameraAndFaceTracking();
};

// Check if HTTPS is available and set appropriate flags
function checkHttpsAvailability() {
    https_available = window.location.protocol === "https:";
    
    if (!https_available) {
        console.log("HTTPS not available - VR mode will be disabled");
        console.log("Face tracking and camera control will still work in standard mode");
        
        // More aggressively disable VR mode in A-Frame
        disableVRFeatures();
        
        // Prevent browser from requesting sensor access
        preventSensorAccess();
    }
}

// Disable VR features more aggressively
function disableVRFeatures() {
    const scene = document.getElementById("scene");
    if (scene) {
        // Disable VR and AR modes
        scene.setAttribute("vr-mode", "enabled: false");
        scene.setAttribute("ar-mode", "enabled: false");
        
        // Remove VR-related components
        const vrComponents = scene.querySelectorAll("[vr-mode], [ar-mode], [look-controls], [hand-controls]");
        vrComponents.forEach(component => {
            component.removeAttribute("vr-mode");
            component.removeAttribute("ar-mode");
            component.removeAttribute("look-controls");
            component.removeAttribute("hand-controls");
        });
        
        // Disable WebXR features
        if (navigator.xr) {
            navigator.xr.isSessionSupported = () => Promise.resolve(false);
        }
    }
}

// Prevent browser from requesting sensor access
function preventSensorAccess() {
    // Override device orientation and motion APIs
    if (window.DeviceOrientationEvent) {
        window.DeviceOrientationEvent.requestPermission = () => Promise.resolve("denied");
    }
    
    if (window.DeviceMotionEvent) {
        window.DeviceMotionEvent.requestPermission = () => Promise.resolve("denied");
    }
    
    // Override WebXR APIs
    if (navigator.xr) {
        navigator.xr.isSessionSupported = () => Promise.resolve(false);
        navigator.xr.requestSession = () => Promise.reject(new Error("WebXR not supported"));
    }
    
    // Override VR display APIs
    if (navigator.getVRDisplays) {
        navigator.getVRDisplays = () => Promise.resolve([]);
    }
    
    if (navigator.getVRDisplaysAsync) {
        navigator.getVRDisplaysAsync = () => Promise.resolve([]);
    }
}

// Initialize the 3D scene with fallback textures
function initializeScene() {
    // Check if we're running from file:// protocol
    const isFileProtocol = window.location.protocol === "file:";
    
    if (isFileProtocol) {
        console.log("Running from file:// protocol - using fallback colors instead of textures");
        // Replace texture-based walls with colored walls
        replaceTexturesWithColors();
    }
}

// Replace texture-based walls with colored walls for file:// protocol
function replaceTexturesWithColors() {
    const room = document.getElementById("room");
    if (room) {
        const walls = room.querySelectorAll("a-plane");
        const colors = ["#FFF", "#FFF", "#FFF", "#FFF", "#FFF"];
        
        walls.forEach((wall, index) => {
            wall.setAttribute("color", colors[index % colors.length]);
            wall.removeAttribute("src");
        });
    }
}

// Initialize camera and face tracking with error handling
async function initializeCameraAndFaceTracking() {
    try {
        // Set resolution of video (approx. 640x480)
        let constraints = { video: { width: 640, height: 480 } };
        
        // Acquire video camera
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Access the element to draw video
        video_element = document.getElementById("video");
        // Assign mediaStream to video source
        video_element.srcObject = mediaStream;
        
        // Play video and initialize face tracking
        video_element.onloadedmetadata = function(e) {
            video_element.play();
            // Try to load face detection model
            loadFaceModel().catch(error => {
                console.log("Face detection not available:", error.message);
                // Continue without face tracking
                initializeBasicCameraControl();
            });
        };
        
    } catch (error) {
        console.log("Camera access denied or not available:", error.message);
        // Continue without camera - use basic controls
        initializeBasicCameraControl();
    }
}

// Used to initialize face detection
async function loadFaceModel() {
    try {
        // Check if facemesh is available
        if (typeof facemesh === "undefined") {
            throw new Error("FaceMesh library not loaded");
        }
        
        face_model = await facemesh.load();
        face_tracking_enabled = true;
        faceTracking();
        console.log("Face detection initialized successfully");
        
        // Update status based on HTTPS availability
        if (https_available) {
            updateStatus("Face tracking active - move your head to control camera (VR mode available)");
        } else {
            updateStatus("Face tracking active - move your head to control camera (VR mode disabled)");
        }
        
    } catch (error) {
        console.log("Failed to load face detection model:", error.message);
        throw error;
    }
} 

// Basic camera control when face tracking is not available
function initializeBasicCameraControl() {
    console.log("Initializing basic camera controls");
    
    // Set up basic keyboard controls
    document.addEventListener("keydown", handleBasicCameraControl);
    
    // Set initial camera position
    if (virtual_camera) {
        virtual_camera.position.set(0, 0, 2.5);
    }
    
    // Show status message
    updateStatus("Face tracking not available - using keyboard controls");
}

// Update status display based on current configuration
function updateStatus(message) {
    const status_element = document.getElementById("status");
    if (status_element) {
        status_element.textContent = message;
    }
}

// Handle basic camera control with keyboard
function handleBasicCameraControl(event) {
    if (!virtual_camera) return;
    
    const move_speed = 0.1;
    const rotate_speed = 0.05;
    
    switch(event.key) {
        case "w":
        case "ArrowUp":
            virtual_camera.position.z -= move_speed;
            break;
        case "s":
        case "ArrowDown":
            virtual_camera.position.z += move_speed;
            break;
        case "a":
        case "ArrowLeft":
            virtual_camera.position.x -= move_speed;
            break;
        case "d":
        case "ArrowRight":
            virtual_camera.position.x += move_speed;
            break;
        case "q":
            virtual_camera.rotation.y += rotate_speed;
            break;
        case "e":
            virtual_camera.rotation.y -= rotate_speed;
            break;
    }
}

// Used to control virtual camera
async function faceTracking() {
    if (!face_tracking_enabled || !face_model || !video_element) {
        return;
    }
    
    try {
        // Change parameters if window size is changed
        if(screen_width != canvas_element.width || screen_height != canvas_element.height){
            screen_width = canvas_element.width;
            screen_height = canvas_element.height;  
            // Calculate height by fixing width as 1
            let height = screen_height/screen_width;
            //Acquire and resize virtual room
            let room = document.getElementById("room");
            if (room) {
                room.setAttribute("scale", { x: 1, y: height, z: 1 });
            }
            half_width = 0.5; //width/2=1/2=0.5            
            half_height = height/2;            
        }   

        // Try to detect face
        let predictions = await face_model.estimateFaces(video_element);
        if (predictions.length > 0) {
            // Acquire top Left and bottom Right coordinates of bounding box
            let keypoints = predictions[0].boundingBox;
            let top_left = keypoints.topLeft;
            let bottom_right = keypoints.bottomRight;
            // Calculate center (Normalized as -1~1)
            let center_x = (top_left[0]+bottom_right[0])/video_element.videoWidth-1;
            let center_y = (top_left[1]+bottom_right[1])/video_element.videoHeight-1; 
            // Control camera position according to face position
            virtual_camera.position.x = -center_x * half_width; 
            virtual_camera.position.y = -center_y * half_height;
            virtual_camera.position.z = 2.5; //z position is fixed.    
            // Calculate projection matrix
            virtual_camera.projectionMatrix = perspectiveOffCenter(
                (-half_width-virtual_camera.position.x),(half_width-virtual_camera.position.x),
                (-half_height-virtual_camera.position.y),(half_height-virtual_camera.position.y),
                virtual_camera.position.z,5);           
        }
        
        // Continue tracking if enabled
        if (face_tracking_enabled) {
            window.requestAnimationFrame(faceTracking);
        }
        
    } catch (error) {
        console.log("Face tracking error:", error.message);
        // Disable face tracking on error
        face_tracking_enabled = false;
        // Fall back to basic controls
        initializeBasicCameraControl();
    }
}    

function perspectiveOffCenter(left, right, bottom, top, near, far) {
    let x = 2.0 * near / (right - left);
    let y = 2.0 * near / (top - bottom);
    let a = (right + left) / (right - left);
    let b = (top + bottom) / (top - bottom);
    let c = -(far + near) / (far - near);
    let d = -(2.0 * far * near) / (far - near);
    let e = -1.0;
    let m = new THREE.Matrix4();
    m.set( x,0,a,0, 0,y,b,0, 0,0,c, d,0,0, e,0);
    return m;
}
