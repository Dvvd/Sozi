/*
 * Sozi - A presentation tool using the SVG standard
 *
 * Copyright (C) 2010-2013 Guillaume Savaton
 *
 * This program is dual licensed under the terms of the MIT license
 * or the GNU General Public License (GPL) version 3.
 * A copy of both licenses is provided in the doc/ folder of the
 * official release of Sozi.
 *
 * See http://sozi.baierouge.fr/wiki/en:license for details.
 */

namespace("sozi.document", function (exports) {
    "use strict";

    exports.Frame = sozi.model.Object.create({

        init: function (pres, state) {
            sozi.model.Object.init.call(this);

            this.presentation = pres;
            this.state = state;

            this.frameId = "frame" + this.id;
            this.title = "New frame";

            return this;
        }
    });

    exports.Layer = sozi.model.Object.create({

        init: function (pres, label, auto) {
            sozi.model.Object.init.call(this);

            this.presentation = pres;
            this.label = label;
            this.auto = auto;
            this.svgNodes = [];
            return this;
        }
    });

    // Constant: the SVG namespace
    var SVG_NS = "http://www.w3.org/2000/svg";

    // Constant: the Inkscape namespace
    var INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape";

    // Constant: The SVG element names that can be found in layers
    var DRAWABLE_TAGS = [ "g", "image", "path", "rect", "circle",
        "ellipse", "line", "polyline", "polygon", "text", "clippath" ];

    exports.Presentation = sozi.model.Object.create({

        /*
         * Initialize a Sozi document object.
         *
         * Returns:
         *    - The current presentation object.
         */
        init: function (svgRoot) {
            sozi.model.Object.init.call(this);

            this.frames = [];

            this.svgRoot = svgRoot;

            // Create an empty wrapper layer for elements that do not belong to a valid layer
            var defaultLayer = exports.Layer.create().init(this, "auto", true);
            this.layers = [defaultLayer];

            var svgWrapper = document.createElementNS(SVG_NS, "g");

            // Get all child nodes of the SVG root.
            // Make a copy of svgRoot.childNodes before modifying the document.
            var svgNodeList = Array.prototype.slice.call(svgRoot.childNodes);

            svgNodeList.forEach(function (svgNode) {
                // Remove text nodes and comments
                if (svgNode.tagName === undefined) {
                    svgRoot.removeChild(svgNode);
                }
                // Reorganize SVG elements
                else {
                    var nodeName = svgNode.localName.toLowerCase();
                    var nodeId = svgNode.getAttribute("id");

                    if (DRAWABLE_TAGS.indexOf(nodeName) !== -1) {
                        // The current node is a valid layer if it has the following characteristics:
                        //    - it is an SVG group element
                        //    - it has an id
                        //    - the id has not been met before.
                        if (nodeName === "g" && nodeId !== null && this.layers.every(function (layer) { return layer.nodeId !== nodeId; })) {
                            // If the current wrapper layer contains elements,
                            // add it to the document and to the list of layers.
                            if (svgWrapper.firstChild) {
                                svgRoot.insertBefore(svgWrapper, svgNode);
                                defaultLayer.svgNodes.push(svgWrapper);

                                // Create a new empty wrapper layer
                                svgWrapper = document.createElementNS(SVG_NS, "g");
                            }

                            // Add the current node as a new layer.
                            var layer = exports.Layer.create().init(this, svgNode.hasAttribute("inkscape:label") ? svgNode.getAttribute("inkscape:label") : ("#" + nodeId), false);
                            layer.svgNodes.push(svgNode);
                            this.layers.push(layer);
                        }
                        else {
                            svgWrapper.appendChild(svgNode);
                        }
                    }
                }
            }, this);

            // If the current wrapper layer contains elements,
            // add it to the document and to the list of layers.
            if (svgWrapper.firstChild) {
                svgRoot.appendChild(svgWrapper);
                defaultLayer.svgNodes.push(svgWrapper);
            }

            return this;
        },

        addFrame: function (state, index) {
            var frame = sozi.document.Frame.create().init(this, state);
            this.frames.splice(index, 0, frame);
            return frame;
        }
    });
});
