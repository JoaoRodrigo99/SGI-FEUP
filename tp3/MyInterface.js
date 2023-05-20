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
        this.gui.add(this.scene, 'changeScene').name('Change Scene');

        var  GameFolder = this.gui.addFolder("Game");
        GameFolder.add(this.scene.gameOrchestrator, 'startGame').name("Start Game");
        GameFolder.add(this.scene.gameOrchestrator, 'undo').name("Undo Last Move");
        GameFolder.add(this.scene.gameOrchestrator, 'setMovie').name("Play Movie");
        GameFolder.add(this.scene.gameOrchestrator, 'resetGame').name("Fully Reset game");
        
        // this.gui.add(this.scene, 'shadersScale',0,5).onChange(this.scene.onScaleFactorChanged.bind(this.scene));

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

        this.lights = this.scene.lightActive;
        for(var key in  this.lights){
            group.add(this.scene.lightActive, key);
        }
    }

    reset(){
        
        this.gui.destroy();
        this.gui = new dat.GUI();
        this.lights = {};
        this.initKeys();
        this.gui.add(this.scene, 'axisDisplay').name('Hide/Show Axis');
        this.gui.add(this.scene, 'scaleFactor', 0.5, 3.0).name('Scale');
        this.gui.add(this.scene, 'showLightPos').name('Show Lights Position');
        this.gui.add(this.scene, 'changeScene').name('Change Scene');

        var  GameFolder = this.gui.addFolder("Game");
        GameFolder.add(this.scene.gameOrchestrator, 'startGame').name("Start Game");
        GameFolder.add(this.scene.gameOrchestrator, 'undo').name("Undo Last Move");
        GameFolder.add(this.scene.gameOrchestrator, 'setMovie').name("Play Movie");
        GameFolder.add(this.scene.gameOrchestrator, 'resetGame').name("Fully Reset game");
    }

}