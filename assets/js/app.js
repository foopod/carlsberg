if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var camera, scene, renderer, objects;
var particleLight;

var pathModels = 'assets/models/';
var pathContent = 'md/';
var modelList = ['ship','jupiter', 'canyon', 'planetz', 'earth'];

var planetIndex =0;
var planetList = [];
var objectInScene;
var ship;

var started = false;

var camDistance = 3;
var lowRes = false;
var loaded = 0;

var onShip = false;

var maxWidth = 1000;

function planetCycle(upward){
    if(upward){
        planetIndex++;
        if(planetIndex==planetList.length){
            planetIndex=0;
        }
    } else {
        planetIndex--;
        if(planetIndex==-1){
            planetIndex=planetList.length-1;
        }
    }
    showObject(planetList[planetIndex], false);
}

function toggleResolution(){
    console.log(renderer.getPixelRatio());
    if(lowRes){
        renderer.setPixelRatio(window.devicePixelRatio/1);
        lowRes = false;
    } else {
        renderer.setPixelRatio(window.devicePixelRatio/10);
        lowRes = true;
    }
    console.log(renderer.getPixelRatio());
    onWindowResize();
}


function showObject(model, isShip){
    hidePlanetLoader();
    scene.remove(objectInScene);
    
    if(model == objectInScene){
        isShip = false;
    }
    
    var body_location
    if(isShip){
        body_location = pathContent+modelList[0]+'.md';
    } else {
        body_location = pathContent+modelList[planetIndex+1]+'.md';
    }
    var markdown_source = getText(body_location);
    // convert markdown to html
    var output = markdown.toHTML( markdown_source );
    $('#planetInfo').html(output);
    
    if(isShip){
        onShip= true;
        scene.add(ship);
        objectInScene = ship;
        showPlanetLoader();
    } else {
        onShip= false;
        scene.add(planetList[planetIndex]);
        objectInScene = planetList[planetIndex];
        hidePlanetLoader();
    }
}

function getText(myUrl){
    var result = null;
    $.ajax( { url: myUrl, 
              type: 'get', 
              dataType: 'html',
              async: false,
              success: function(data) { result = data; } 
            }
    );
    FileReady = true;
    return result;
}

function initCanvas() {

    container = document.getElementById("planetViewer");

    if(window.innerWidth<maxWidth){
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight*2, 1, 2000 );
        camDistance = 4;
    }else{
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth/2.1 / window.innerHeight*.95, 1, 2000 );
        camDistance = 8;
    }
    camera.position.set( 2, 2, 3 );

    scene = new THREE.Scene();

    particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
    scene.add( particleLight );

    // Lights

    scene.add( new THREE.AmbientLight( 0x999999 ) );


    var pointLight = new THREE.PointLight( 0xddddff, 2.5 );
    pointLight.position.z = 50;
    pointLight.position.x = -500;
    particleLight.add( pointLight );
    particleLight.position.x = 1;
    particleLight.position.y = 23;
    particleLight.position.z = 129;
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio/1);
    if(window.innerWidth<maxWidth){
        renderer.setSize( window.innerWidth, window.innerHeight/2 );
        camDistance = 4;
    } else {
        renderer.setSize( window.innerWidth/2.1,window.innerHeight*.95);
        camDistance = 8;
    }
    renderer.setClearColor(0x222222);
    container.appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );
    loadNext(modelList.length); 
}

function onWindowResize() {
    if(window.innerWidth>maxWidth){
        camera.aspect = window.innerWidth/2.1 / window.innerHeight*.95;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth/2.1, window.innerHeight*.95 );
        camDistance = 8;
    } else if (window.innerWidth>600){
        camera.aspect = window.innerWidth / window.innerHeight*2;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight/2 );
        camDistance = 4;
    }
}

function animate() {
    requestAnimationFrame( animate ); 
    render();
}

function render() {

    var timer = Date.now() * 0.0005;

    camera.position.x = Math.cos( 2 ) * camDistance;
    camera.position.y = 4;
    camera.position.z = Math.sin( 2 ) * camDistance;

    camera.lookAt( scene.position );
    if(!onShip){
        planetList[planetIndex].rotation.y=.5* timer;
        planetList[planetIndex].rotation.x=.0000000001* timer;
    } else {
        ship.rotation.y=.2* timer;
    }


    renderer.render( scene, camera );
}

function loadNext(leftToLoad){
    if(leftToLoad>0){
        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;
        loader.load( pathModels + modelList[modelList.length-leftToLoad] + '.dae', function ( collada ) {
            var dae = collada.scene;
            dae.scale.x = dae.scale.y = dae.scale.z = 2;
            dae.updateMatrix();
            if(modelList[modelList.length-leftToLoad]== 'ship'){
                ship = dae;
                showObject(ship, true);
            } else {
                planetList.push(dae);
            }
            if(!started){
                animate();
                started = true;
            }
            loadNext(leftToLoad-1);
        } );
    } else {
        $('#planetViewer').show();
        window.scrollTo(0,1);
    }
}

function showPlanetLoader(){
    $('#explorerInterface').show();
    $('#explorerInterface').appendTo($('#planetInfo'));
}

function hidePlanetLoader(){
    $('#explorerInterface').hide();
    $('#explorerInterface').appendTo($('#planetDescriptor'));
}

initCanvas();