if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var camera, scene, renderer, objects;
var particleLight;

var pathModels = 'assets/models/';
var pathContent = 'md/';

var spaceObjects = [
    {
        'name':'ship',
        'isShip':true,
        'unlockCode':''
    },
    {
        'name':'jupiter',
        'isShip':false,
        'unlockCode':''
    },
    {
        'name':'canyon',
        'isShip':false,
        'unlockCode':''
    },
    {
        'name':'planetz',
        'isShip':false,
        'unlockCode':''
    },
    {
        'name':'earth',
        'isShip':false,
        'unlockCode':'852488ddd9570bc877783bf4397563e0'
    }];

var planetIndex =1;
var planetList = [];
var objectInScene;
var ship;

var started = false;

var camDistance = 3;
var lowRes = false;
var loaded = 0;

var onShip = false;

var maxWidth = 1000;


//Used to skip forward and backward through the planets
function planetCycle(upward){
    if(onShip){
        $('#shipSelector').html('<span class="oi" data-glyph="home"></span>');
    }
    
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
    //Skip locked planets and your ship
    if(spaceObjects[planetIndex].unlockCode != '' || spaceObjects[planetIndex].name == 'ship'){
        planetCycle(upward);
    } else {
        showObject(spaceObjects[planetIndex].model, false);
    }
}

function unlockPlanet(code){
    //Show planet tool tip
    $('#planetInfo a').each(function() {
        $(this).addClass("tooltip");
        $(this).parent().append('<span class="tooltiptext" style="display:none;">New Co-Ordinates Obtained</span>');
        $('.tooltiptext').css('top', $(this).offset().top - $(window).scrollTop());
        $('.tooltiptext').fadeIn();
        $(this).removeAttr("onclick");
        setTimeout(function(){ 
            $('.tooltiptext').each(function() {
                 $(this).fadeOut();
            });
        }, 1400);
    });
    
    //remove unlock code to unlock
    for(planet in spaceObjects){
        if(spaceObjects[planet].unlockCode == code){
            spaceObjects[planet].unlockCode = '';
            return true;
        }
    }
}

function showObject(model, isShip){
//    hidePlanetLoader();
    
    scene.remove(objectInScene);
    
    //Click showShip from ship (ie. unshowing the ship and going back to planet view)
    if(model == objectInScene){
        isShip = false;
        $('#shipSelector').html('<span class="oi" data-glyph="home"></span>');
    }
    
    //swap icons
    if(isShip){
        $('#shipSelector').html('<span class="oi" data-glyph="globe"></span>');
    }
    
    //Getting markdown
    var body_location;
    if(isShip){
        body_location = pathContent+spaceObjects[0].name+'.md';
    } else {
        body_location = pathContent+spaceObjects[planetIndex].name+'.md';
    }
    var markdown_source = getText(body_location);
    // convert markdown to html
    var output = markdown.toHTML(markdown_source);
    $('#planetInfo').html(output);
    
    //Setting up planet discover links
    $('#planetInfo a').each(function() {
        var name = this.pathname.substr(1);
        for(planet in spaceObjects){
            if(spaceObjects[planet].unlockCode == name){
                $(this).attr('onclick','unlockPlanet("'+name+'")');
                $(this).removeAttr("href");
                $(this).addClass("code");
            }
        }
        if(!$(this).hasClass("code")){
            $(this).removeAttr("href");
            $(this).addClass("code");
        }
    });
    
    //setting current object in scene and so on..
    if(isShip){
        onShip= true;
        scene.add(ship);
        objectInScene = ship;
    } else {
        onShip= false;
        scene.add(spaceObjects[planetIndex].model);
        objectInScene = spaceObjects[planetIndex].model;
    }
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


    var pointLight = new THREE.PointLight( 0xffffff, 2.5 );
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
    
    //start loading models
    loadNext(spaceObjects.length); 
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
    
    //spin the ship or planet
    if(!onShip){
        spaceObjects[planetIndex].model.rotation.y=.2* timer;
    } else {
        ship.rotation.y=.2* timer;
    }
    renderer.render( scene, camera );
}

//recursive model loader, loads next on finish of the previous
function loadNext(leftToLoad){
    if(leftToLoad>0){
        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;
        loader.load( pathModels + spaceObjects[spaceObjects.length-leftToLoad].name + '.dae', function ( collada ) {
            var dae = collada.scene;
            dae.scale.x = dae.scale.y = dae.scale.z = 2;
            dae.updateMatrix();
            if(spaceObjects[spaceObjects.length-leftToLoad].isShip){
                ship = dae;
                showObject(ship, true);
            } else {
                spaceObjects[spaceObjects.length-leftToLoad].model = dae;
            }
            if(!started){
                animate();
                started = true;
            }
            loadNext(leftToLoad-1);
        } );
    } else {
        $('#planetViewer').show();
    }
}

//kick things off
initCanvas();