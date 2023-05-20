import {
  CGFappearance,
  CGFcamera,
  CGFcameraOrtho,
  CGFtexture,
  CGFXMLreader,
} from "../lib/CGF.js";
import { MyComponent } from "./MyComponent.js";
import { MyCylinder } from "./MyCylinder.js";
import { MyPatch } from "./MyPatch.js";
import { MyRectangle } from "./MyRectangle.js";
import { MySphere } from "./MySphere.js";
import { MyTorus } from "./MyTorus.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyKeyframeAnimation } from "./MyKeyFrameAnimation.js";
import { MyKeyframe } from "./MyKeyframe.js";
// import { Animation } from "./MyAnimation.js";
// import { MyPatch } from "./MyPatch.js";

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var ANIMATIONS_INDEX = 8;
var COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
  /**
   * @constructor
   */
  constructor(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.nodes = [];

    this.idRoot = null; // The id of the root element.

    this.axisCoords = [];
    this.axisCoords["x"] = [1, 0, 0];
    this.axisCoords["y"] = [0, 1, 0];
    this.axisCoords["z"] = [0, 0, 1];

    // File reading
    this.reader = new CGFXMLreader();

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */
    this.reader.open("scenes/" + filename, this);
  }

  /*
   * Callback to be executed after successful reading
   */
  onXMLReady() {
    this.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    var error = this.parseXMLFile(rootElement);

    if (error != null) {
      this.onXMLError(error);
      return;
    }

    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
  }

  /**
   * Parses the XML file, processing each block.
   * @param {XML root element} rootElement
   */
  parseXMLFile(rootElement) {
    if (rootElement.nodeName != "sxs") return "root tag <sxs> missing";

    var nodes = rootElement.children;

    // Reads the names of the nodes to an auxiliary buffer.
    var nodeNames = [];

    for (var i = 0; i < nodes.length; i++) {
      nodeNames.push(nodes[i].nodeName);
    }

    var error;

    // Processes each node, verifying errors.

    // <scene>
    var index;
    if ((index = nodeNames.indexOf("scene")) == -1)
      return "tag <scene> missing";
    else {
      if (index != SCENE_INDEX)
        this.onXMLMinorError("tag <scene> out of order " + index);

      //Parse scene block
      if ((error = this.parseScene(nodes[index])) != null) return error;
    }

    // <views>
    if ((index = nodeNames.indexOf("views")) == -1)
      return "tag <views> missing";
    else {
      if (index != VIEWS_INDEX)
        this.onXMLMinorError("tag <views> out of order");

      //Parse views block
      if ((error = this.parseView(nodes[index])) != null) return error;
    }

    // <ambient>
    if ((index = nodeNames.indexOf("ambient")) == -1)
      return "tag <ambient> missing";
    else {
      if (index != AMBIENT_INDEX)
        this.onXMLMinorError("tag <ambient> out of order");

      //Parse ambient block
      if ((error = this.parseAmbient(nodes[index])) != null) return error;
    }

    // <lights>
    if ((index = nodeNames.indexOf("lights")) == -1)
      return "tag <lights> missing";
    else {
      if (index != LIGHTS_INDEX)
        this.onXMLMinorError("tag <lights> out of order");

      //Parse lights block
      if ((error = this.parseLights(nodes[index])) != null) return error;
    }
    // <textures>
    if ((index = nodeNames.indexOf("textures")) == -1)
      return "tag <textures> missing";
    else {
      if (index != TEXTURES_INDEX)
        this.onXMLMinorError("tag <textures> out of order");

      //Parse textures block
      if ((error = this.parseTextures(nodes[index])) != null) return error;
    }

    // <materials>
    if ((index = nodeNames.indexOf("materials")) == -1)
      return "tag <materials> missing";
    else {
      if (index != MATERIALS_INDEX)
        this.onXMLMinorError("tag <materials> out of order");

      //Parse materials block
      if ((error = this.parseMaterials(nodes[index])) != null) return error;
    }

    // <transformations>
    if ((index = nodeNames.indexOf("transformations")) == -1)
      return "tag <transformations> missing";
    else {
      if (index != TRANSFORMATIONS_INDEX)
        this.onXMLMinorError("tag <transformations> out of order");

      //Parse transformations block
      if ((error = this.parseTransformations(nodes[index])) != null)
        return error;
    }

    // <primitives>
    if ((index = nodeNames.indexOf("primitives")) == -1)
      return "tag <primitives> missing";
    else {
      if (index != PRIMITIVES_INDEX)
        this.onXMLMinorError("tag <primitives> out of order");

      //Parse primitives block
      if ((error = this.parsePrimitives(nodes[index])) != null) return error;
    }

    // <animations keyFrames>
    if ((index = nodeNames.indexOf("animations")) == -1)
      return "tag <animations> missing";
    else {
      if (index != ANIMATIONS_INDEX)
        this.onXMLMinorError("tag <animations> out of order");

      //Parse primitives block
      if ((error = this.parseAnimations(nodes[index])) != null) return error;
    }

    // <components>
    if ((index = nodeNames.indexOf("components")) == -1)
      return "tag <components> missing";
    else {
      if (index != COMPONENTS_INDEX)
        this.onXMLMinorError("tag <components> out of order");

      //Parse components block
      if ((error = this.parseComponents(nodes[index])) != null) return error;
    }
    this.log("all parsed");
  }

  /**
   * Parses the <scene> block.
   * @param {scene block element} sceneNode
   */
  parseScene(sceneNode) {
    // Get root of the scene.
    var root = this.reader.getString(sceneNode, "root");
    if (root == null) return "no root defined for scene";

    this.idRoot = root;

    // Get axis length
    var axis_length = this.reader.getFloat(sceneNode, "axis_length");
    if (axis_length == null)
      this.onXMLMinorError(
        "no axis_length defined for scene; assuming 'length = 1'"
      );

    this.referenceLength = axis_length || 1;

    this.log("Parsed scene");

    return null;
  }

  /**
   * Parses the <views> block.
   * @param {view block element} viewsNode
   */
  parseView(viewsNode) {
    var children = viewsNode.children;

    this.views = [];
    var numViews = 0;

    var grandChildren = [];
    var nodeNames = [];
    this.defaultCam = this.reader.getString(viewsNode, "default");
    // Any number of views.
    for (var i = 0; i < children.length; i++) {
      // Storing views information
      var global = [];
      var attributeNames = [];
      var attributeTypes = [];

      //Check type of view
      if (
        children[i].nodeName != "perspective" &&
        children[i].nodeName != "ortho"
      ) {
        this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
        continue;
      } else {
        attributeNames.push(...["from", "to"]);
        attributeTypes.push(...["position", "position"]);
      }

      // Get id of the current view.
      var viewID = this.reader.getString(children[i], "id");
      if (viewID == null) return "no ID defined for view";

      // Checks for repeated IDs.
      if (this.views[viewID] != null)
        return (
          "ID must be unique for each view (conflict: ID = " + viewID + ")"
        );

      grandChildren = children[i].children;
      // Specifications for the current view.

      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      for (var j = 0; j < attributeNames.length; j++) {
        var attributeIndex = nodeNames.indexOf(attributeNames[j]);

        if (attributeIndex != -1) {
          if (attributeTypes[j] == "position")
            var aux = this.parseCoordinates3D(
              grandChildren[attributeIndex],
              "view position for ID" + viewID
            );
          if (!Array.isArray(aux)) return aux;

          global.push(aux);
        } else
          return "view " + attributeNames[i] + " undefined for ID = " + viewID;
      }

      // Gets the additional attributes of the ortho view
      if (children[i].nodeName == "ortho") {
        var upIndex = nodeNames.indexOf("up");

        // Retrieves the up for ortho.
        var upView = [];
        if (upIndex != -1) {
          var aux = this.parseCoordinates3D(
            grandChildren[upIndex],
            "up for ortho for ID " + viewID
          );
          if (!Array.isArray(aux)) return aux;

          upView = aux;
        }
        //else
        // return "up for ortho undefined for ID = " + viewID;

        global.push(...[upView]);
      }
      if (children[i].nodeName === "ortho") {
        if (upView.length == 0)
          var camera = new CGFcameraOrtho(
            this.reader.getFloat(children[i], "left"),
            this.reader.getFloat(children[i], "right"),
            this.reader.getFloat(children[i], "bottom"),
            this.reader.getFloat(children[i], "top"),
            this.reader.getFloat(children[i], "near"),
            this.reader.getFloat(children[i], "far"),
            global[0],
            global[1],
            [0, 1, 0]
          );
        else
          var camera = new CGFcameraOrtho(
            this.reader.getFloat(children[i], "left"),
            this.reader.getFloat(children[i], "right"),
            this.reader.getFloat(children[i], "bottom"),
            this.reader.getFloat(children[i], "top"),
            this.reader.getFloat(children[i], "near"),
            this.reader.getFloat(children[i], "far"),
            global[0],
            global[1],
            global[2]
          );
      } else
        var camera = new CGFcamera(
          this.reader.getFloat(children[i], "angle"),
          this.reader.getFloat(children[i], "near"),
          this.reader.getFloat(children[i], "far"),
          global[0],
          global[1]
        );
      this.views[viewID] = camera;
      numViews++;
    }

    if (numViews == 0) return "at least one view must be defined";

    this.log("Parsed views");
    return null;
  }

  /**
   * Parses the <ambient> node.
   * @param {ambient block element} ambientsNode
   */
  parseAmbient(ambientsNode) {
    var children = ambientsNode.children;

    this.ambient = [];
    this.background = [];

    var nodeNames = [];

    for (var i = 0; i < children.length; i++)
      nodeNames.push(children[i].nodeName);

    // Get ambient and background nodes
    var ambientIndex = nodeNames.indexOf("ambient");
    var backgroundIndex = nodeNames.indexOf("background");

    var color = this.parseColor(children[ambientIndex], "ambient");
    if (!Array.isArray(color)) return color;
    else this.ambient = color;

    color = this.parseColor(children[backgroundIndex], "background");
    if (!Array.isArray(color)) return color;
    else this.background = color;

    this.log("Parsed ambient");

    return null;
  }

  /**
   * Parses the <light> node.
   * @param {lights block element} lightsNode
   */
  parseLights(lightsNode) {
    var children = lightsNode.children;

    this.lights = {};
    var numLights = 0;

    var grandChildren = [];
    var nodeNames = [];

    // Any number of lights.
    for (var i = 0; i < children.length; i++) {
      // Storing light information
      var global = [];
      var attributeNames = [];
      var attributeTypes = [];

      //Check type of light
      if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
        this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
        continue;
      } else {
        attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
        attributeTypes.push(...["position", "color", "color", "color"]);
      }

      // Get id of the current light.
      var lightId = this.reader.getString(children[i], "id");
      if (lightId == null) return "no ID defined for light";

      // Checks for repeated IDs.
      if (this.lights[lightId] != null)
        return (
          "ID must be unique for each light (conflict: ID = " + lightId + ")"
        );

      // Light enable/disable
      var enableLight = true;
      var aux = this.reader.getBoolean(children[i], "enabled");
      if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
        this.onXMLMinorError(
          "unable to parse value component of the 'enable light' field for ID = " +
            lightId +
            "; assuming 'value = 1'"
        );

      enableLight = aux || false;

      //Add enabled boolean and type name to light info
      global.push(enableLight);
      global.push(children[i].nodeName);

      grandChildren = children[i].children;
      // Specifications for the current light.

      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      for (var j = 0; j < attributeNames.length; j++) {
        var attributeIndex = nodeNames.indexOf(attributeNames[j]);

        if (attributeIndex != -1) {
          if (attributeTypes[j] == "position")
            var aux = this.parseCoordinates4D(
              grandChildren[attributeIndex],
              "light position for ID" + lightId
            );
          else
            var aux = this.parseColor(
              grandChildren[attributeIndex],
              attributeNames[j] + " illumination for ID" + lightId
            );

          if (!Array.isArray(aux)) return aux;

          global.push(aux);
        } else
          return (
            "light " + attributeNames[i] + " undefined for ID = " + lightId
          );
      }

      // Gets the additional attributes of the spot light
      if (children[i].nodeName == "spot") {
        var angle = this.reader.getFloat(children[i], "angle");
        if (!(angle != null && !isNaN(angle)))
          return "unable to parse angle of the light for ID = " + lightId;

        var exponent = this.reader.getFloat(children[i], "exponent");
        if (!(exponent != null && !isNaN(exponent)))
          return "unable to parse exponent of the light for ID = " + lightId;

        var targetIndex = nodeNames.indexOf("target");

        // Retrieves the light target.
        var targetLight = [];
        if (targetIndex != -1) {
          var aux = this.parseCoordinates3D(
            grandChildren[targetIndex],
            "target light for ID " + lightId
          );
          if (!Array.isArray(aux)) return aux;

          targetLight = aux;
        } else return "light target undefined for ID = " + lightId;

        global.push(...[angle, exponent, targetLight]);
      }

      this.lights[lightId] = global;
      numLights++;
    }

    if (numLights == 0) return "at least one light must be defined";
    else if (numLights > 8)
      this.onXMLMinorError(
        "too many lights defined; WebGL imposes a limit of 8 lights"
      );

    this.log("Parsed lights");
    return null;
  }

  /**
   * Parses the <textures> block.
   * @param {textures block element} texturesNode
   */
  parseTextures(texturesNode) {
    // <texture id="demoTexture" file="scenes/images/vidral.jpg" />
    this.textures = [];

    var children = texturesNode.children;
    if (children.length == 0) this.onXMLError("No texture");

    for (let i = 0; i < children.length; i++) {
      var textID = this.reader.getString(children[i], "id");

      if (textID == null) {
        this.onXMLMinorError("Texture has null ID");
      }

      if (this.textures[textID] != null) {
        this.onXMLMinorError("(" + textID + ") ID already in use (texture)");
      }

      var textContent = this.reader.getString(children[i], "file");

      if (textContent == null) {
        this.onXMLMinorError("null filepath (texture)");
      }

      var texture = new CGFtexture(this.scene, textContent);
      this.textures[textID] = texture;
    }

    //For each texture in textures block, check ID and file URL
    this.log("Parsed textures");
    return null;
  }

  /**
   * Parses the <materials> node.
   * @param {materials block element} materialsNode
   */
  parseMaterials(materialsNode) {
    var children = materialsNode.children;

    if (children.length == 0) this.onXMLError("No materials found");

    this.materials = [];

    var grandChildren = [];
    var nodeNames = [];

    // Any number of materials.
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != "material") {
        this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
        continue;
      }

      // Get id of the current material.
      var materialID = this.reader.getString(children[i], "id");
      if (materialID == null) return "no ID defined for material";

      // Checks for repeated IDs.
      if (this.materials[materialID] != null)
        return (
          "ID must be unique for each light (conflict: ID = " + materialID + ")"
        );

      //Continue here
      var shininess = this.reader.getFloat(children[i], "shininess");
      if (!(shininess != null && !isNaN(shininess)))
        return (
          "Unable to parse shininess of the material for ID = " + materialID
        );

      grandChildren = children[i].children;

      if (
        grandChildren[0].nodeName != "emission" ||
        grandChildren[1].nodeName != "ambient" ||
        grandChildren[2].nodeName != "diffuse" ||
        grandChildren[3].nodeName != "specular"
      )
        return (
          "Material with ID = " + materialID + "has wrong children components "
        );

      var emission = this.parseColor(
        grandChildren[0],
        "emission of the material with ID = " + materialID
      );
      var ambient = this.parseColor(
        grandChildren[1],
        "ambient of the material with ID = " + materialID
      );
      var diffuse = this.parseColor(
        grandChildren[2],
        "diffuse of the material with ID = " + materialID
      );
      var specular = this.parseColor(
        grandChildren[3],
        "specular of the material with ID = " + materialID
      );

      var material = new CGFappearance(this.scene);

      material.setTextureWrap("REPEAT", "REPEAT");
      material.setShininess(shininess);
      material.setEmission(emission[0], emission[1], emission[2], emission[3]);
      material.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
      material.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
      material.setSpecular(specular[0], specular[1], specular[2], specular[3]);

      this.materials[materialID] = material;

      // this.onXMLMinorError("To do: Parse materials.");
    }

    this.log("Parsed materials");
    return null;
  }

  parseTransformations(transformationsNode) {
    {
      var children = transformationsNode.children;

      if (children.length == 0) this.onXMLError("No transformations found");

      this.transformations = [];
      var grandChildren = [];

      // Any number of transformations.
      for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName != "transformation") {
          this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
          continue;
        }

        // Get id of the current transformation.
        var transID = this.reader.getString(children[i], "id");

        if (transID == null) return "Transformation has no ID";

        // Checks for repeated IDs.
        if (this.transformations[transID] != null)
          return "Transformation id Repeated (id = " + transID + ")";

        grandChildren = children[i].children;

        if (grandChildren.length == 0)
          this.onXMLError("No transformations for id" + transID);

        this.transformations[transID] =
          this.parseTransformationsComp(grandChildren);
      }

      this.log("Parsed transformations");
      return null;
    }
  }

  // For transformations inside components
  parseTransformationsComp(grandChildren) {
    var transfMatrix = mat4.create();

    for (let j = 0; j < grandChildren.length; j++) {
      var coordinates;
      switch (grandChildren[j].nodeName) {
        case "translate":
          coordinates = this.parseCoordinates3D(
            grandChildren[j],
            "translate transformation"
          );

          if (!Array.isArray(coordinates)) return coordinates;

          transfMatrix = mat4.translate(
            transfMatrix,
            transfMatrix,
            coordinates
          );
          break;

        case "scale":
          coordinates = this.parseCoordinates3D(
            grandChildren[j],
            "scale transformation"
          );

          if (!Array.isArray(coordinates)) return coordinates;

          transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
          break;

        case "rotate":
          var axis = this.reader.getString(grandChildren[j], "axis");

          if (axis == null || axis.length != 1)
            return "unable to parse axis of the rotation";

          var angle = this.reader.getFloat(grandChildren[j], "angle");

          if (angle == null || isNaN(angle))
            return "unable to parse angle of the rotation";

          angle = angle * DEGREE_TO_RAD;

          switch (axis) {
            case "x":
              transfMatrix = mat4.rotateX(transfMatrix, transfMatrix, angle);
              break;
            case "y":
              transfMatrix = mat4.rotateY(transfMatrix, transfMatrix, angle);
              break;
            case "z":
              transfMatrix = mat4.rotateZ(transfMatrix, transfMatrix, angle);
              break;
            default:
              return "unable to parse axis of the rotation";
          }
          break;
        case "transformationref":
            break;
        default:
          this.onXMLError(
            "The transformation must be one of three types (translate, rotate, scale)."
          );
      }
    }
    return transfMatrix;
  }

  parseTransformationsComponent(grandChildren) {
    var transfMatrix = existingMatrix;

    for (let j = 0; j < grandChildren.length; j++) {
      var coordinates;
      switch (grandChildren[j].nodeName) {
        case "translate":
          coordinates = this.parseCoordinates3D(
            grandChildren[j],
            "translate transformation"
          );

          if (!Array.isArray(coordinates)) return coordinates;

          transfMatrix = mat4.translate(
            transfMatrix,
            transfMatrix,
            coordinates
          );
          break;

        case "scale":
          coordinates = this.parseCoordinates3D(
            grandChildren[j],
            "scale transformation"
          );

          if (!Array.isArray(coordinates)) return coordinates;

          transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
          break;

        case "rotate":
          var axis = this.reader.getString(grandChildren[j], "axis");

          if (axis == null || axis.length != 1)
            return "unable to parse axis of the rotation";

          var angle = this.reader.getFloat(grandChildren[j], "angle");

          if (angle == null || isNaN(angle))
            return "unable to parse angle of the rotation";

          angle = angle * DEGREE_TO_RAD;

          switch (axis) {
            case "x":
              transfMatrix = mat4.rotateX(transfMatrix, transfMatrix, angle);
              break;
            case "y":
              transfMatrix = mat4.rotateY(transfMatrix, transfMatrix, angle);
              break;
            case "z":
              transfMatrix = mat4.rotateZ(transfMatrix, transfMatrix, angle);
              break;
            default:
              return "unable to parse axis of the rotation";
          }
          break;
        case "transformationref":
          break;
        default:
          this.onXMLError(
            "The transformation must be one of three types (translate, rotate, scale)."
          );
      }
    }
    return transfMatrix;
  }

  /**
   * Parses the <primitives> block.
   * @param {primitives block element} primitivesNode
   */
  parsePrimitives(primitivesNode) {
    var children = primitivesNode.children;

    this.primitives = [];

    var grandChildren = [];

    // Any number of primitives.
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != "primitive") {
        this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
        continue;
      }

      // Get id of the current primitive.
      var primitiveId = this.reader.getString(children[i], "id");
      if (primitiveId == null) return "no ID defined for texture";

      // Checks for repeated IDs.
      if (this.primitives[primitiveId] != null)
        return (
          "ID must be unique for each primitive (conflict: ID = " +
          primitiveId +
          ")"
        );

      grandChildren = children[i].children;

      // Validate the primitive type
      if (
        grandChildren.length != 1 ||
        (grandChildren[0].nodeName != "rectangle" &&
          grandChildren[0].nodeName != "triangle" &&
          grandChildren[0].nodeName != "cylinder" &&
          grandChildren[0].nodeName != "sphere" &&
          grandChildren[0].nodeName != "torus" &&
          grandChildren[0].nodeName != "patch")
      ) {
        return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)";
      }

      // Specifications for the current primitive.
      var primitiveType = grandChildren[0].nodeName;

      // Retrieves the primitive coordinates.
      if (primitiveType == "rectangle") {
        // x1
        var x1 = this.reader.getFloat(grandChildren[0], "x1");
        if (!(x1 != null && !isNaN(x1)))
          return (
            "unable to parse x1 of the primitive coordinates for ID = " +
            primitiveId
          );

        // y1
        var y1 = this.reader.getFloat(grandChildren[0], "y1");
        if (!(y1 != null && !isNaN(y1)))
          return (
            "unable to parse y1 of the primitive coordinates for ID = " +
            primitiveId
          );

        // x2
        var x2 = this.reader.getFloat(grandChildren[0], "x2");
        if (!(x2 != null && !isNaN(x2) && x2 > x1))
          return (
            "unable to parse x2 of the primitive coordinates for ID = " +
            primitiveId
          );

        // y2
        var y2 = this.reader.getFloat(grandChildren[0], "y2");
        if (!(y2 != null && !isNaN(y2) && y2 > y1))
          return (
            "unable to parse y2 of the primitive coordinates for ID = " +
            primitiveId
          );

        var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

        this.primitives[primitiveId] = rect;
      } else if (primitiveType == "triangle") {
        // x1
        var x1 = this.reader.getFloat(grandChildren[0], "x1");
        if (!(x1 != null && !isNaN(x1)))
          return (
            "unable to parse x1 of the primitive coordinates for ID = " +
            primitiveId
          );

        // y1
        var y1 = this.reader.getFloat(grandChildren[0], "y1");
        if (!(y1 != null && !isNaN(y1)))
          return (
            "unable to parse y1 of the primitive coordinates for ID = " +
            primitiveId
          );

        // x2
        var x2 = this.reader.getFloat(grandChildren[0], "x2");
        if (!(x2 != null && !isNaN(x2)))
          return (
            "unable to parse x2 of the primitive coordinates for ID = " +
            primitiveId
          );

        // y2
        var y2 = this.reader.getFloat(grandChildren[0], "y2");
        if (!(y2 != null && !isNaN(y2)))
          return (
            "unable to parse y2 of the primitive coordinates for ID = " +
            primitiveId
          );

        // x3
        var x3 = this.reader.getFloat(grandChildren[0], "x3");
        if (!(x3 != null && !isNaN(x3)))
          return (
            "unable to parse x3 of the primitive coordinates for ID = " +
            primitiveId
          );

        // y3
        var y3 = this.reader.getFloat(grandChildren[0], "y3");
        if (!(y3 != null && !isNaN(y3)))
          return (
            "unable to parse y3 of the primitive coordinates for ID = " +
            primitiveId
          );

        // z1
        var z1 = this.reader.getFloat(grandChildren[0], "z1");
        if (!(z1 != null && !isNaN(z1)))
          return (
            "unable to parse z1 of the primitive coordinates for ID = " +
            primitiveId
          );

        // z2
        var z2 = this.reader.getFloat(grandChildren[0], "z2");
        if (!(z2 != null && !isNaN(z2)))
          return (
            "unable to parse z2 of the primitive coordinates for ID = " +
            primitiveId
          );

        // z3
        var z3 = this.reader.getFloat(grandChildren[0], "z3");
        if (!(z3 != null && !isNaN(z3)))
          return (
            "unable to parse z3 of the primitive coordinates for ID = " +
            primitiveId
          );

        var tria = new MyTriangle(
          this.scene,
          primitiveId,
          x1,
          y1,
          z1,
          x2,
          y2,
          z2,
          x3,
          y3,
          z3
        );

        this.primitives[primitiveId] = tria;
      } else if (primitiveType == "cylinder") {
        // slices
        var slices = this.reader.getFloat(grandChildren[0], "slices");
        if (!(slices != null && !isNaN(slices)))
          return (
            "unable to parse slices of the primitive coordinates for ID = " +
            primitiveId
          );

        // height
        var height = this.reader.getFloat(grandChildren[0], "height");
        if (!(height != null && !isNaN(height)))
          return (
            "unable to parse height of the primitive coordinates for ID = " +
            primitiveId
          );

        // stacks
        var stacks = this.reader.getFloat(grandChildren[0], "stacks");
        if (!(stacks != null && !isNaN(stacks)))
          return (
            "unable to parse stacks of the primitive coordinates for ID = " +
            primitiveId
          );

        // top
        var top = this.reader.getFloat(grandChildren[0], "top");
        if (!(top != null && !isNaN(top))) top = 1;

        // base
        var base = this.reader.getFloat(grandChildren[0], "base");
        if (!(base != null && !isNaN(base))) base = 1;

        // height, top, base, slices, stacks
        var cyl = new MyCylinder(
          this.scene,
          primitiveId,
          height,
          top,
          base,
          slices,
          stacks
        );

        this.primitives[primitiveId] = cyl;
      } else if (primitiveType == "sphere") {
        // radius
        var radius = this.reader.getFloat(grandChildren[0], "radius");
        if (!(radius != null && !isNaN(radius)))
          return (
            "unable to parse radius of the primitive coordinates for ID = " +
            primitiveId
          );

        // slices
        var slices = this.reader.getFloat(grandChildren[0], "slices");
        if (!(slices != null && !isNaN(slices)))
          return (
            "unable to parse slices of the primitive coordinates for ID = " +
            primitiveId
          );

        // stacks
        var stacks = this.reader.getFloat(grandChildren[0], "stacks");
        if (!(stacks != null && !isNaN(stacks)))
          return (
            "unable to parse stacks of the primitive coordinates for ID = " +
            primitiveId
          );

        var sphere = new MySphere(
          this.scene,
          primitiveId,
          radius,
          slices,
          stacks
        );

        this.primitives[primitiveId] = sphere;
      } else if (primitiveType == "torus") {
        // inner
        var inner = this.reader.getFloat(grandChildren[0], "inner");
        if (!(inner != null && !isNaN(inner)))
          return (
            "unable to parse inner of the primitive coordinates for ID = " +
            primitiveId
          );

        // outer
        var outer = this.reader.getFloat(grandChildren[0], "outer");
        if (!(outer != null && !isNaN(outer)))
          return (
            "unable to parse outer of the primitive coordinates for ID = " +
            primitiveId
          );

        // slices
        var slices = this.reader.getFloat(grandChildren[0], "slices");
        if (!(slices != null && !isNaN(slices)))
          return (
            "unable to parse slices of the primitive coordinates for ID = " +
            primitiveId
          );

        // loops
        var loops = this.reader.getFloat(grandChildren[0], "loops");
        if (!(loops != null && !isNaN(loops)))
          return (
            "unable to parse loops of the primitive coordinates for ID = " +
            primitiveId
          );

        var torus = new MyTorus(
          this.scene,
          primitiveId,
          inner,
          outer,
          slices,
          loops
        );
        this.primitives[primitiveId] = torus;
      } else if (primitiveType == "patch") {
        // degree_u
        var degree_u = this.reader.getFloat(grandChildren[0], "degree_u");
        if (!(degree_u != null && !isNaN(degree_u)))
          return (
            "unable to parse degree_u of the primitive coordinates for ID = " +
            primitiveId
          );

        // parts_u
        var parts_u = this.reader.getFloat(grandChildren[0], "parts_u");
        if (!(parts_u != null && !isNaN(parts_u)))
          return (
            "unable to parse parts_u of the primitive coordinates for ID = " +
            primitiveId
          );

        // degree_v
        var degree_v = this.reader.getFloat(grandChildren[0], "degree_v");
        if (!(degree_v != null && !isNaN(degree_v)))
          return (
            "unable to parse degree_v of the primitive coordinates for ID = " +
            primitiveId
          );

        // parts_v
        var parts_v = this.reader.getFloat(grandChildren[0], "parts_v");
        if (!(parts_v != null && !isNaN(parts_v)))
          return (
            "unable to parse parts_v of the primitive coordinates for ID = " +
            primitiveId
          );

        // Parse Control Vertexes
        // Children of Patch
        var patchChildren = grandChildren[0].children;

        // N = (degree_u +1) * (degree_v + 1)
        if (patchChildren.length != (degree_u + 1) * (degree_v + 1)) {
          // return (
          //   "unable to parse control vertexes of the primitive (patch) coordinates for ID = " +
          //   primitiveId
          // );
          console.warn(
            "Control vertexes should be : " +
              (degree_u + 1) * (degree_v + 1) +
              " current number : " +
              patchChildren.length
          );
        }

        // <controlpoint x=”ff” y=”ff” z=”ff” />
        var controlPointsFinal = [];
        var linenum = 0;
        for (let i = 0; i <= degree_u; i++) {
          var controlPointsVec = [];
          for (let j = 0; j <= degree_v; j++) {
            var controlPointX = this.reader.getFloat(
              patchChildren[linenum],
              "x"
            );
            var controlPointY = this.reader.getFloat(
              patchChildren[linenum],
              "y"
            );
            var controlPointZ = this.reader.getFloat(
              patchChildren[linenum],
              "z"
            );
            var controlPointW = null;
            // var controlPointW = this.reader.getFloat(
            //   patchChildren[linenum],
            //   "w"
            // );
            if (controlPointW == null) controlPointW = 1;
            controlPointsVec[j] = [
              controlPointX,
              controlPointY,
              controlPointZ,
              controlPointW,
            ];
            linenum++;
          }
          controlPointsFinal[i] = controlPointsVec;
        }

        // console.log(controlPointsFinal);
        // console.log(primitiveId);
        this.primitives[primitiveId] = new MyPatch(
          this.scene,
          0,
          degree_u,
          parts_u,
          degree_v,
          parts_v,
          controlPointsFinal
        );
        // console.log(this.primitives[primitiveId]);
      } else {
        console.warn("To do: Parse other primitives.");
      }
    }

    this.log("Parsed primitives");
    return null;
  }

  /**
   * Parses the <animations> block.
   * @param {primitives block element} animationsNode
   */
  parseAnimations(animationsNode) {
    // console.log(animationsNode.children.length);
    this.children = animationsNode.children;
    this.animations = {};

    this.grandChildren = [];

    if (animationsNode.children.length < 1) {
      console.warn("No animations");
      return;
    }

    for (let i = 0; i < this.children.length; i++) {
      //Parse different animations

      if (this.children[i].nodeName != "keyframeanim") {
        this.onXMLMinorError("unknown tag <" + this.children[i].nodeName + ">");
        continue;
      }

      // Get id of the current animation.
      var animationID = this.reader.getString(this.children[i], "id");
      if (animationID == null) return "no ID defined for animation";

      // Checks for repeated IDs.
      if (this.animations[animationID] != null)
        return (
          "ID must be unique for each light (conflict: ID = " +
          animationID +
          ")"
        );

      this.grandChildren = this.children[i].children;

      // Create the animation with the information given
      var animation = this.createAnimation(this.grandChildren, animationID);
      if (animation == null) {
        this.onXMLMinorError(
          "Couldn't create keyframe animation with ID " + animationID + "."
        );
        continue;
      }

      // Save the aniamtion into a array
      this.animations[animationID] = animation;
    }

    this.log("Parsed animations");
    return null;
  }

  /**
   * Parses the <keyframeanim> block.
   * @param {primitives block element} keyframeNodes
   */
  createAnimation(keyframeNodes, animationID) {
    this.keyframes = [];
    this.lastKeyFInstant = 0;
    var keyframesInstants = [];

    // Read all Keyframes

    for (let i = 0; i < keyframeNodes.length; i++) {
      // Check if it's a keyframe
      if (keyframeNodes[i].nodeName != "keyframe") {
        this.onXMLMinorError(
          "Animation node children not a keyframe. Going to be ignored."
        );
        continue;
      }

      // Create a keyframe with the information given
      var keyframe = this.createKeyframe(keyframeNodes[i]);
      if (keyframe == null) {
        this.onXMLMinorError(
          "One of the keyframes of animation " +
            animationID +
            " couldn't be created."
        );
        continue;
      }

      // Se if there exists a keyframe with the same instant
      if (keyframesInstants.includes(keyframe.instant)) {
        this.onXMLMinorError(
          "Two keyframes have the same instant. Animation cannot be created."
        );
        return null;
      }

      this.keyframes.push(keyframe);

      keyframesInstants.push(keyframe.instant);
    }

    return new MyKeyframeAnimation(this.scene, animationID, this.keyframes);
  }

  /**
   * Parses the <keyframe> block.
   * @param {primitives block element} animationsNode
   */

  createKeyframe(keyFrameInfo) {
    var nodeNames = [];
    var axis, value;
    var transformationsInfo = keyFrameInfo.children;
    this.rotationAxis = null;
    this.rotationAngle = null;

    // Get the instant of the keyframe
    var instant = this.reader.getFloat(keyFrameInfo, "instant");
    if (instant == null) {
      this.onXMLMinorError("Instant not defined for keyframe. Returnig Null.");
      return null;
    }

    var keyFrame = new MyKeyframe(
      this.scene,
      instant,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );

    for (let i = 0; i < transformationsInfo.length; i++) {
      switch (transformationsInfo[i].nodeName) {
        case "translation":
          this.tx = this.reader.getFloat(transformationsInfo[i], "x");
          this.ty = this.reader.getFloat(transformationsInfo[i], "y");
          this.tz = this.reader.getFloat(transformationsInfo[i], "z");

          if (this.tx == null || this.ty == null || this.tz == null) {
            this.onXMLMinorError(
              "(keyframe) translation wrong value (x,y,z). Returnig Null."
            );
            return null;
          }
          keyFrame.tx = this.tx;
          keyFrame.ty = this.ty;
          keyFrame.tz = this.tz;

          break;
        case "rotation":
          this.rotationAxis = this.reader.getString(
            transformationsInfo[i],
            "axis"
          );
          this.rotationAngle = this.reader.getFloat(
            transformationsInfo[i],
            "angle"
          );
          if (this.rotationAxis == null || this.rotationAngle == null) {
            this.onXMLMinorError(
              "(keyframe) rotation wrong value (axis, angle). Returnig Null."
            );
            return null;
          }
          switch (this.rotationAxis) {
            case "x":
              keyFrame.rx = this.rotationAngle;
              break;
            case "y":
              keyFrame.ry = this.rotationAngle;
              break;
            case "z":
              keyFrame.rz = this.rotationAngle;
              break;
          }

          break;
        case "scale":
          this.scaleX = this.reader.getFloat(transformationsInfo[i], "sx");
          this.scaleY = this.reader.getFloat(transformationsInfo[i], "sy");
          this.scaleZ = this.reader.getFloat(transformationsInfo[i], "sz");

          if (
            this.scaleX == null ||
            this.scaleX == null ||
            this.scaleX == null
          ) {
            this.onXMLMinorError(
              "(keyframe) scale wrong value (sx,sy,sz). Returnig Null."
            );
            return null;
          }

          keyFrame.sx = this.scaleX;
          keyFrame.sy = this.scaleY;
          keyFrame.sz = this.scaleZ;

          break;
      }
    }
    return keyFrame;
  }

  /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
  parseComponents(componentsNode) {
    var children = componentsNode.children;
    var transformation;

    this.components = [];

    var grandChildren = [];
    var grandgrandChildren = [];
    var nodeNames = [];

    // Any number of components.

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != "component") {
        this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
        continue;
      }

      // Get id of the current component.
      var componentID = this.reader.getString(children[i], "id");
      if (componentID == null) return "no ID defined for componentID";

      // Checks for repeated IDs.
      if (this.components[componentID] != null)
        return (
          "ID must be unique for each component (conflict: ID = " +
          componentID +
          ")"
        );

      grandChildren = children[i].children;

      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      // Get Indexes
      var transformationIndex = nodeNames.indexOf("transformation");
      var materialsIndex = nodeNames.indexOf("materials");
      var textureIndex = nodeNames.indexOf("texture");
      var childrenIndex = nodeNames.indexOf("children");

      // Transformation
      if (transformationIndex != 0)
        this.onXMLError(
          "Transformations not found (Component  " + componentID + ")"
        );

      if (grandChildren[transformationIndex].children.length == 0) {
        transformation = mat4.create();
      } else {
        var childsTransformations = grandChildren[transformationIndex].children;
        for (let i = 0; i < childsTransformations.length; i++) {
          if (i == 0) transformation = mat4.create();
          if (childsTransformations[i].nodeName == "transformationref") {
            var id = this.reader.getString(childsTransformations[i], "id");
            if (this.transformations[id] != null) {
              // mat4.mul(transformation, transformation, this.transformations[id]);
              transformation = this.transformations[id];
            } else {
              this.onXMLMinorError(
                "Transformation id doesn't exist (" + id + ")"
              );
            }
          }
          // mat4.mul(transformation, transformation, this.parseTransformationsComp(grandChildren[transformationIndex].children));
          else
            transformation = this.parseTransformationsComp(
              grandChildren[transformationIndex].children
            );
        }
      }

      this.parseTransformationsComp(
        grandChildren[transformationIndex].children
      );

      // Materials

      if (materialsIndex != 1 && materialsIndex != 2)
        this.onXMLError("Materials not found (Component  " + componentID + ")");

      var materialID = [];

      for (let k = 0; k < grandChildren[materialsIndex].children.length; k++) {
        materialID[k] = this.reader.getString(
          grandChildren[materialsIndex].children[k],
          "id"
        );

        if (
          materialID[k] != "inherit" &&
          this.materials[materialID[k]] == null
        ) {
          this.onXMLMinorError("No material for ID : " + materialID[k]);
        }
      }

      // Texture

      if (textureIndex != 2 && textureIndex != 3)
        this.onXMLError("Texture for component " + componentID + " not found");

      var textID = this.reader.getString(grandChildren[textureIndex], "id");

      if (
        textID != "none" &&
        textID != "inherit" &&
        this.textures[textID] == null
      ) {
        this.onXMLMinorError("No texture for ID : " + textID);
      }

      var textureLenS = this.reader.getFloat(
        grandChildren[textureIndex],
        "length_s",
        false
      );
      var textureLenT = this.reader.getFloat(
        grandChildren[textureIndex],
        "length_t",
        false
      );

      // Children - COmponentref or primitives
      if (childrenIndex != 3 && childrenIndex != 4)
        this.onXMLError("Children for component " + componentID + " not found");

      grandgrandChildren = grandChildren[childrenIndex].children;
      var leaves = [];
      var componentchildren = [];

      for (let x = 0; x < grandgrandChildren.length; x++) {
        if (grandgrandChildren[x].nodeName == "componentref") {
          let child = this.reader.getString(grandgrandChildren[x], "id");
          componentchildren.push(child);
        } else if (grandgrandChildren[x].nodeName == "primitiveref") {
          let child = this.reader.getString(grandgrandChildren[x], "id");
          if (this.primitives[child] == null)
            this.onXMLMinorError("No primitive for ID : " + child);
          leaves.push(child);
        } else {
          this.onXMLMinorError(
            "unknown tag <" + grandgrandChildren[x].nodeName + ">"
          );
        }
      }

      // Parse Node Animations
      if (nodeNames.includes("animationref")) {
        var animationIndex = nodeNames.indexOf("animationref");

        if (animationIndex === null) {
          this.onXMLMinorError(
            "Couldn't get animation information for node " + nodeID
          );
        } else {
          let animationID = this.reader.getString(
            grandChildren[animationIndex],
            "id"
          );

          this.CompAnimation = this.animations[animationID];
        }
      } else {
        this.CompAnimation = null;
      }

      // <highlighted r="ff" g="ff" b="ff" scale_h="ff" />
      if (nodeNames.includes("highlighted")) {
        var highlightedIndex = nodeNames.indexOf("highlighted");

        if (highlightedIndex === null) {
          this.onXMLMinorError(
            "Couldn't get highlight information for node " + nodeID
          );
        } else {
          this.highlightR = this.reader.getFloat(
            grandChildren[highlightedIndex],
            "r"
          );
          this.highlightG = this.reader.getFloat(
            grandChildren[highlightedIndex],
            "g"
          );
          this.highlightB = this.reader.getFloat(
            grandChildren[highlightedIndex],
            "b"
          );
          this.highlightScale = this.reader.getFloat(
            grandChildren[highlightedIndex],
            "scale_h"
          );
        }
      } else {
        this.highlightR = null;
        this.highlightG = null;
        this.highlightB = null;
        this.highlightScale = null;
      }

      //Set Component
      var component = new MyComponent(
        this.scene,
        componentID,
        transformation,
        materialID,
        textID,
        textureLenS,
        textureLenT,
        componentchildren,
        leaves,
        this.CompAnimation,
        this.highlightR,
        this.highlightG,
        this.highlightB,
        this.highlightScale
      );
      this.components[componentID] = component;
    }
  }

  /**
   * Parse the coordinates from a node with ID = id
   * @param {block element} node
   * @param {message to be displayed in case of error} messageError
   */
  parseCoordinates3D(node, messageError) {
    var position = [];

    // x
    var x = this.reader.getFloat(node, "x");
    if (!(x != null && !isNaN(x)))
      return "unable to parse x-coordinate of the " + messageError;

    // y
    var y = this.reader.getFloat(node, "y");
    if (!(y != null && !isNaN(y)))
      return "unable to parse y-coordinate of the " + messageError;

    // z
    var z = this.reader.getFloat(node, "z");
    if (!(z != null && !isNaN(z)))
      return "unable to parse z-coordinate of the " + messageError;

    position.push(...[x, y, z]);

    return position;
  }

  /**
   * Parse the coordinates from a node with ID = id
   * @param {block element} node
   * @param {message to be displayed in case of error} messageError
   */
  parseCoordinates4D(node, messageError) {
    var position = [];

    //Get x, y, z
    position = this.parseCoordinates3D(node, messageError);

    if (!Array.isArray(position)) return position;

    // w
    var w = this.reader.getFloat(node, "w");
    if (!(w != null && !isNaN(w)))
      return "unable to parse w-coordinate of the " + messageError;

    position.push(w);

    return position;
  }

  /**
   * Parse the color components from a node
   * @param {block element} node
   * @param {message to be displayed in case of error} messageError
   */
  parseColor(node, messageError) {
    var color = [];

    // R
    var r = this.reader.getFloat(node, "r");
    if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
      return "unable to parse R component of the " + messageError;

    // G
    var g = this.reader.getFloat(node, "g");
    if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
      return "unable to parse G component of the " + messageError;

    // B
    var b = this.reader.getFloat(node, "b");
    if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
      return "unable to parse B component of the " + messageError;

    // A
    var a = this.reader.getFloat(node, "a");
    if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
      return "unable to parse A component of the " + messageError;

    color.push(...[r, g, b, a]);

    return color;
  }

  /*
   * Callback to be executed on any read error, showing an error on the console.
   * @param {string} message
   */
  onXMLError(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
  }

  /**
   * Callback to be executed on any minor error, showing a warning on the console.
   * @param {string} message
   */
  onXMLMinorError(message) {
    console.warn("Warning: " + message);
  }

  /**
   * Callback to be executed on any message.
   * @param {string} message
   */
  log(message) {
    console.log("   " + message);
  }

  /**
   * Displays the scene, processing each node, starting in the root node.
   */
  displayScene() {
    this.displayComponent(this.idRoot, null, null, 1, 1);
  }

  displayComponent(componentID, material, texture, s, t) {
    let i;

    if (this.components[componentID] == null) {
      this.onXMLMinorError("No component for ID : " + componentID);
    }

    // Get component info by its ID
    var component = this.components[componentID];

    // Get material info by ID
    if (component.currentMaterialID != "inherit")
      material = this.materials[component.currentMaterialID];

    // Set texture to material
    if (component.texture == "inherit") {
      material.setTexture(this.textures[texture]);
      component.length_s = s;
      component.length_t = t;
    } else if (component.texture == "none") material.setTexture(null);
    else {
      texture = component.texture;
      material.setTexture(this.textures[texture]);
    }

    // Apply material
    material.apply();

    // Apply transformations 
    this.scene.pushMatrix();
    this.scene.multMatrix(component.transformation); //Apply component transformation

    if (component.animation != null) {
      component.animation.apply();    //Apply animation transformation
    }

    // Display primitives (Components leaves)
    for (i in component.leaves) {
      //Update dynamic textures if any..
      if (component.length_s == null && component.length_t == null)
        this.primitives[component.leaves[i]].updateTexCoords(1, 1);
      else if (component.length_s == null)
        this.primitives[component.leaves[i]].updateTexCoords(
          1,
          component.length_t
        );
      else if (component.length_t == null)
        this.primitives[component.leaves[i]].updateTexCoords(
          component.length_s,
          1
        );
      else {
        this.primitives[component.leaves[i]].updateTexCoords(
          component.length_s,
          component.length_t
        );
      }

      // If component has highlighted tag apply Shader (and pass texture to shader if needed)
      if (component.r != null) {
        this.scene.pulsingShadder.setUniformsValues({
          passedColor: [component.r, component.g, component.b, 1],
        });
        this.scene.pulsingShadder.setUniformsValues({
          normScale: component.scale
        });
        this.scene.setActiveShader(this.scene.pulsingShadder);
        // console.log(component.texture);
        if(component.texture != "none"){
          this.bindingText = this.textures[texture];
          this.bindingText.bind();
        }
        // this.scene.pushMatrix();
      }


      // Display component, if he has animation wait till the seconds of the first keyFrame to display
      if(component.animation == null)
        this.primitives[component.leaves[i]].display();
      else{
        if(component.animation.keyframes.length > 1){
          if(component.animation.keyframes[1].instant < ((this.scene.timeCounter ) * 1000)) //Added -2, because of delay of Scene initiation
            this.primitives[component.leaves[i]].display();
        }
        else
          this.primitives[component.leaves[i]].display();
      }

      // If component had highlighted tag, shader was changed before display, so now change back to default one
      if (component.r != null) {
        this.scene.setActiveShader(this.defaultS);
      }
    }

    this.defaultS = this.scene.defaultShader;
    // Recursive call of display to go threw other components (ComponentsRef) in current component

    for (i in component.children) {
      this.displayComponent(component.children[i], material, texture, s, t);
    }

    this.scene.popMatrix();
  }

  changeTexture() {
    for (let i in this.components) this.components[i].updateMaterial();
  }
}
