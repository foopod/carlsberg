if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var camera, scene, renderer, objects;
var particleLight;

var pathModels = 'assets/models/';
var pathContent = 'md/';

var dex = [
    {
        'name' : 'The Alexis System',
        'planets' :['Canyon', 'Sentri'],
        'models' : []
    },{
        'name' : '8sJ0Dave',
        'planets' : ['Earth'],
        'models' : []
    },{
        'name' : 'Ad Simon Sistema',
        'planets' : ['Joe'],
        'models' : []
    },{
        'name' : 'Uguba System',
        'planets' : ['Jupiter'],
        'models' : []
    },{
        'name' : 'DArv',
        'planets' : ['Planetz'],
        'models' : []
    },{
        'name' : 'Solar Nexus',
        'planets' : ['Eye'],
        'models' : []
    }
];

var spaceObjects;
var models = [];

var planetIndex =1;
var objectInScene;
var ship;

var started = false;

var camDistance = 3;
var lowRes = false;
var loaded = 0;

var onShip = false;
var recentlyDiscovered = [];

var maxWidth = 1000;

var converter = new showdown.Converter({tables: 'true'});


//Used to skip forward and backward through the planets
function planetCycle(upward){
    if(upward){
        planetIndex++;
        if(planetIndex==spaceObjects.length){
            planetIndex=0;
        }
    } else {
        planetIndex--;
        if(planetIndex==-1){
            planetIndex=spaceObjects.length-1;
        }
    }
        showObject(models[planetIndex]);
}

function showObject(model){
    scene.remove(objectInScene);
    
    //Getting markdown
    var body_location = pathContent+spaceObjects[planetIndex].toLowerCase()+'.md';

    var markdown_source = getText(body_location);
    // convert markdown to html
    var output = converter.makeHtml(markdown_source);
    $('#planetInfo').html(output);
    
    scene.add(models[planetIndex]);
    objectInScene = models[planetIndex];
}

//used to retrieve markdown files
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
    
    //container for canvas
    container = document.getElementById("planetViewer");
    
    //two resolution sizes ie. mobile and desktop/tablet
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


    var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
    particleLight.add( pointLight );
    particleLight.position.x = -200;
    
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio/8);
    if(window.innerWidth<maxWidth){
        renderer.setSize( window.innerWidth, window.innerHeight/2 );
        camDistance = 4;
    } else {
        renderer.setSize( window.innerWidth/2.1,window.innerHeight*.95);
        camDistance = 8;
    }
    renderer.setClearColor(0x222222);
    container.appendChild(renderer.domElement);
    
    //turn off resizing for smaller devices on load
    if(window.innerWidth>=600){
        window.addEventListener( 'resize', onWindowResize, false );
    }
}

function onWindowResize() {
    if(window.innerWidth>maxWidth){
        camera.aspect = window.innerWidth/2.1 / window.innerHeight*.95;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth/2.1, window.innerHeight*.95 );
        camDistance = 8;
    } else if (window.innerWidth>500){
        camera.aspect = window.innerWidth / window.innerHeight*2;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight/2 );
        camDistance = 4;
    }
}

function initPlanets(system){
    //start loading models
    for(entry in dex){
        if(dex[entry].name == system){
            spaceObjects = dex[entry].planets;
            models = dex[entry].models;
            console.log(dex[entry].models);
            showObject(dex[entry].models[0]);
            if(!started){
                animate();
                started = true;
            }
        }
    }
    $('#planetViewer').show();
}

function loadAllPlanets(){
    for(entry in dex){
        console.log(entry);
        for(planet in dex[entry].planets){
            var loader = new THREE.ColladaLoader();
            loader.options.convertUpAxis = true;
            loader.load(pathModels+dex[entry].planets[planet].toLowerCase()+'.dae',function (collada, index) {
                var dae = collada.scene;
                dae.scale.x = dae.scale.y = dae.scale.z = 2;
                dae.updateMatrix();
                dex[this].models.push(dae);
                console.log(1);
                console.log(dex[this].planets);
                planetIndex = 0;
            }.bind(entry));
        }
    }
}

function animate() {
    requestAnimationFrame( animate ); 
    render();
}

function render() {
    if(models.length >0){
        var timer = Date.now() * 0.0005;

        camera.position.x = Math.cos( 2 ) * camDistance;
        camera.position.y = 4;
        camera.position.z = Math.sin( 2 ) * camDistance;
        
        if(spaceObjects[planetIndex] == 'Eye'){
            particleLight.position.x = 0;
            particleLight.position.y = 200;
            particleLight.position.z = 0;
            camera.position.y = 0;
            camera.position.x = 4;
        }

        camera.lookAt( scene.position );
        models[planetIndex].rotation.y=.2* timer;
        renderer.render( scene, camera );
        
    }
}

//recursive model loader, loads next on finish of the previous
//function loadNext(leftToLoad){
//    if(leftToLoad>0){
//        var loader = new THREE.ColladaLoader();
//        loader.options.convertUpAxis = true;
//        loader.load(pathModels + spaceObjects[spaceObjects.length-leftToLoad].toLowerCase() + '.dae', function ( collada ) {
//            var dae = collada.scene;
//            dae.scale.x = dae.scale.y = dae.scale.z = 2;
//            dae.updateMatrix();
//            models.push(dae);
//            planetIndex = 0;
//            showObject(models[0]);
//            if(!started){
//                animate();
//                started = true;
//            }
//            loadNext(leftToLoad-1);
//        } );
//    } else {
//        $('#planetViewer').show();
//    }
//}

function init(){
    $('#menu').append('<div class="systemHolder">');
    for(entry in dex){
        $('.systemHolder').append('<div class="system" onclick="toggle(\''+dex[entry].name+'\')">'+
          '<canvas style="image-rendering:pixelated;width:100px;height:100px;" width="8" height="8" id="'+ dex[entry].name +'"/><br><br>' + dex[entry].name + '</div>');
        makeImage(dex[entry].name);
    }
    initCanvas();
}

Math.seed = function(s) {
    return function() {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
};


function makeImage(string){
    var stringTotal = 0;
    for(char in string){
        stringTotal+=string.charCodeAt(char)*char;
    }
    
    var random = Math.seed(stringTotal/6);
    var c=document.getElementById(string);
    var ctx=c.getContext("2d");
    var imgData=ctx.createImageData(8,8);
    for (var i=0;i<imgData.data.length;i+=4){
        imgData.data[i+0]=random(i)*255;
        imgData.data[i+1]=random(i)*255;
        imgData.data[i+2]=random(i)*255;
        if(random(i) > 0.95){
            imgData.data[i+3]=255;
        } else {
            imgData.data[i+3]=0;
        }
    }
    ctx.imageSmoothingEnabled = false;
    ctx.putImageData(imgData,0,0);
    
}

//kick things off

init();