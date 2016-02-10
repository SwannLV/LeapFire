/*
 * fire.js
 * */

//= require ./lib/jquery-2.1.1.min.js
//= require ./lib/dat.gui.min.js
//= require ./lib/three.r71.min.js
//= require ./lib/TrackballControls.js

//= require ./lib/FireShader.js
//= require ./lib/Fire.js

(function(global, $, THREE) {

    var app, App = function(id) {
        app = this;
        app.init(id);
        this.fire = {};
    };

    App.prototype = {

        init : function(id) {

            var $dom = $("#" + id);

            var scene = this.scene = new THREE.Scene();
            var camera = this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 1000);
            camera.position.z = 2;
            scene.add(camera);

            var renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });

            renderer.setClearColor(0x000000);
            renderer.setSize(window.innerWidth, window.innerHeight);
            $dom.append(renderer.domElement);

            var fireTex = THREE.ImageUtils.loadTexture("assets/textures/firetex.png");

            var wireframeMat = new THREE.MeshBasicMaterial({
                color : new THREE.Color(0xffffff),
                wireframe : true
            });

            this.fire = new THREE.Fire(fireTex);

            var wireframe = new THREE.Mesh(this.fire.geometry, wireframeMat.clone());
            this.fire.add(wireframe);
            wireframe.visible = false;

            scene.add(this.fire);

            var clock = new THREE.Clock();
            var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
            trackballControls.minDistance = 1;
            trackballControls.maxDistance = 12;

            var controller = {
                speed       : 0.5,
                magnitude   : 1.3,
                lacunarity  : 2.0,
                gain        : 0.5,
                noiseScaleX : 3.5,
                noiseScaleY : 3.5,
                noiseScaleZ : 3.5,
                wireframe   : false
            };

            var _thisFire = this.fire;
            
            var onUpdateMat = function() {
                _thisFire.material.uniforms.magnitude.value = controller.magnitude;
                _thisFire.material.uniforms.lacunarity.value = controller.lacunarity;
                _thisFire.material.uniforms.gain.value = controller.gain;
                _thisFire.material.uniforms.noiseScale.value = new THREE.Vector4(
                    controller.noiseScaleX,
                    controller.noiseScaleY,
                    controller.noiseScaleZ,
                    0.3
                );
            };
            onUpdateMat();

            
            var gui = new dat.GUI();
            gui.add(controller, "speed", 0.1, 10.0).step(0.1);
            //gui.add(controller, "magnitude", 0.0, 10.0).step(0.1).onChange(onUpdateMat);
            gui.add(controller, "lacunarity", 0.0, 10.0).step(0.1).onChange(onUpdateMat);
            gui.add(controller, "gain", 0.0, 5.0).step(0.1).onChange(onUpdateMat);
            gui.add(controller, "noiseScaleX", 0.5, 5.0).step(0.1).onChange(onUpdateMat);
            gui.add(controller, "noiseScaleY", 0.5, 5.0).step(0.1).onChange(onUpdateMat);
            gui.add(controller, "noiseScaleZ", 0.5, 5.0).step(0.1).onChange(onUpdateMat);

            /*gui.add(controller, "wireframe").onChange(function() {
                var wireframe = this.fire.children[0];
                wireframe.visible = controller.wireframe;
            });*/

            
            var loop = function() {
                requestAnimationFrame(loop);
                
                 _thisFire.material.uniforms.magnitude.value = 1 + 9*(100-yHands)/100.0;
                // console.log(_thisFire.material.uniforms.magnitude.value);
                //console.log(yHands);

                var delta = clock.getDelta();
                trackballControls.update(delta);

                var t = clock.elapsedTime * controller.speed;
                _thisFire.update(t);
                
                renderer.render(scene, camera);
            };
            loop();

            var updateRendererSize = function() {
                var w = window.innerWidth;
                var h = window.innerHeight;

                camera.aspect = w / h;
                camera.updateProjectionMatrix();

                renderer.setSize(w, h);
            };

            $(window).on('resize', updateRendererSize);
        }

    };

    global.App = App;

})(window, $, THREE);

$(function() {
    window.app = new App("viewer");
});
