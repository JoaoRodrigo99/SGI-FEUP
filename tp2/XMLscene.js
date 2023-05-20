import {
  CGFscene,
  CGFcamera,
  CGFaxis,
  CGFappearance,
  CGFtexture,
  CGFshader,
} from "../lib/CGF.js";

var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
  /**
   * @constructor
   * @param {MyInterface} myinterface
   */
  constructor(myinterface) {
    super();

    this.interface = myinterface;
  }

  /**
   * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
   * @param {CGFApplication} application
   */
  init(application) {
    super.init(application);

    this.sceneInited = false;
    this.selectedCamera = 0;

    // this.initCameras();

    this.axisDisplay = false;

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);
    this.setUpdatePeriod(1);

    this.camerasID = {};
    this.cameraArray = [];
    this.initCameras();

    this.selectedChannel = "footballTexture";

    this.lightActive = {};

    this.showLightPos = false;

    this.scaleFactor = 1;

    this.shadersScale = 1;

    this.timeCounter = 0; // 100 ms at a time 0.1 sec updates
    this.prevTime = 0;

    this.pulsingShadder = new CGFshader(
      this.gl,
      "shaders/pulsingAnimation.vert",
      "shaders/pulsingAnimation.frag"
    );
    this.pulsingShadder.setUniformsValues({ timeFactor: 0 });

    // shader code panels references
    this.shadersDiv = document.getElementById("shaders");
    this.vShaderDiv = document.getElementById("vshader");
    this.fShaderDiv = document.getElementById("fshader");

    // force initial setup of shader code panels

    // this.onShaderCodeVizChanged(this.showShaderCode);
    // this.onSelectedShaderChanged(this.selectedExampleShader);
  }

  /**
   * Initializes the scene cameras.
   */
  initCameras() {
    var i = 0;
    // cameras index.
    if (this.sceneInited) {
      // Reads the cameras from the scene graph.

      for (var key in this.graph.views) {
        var view = this.graph.views[key];
        this.cameraArray[i] = view;
        this.camerasID[key] = i;
        i++;
      }

      this.camera = this.cameraArray[this.camerasID[this.graph.defaultCam]];
      this.interface.setActiveCamera(this.camera);
    } else
      this.camera = new CGFcamera(
        0.4,
        0.1,
        500,
        vec3.fromValues(15, 15, 15),
        vec3.fromValues(0, 0, 0)
      );
  }

  updateCamera() {
    this.camera = this.cameraArray[this.selectedCamera];
    this.interface.setActiveCamera(this.camera);
  }

  updateChannel() {
    this.graph.components["Tv"].texture = this.selectedChannel;
  }

  /**
   * Initializes the scene lights with the values read from the XML file.
   */
  initLights() {
    var i = 0;
    // Lights index.

    // Reads the lights from the scene graph.
    for (var key in this.graph.lights) {
      if (i >= 8) break; // Only eight lights allowed by WebGL.

      if (this.graph.lights.hasOwnProperty(key)) {
        var light = this.graph.lights[key];
        this.lightActive[key] = Boolean(this.graph.lights[key][0]);

        this.lights[i].name = key;

        this.lights[i].setPosition(
          light[2][0],
          light[2][1],
          light[2][2],
          light[2][3]
        );
        this.lights[i].setAmbient(
          light[3][0],
          light[3][1],
          light[3][2],
          light[3][3]
        );
        this.lights[i].setDiffuse(
          light[4][0],
          light[4][1],
          light[4][2],
          light[4][3]
        );
        this.lights[i].setSpecular(
          light[5][0],
          light[5][1],
          light[5][2],
          light[5][3]
        );

        if (light[1] == "spot") {
          this.lights[i].setSpotCutOff(light[6]);
          this.lights[i].setSpotExponent(light[7]);
          this.lights[i].setSpotDirection(
            light[8][0],
            light[8][1],
            light[8][2]
          );
        }

        // this.lights[i].setVisible(true);
        if (light[0]) this.lights[i].enable();
        else this.lights[i].disable();

        this.lights[i].update();

        i++;
      }
    }
  }

  changeMaterial() {
    // Change component/primitive material
    for (var compName in this.graph.components) {
      if (this.graph.components[compName].materials.length > 1) {
        if (
          this.graph.components[compName].currentMaterialIndex >=
          this.graph.components[compName].materials.length - 1
        ) {
          this.graph.components[compName].currentMaterialIndex = 0;
        } else {
          this.graph.components[compName].currentMaterialIndex++;
        }
        this.graph.components[compName].currentMaterialID =
          this.graph.components[compName].materials[
            this.graph.components[compName].currentMaterialIndex
          ];
      }
    }
  }

  disableLight(number) {
    this.lights[number].disable();
  }

  setDefaultAppearance() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
  }
  /** Handler called when the graph is finally loaded.
   * As loading is asynchronous, this may be called already after the application has started the run loop
   */
  onGraphLoaded() {
    this.axis = new CGFaxis(this, this.graph.referenceLength);

    this.gl.clearColor(
      this.graph.background[0],
      this.graph.background[1],
      this.graph.background[2],
      this.graph.background[3]
    );

    this.setGlobalAmbientLight(
      this.graph.ambient[0],
      this.graph.ambient[1],
      this.graph.ambient[2],
      this.graph.ambient[3]
    );

    this.initLights();

    this.sceneInited = true;

    this.animations = this.graph.animations;

    this.initCameras();

    this.interface.addCameras(this.camerasID);
    this.interface.addLights();

    this.updateChannel();
    this.updateCamera();
  }

  update(t) {
    // only shader 6 is using time factor
    // if (this.selectedExampleShader == 6)
    // Dividing the time by 100 "slows down" the variation (i.e. in 100 ms timeFactor increases 1 unit).
    // Doing the modulus (%) by 100 makes the timeFactor loop between 0 and 99
    // ( so the loop period of timeFactor is 100 times 100 ms = 10s ; the actual animation loop depends on how timeFactor is used in the shader )
    this.pulsingShadder.setUniformsValues({ timeFactor: (t / 100) % 360 });

    // GETTING TIME IN SECONDS
    this.currentTime = Math.floor(((t / 100) % 180) / 10);

    // Getting time starting at 0 (ms)
    if (this.currentTime != this.prevTime) {
      this.prevTime = this.currentTime;
      this.timeCounter++;
    }

    // Checking instant to start updating keyframes
    if (this.sceneInited) {
      for (let key in this.animations) {
        if (this.animations[key].keyframes.length > 1) {
          if (this.animations[key].keyframes[1].instant < this.timeCounter * 1000 )
            this.animations[key].update(t);
        } else 
            this.animations[key].update(t);
      }
    }
  }

  // called when the scale factor changes on the interface
  onScaleFactorChanged(v) {
    this.pulsingShadder.setUniformsValues({ normScale: this.shadersScale });
  }

  /**
   * Displays the scene.
   */
  display() {
    // if(this.timeCounter % 10 != 0)
    //   return;

    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.pushMatrix();

    if (this.axisDisplay) this.axis.display();

    this.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);

    // Enables and disables lights
    for (var i = 0; i < this.lights.length; i++) {

      if (this.lightActive[this.lights[i].name] ) {
        this.lights[i].enable();
      } else {
        this.lights[i].disable();
      }

      //   Show lights position (places an object on the lights coordinates)
      if (this.showLightPos) {
        this.lights[i].setVisible(true);
      } else {
        this.lights[i].setVisible(false);
      }

      this.lights[i].update();
    }

    if (this.sceneInited) {
      // Draw axis
      this.setDefaultAppearance();

      // activate selected shader
      // this.setActiveShader(this.pulsingShadder);
      this.pushMatrix();

      // Displays the scene (MySceneGraph function).
      this.graph.displayScene();
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup
    // this.setActiveShader(this.defaultShader);
  }
}
