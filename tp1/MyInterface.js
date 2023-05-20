import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        this.initKeys();
        this.gui.add(this.scene, 'axisDisplay').name('Hide/Show Axis');
        this.gui.add(this.scene, 'scaleFactor', 0.5, 3.0).name('Scale');
        this.gui.add(this.scene, 'showLightPos').name('Show Lights Position');

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
        if(event.code == "KeyM"){
            this.scene.changeMaterial();
        }
    }

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;

    
    }

    addCameras(cameras){
        this.gui.add(this.scene, 'selectedCamera', cameras).name('Selected Camera').onChange(this.scene.updateCamera.bind(this.scene));
    }

    addLights(){
        var  group = this.gui.addFolder("Lights");
        const lights = this.scene.lightActive;
        for(var key in lights){
            group.add(this.scene.lightActive, key);
        }
    }



}