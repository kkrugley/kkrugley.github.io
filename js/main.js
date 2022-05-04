

window.addEventListener("pageshow", function() {

	gsap.set('#sound_off', {
		autoAlpha: 0
	});


	var tl_intro = gsap.timeline({
		delay: 0, paused:true
	});
	tl_intro.to("html", 0.8, {
		autoAlpha: 1,
		ease: Power1.easeOut
	});

tl_intro.play();

		var tl = gsap.timeline({
			delay: 0.8,
			paused: true
  
		});
		tl.staggerFromTo(".stagger", 1.0, {
				y: '150%',
				skewY: 5,
				autoAlpha: 0
			}, {
				y: '0%',
				skewY: 0,
				autoAlpha: 1,
				ease: Circ.easeOut
			}, 0.3)
			.fromTo(".audio_button", 1.0, {
				scale: 0.8,
				autoAlpha: 0
			}, {
				scale: 1.0,
				autoAlpha: 1,
				ease: Power4.easeOut
			}, 2);

		tl.play();
		





	[...document.querySelectorAll('.work_item')].forEach(function(item) {




		var this_inner = item.querySelector('.work_item_inner');

		var staggers = item.querySelectorAll('.stagger_body');




		var tl02 = gsap.timeline({
			paused: true
		});
		tl02.staggerFromTo(staggers, 1.0, {
			y: '200%',
			skewY: 10,
			autoAlpha: 0
		}, {
			y: '0%',
			skewY: 0,
			autoAlpha: 1,
			ease: Power4.easeOut
		}, 0.3);

		ScrollTrigger.create({
			trigger: item,
			start: "center bottom",
			onEnter: () => tl02.play()
		});

		ScrollTrigger.create({
			trigger: item,
			start: "top bottom",
			onLeaveBack: () => tl02.pause(0)
		});




		this_inner.addEventListener("mousemove", function() {

			rotate_cursor.play();
			show_cursor.play();

		});



		this_inner.addEventListener("mouseleave", function() {
			rotate_cursor.pause();
			show_cursor.reverse();

		});


	}); /*close forEach*/


	gsap.ticker.fps(50);




//underline animations


[...document.querySelectorAll('.underline_trigger')].forEach(function(item) {

	var this_underline = item.querySelector('.underline');

	item.addEventListener("mouseover", function() {

		gsap.fromTo(this_underline, 0.4, {
			width: 0
		}, {width: "100%",
			ease: Power4.easeOut,
			overwrite: true});

	});


	item.addEventListener("mouseleave", function() {

		gsap.to(this_underline, 0.4, {
			width: "0%",
			ease: Power4.easeOut,
			overwrite: true
		});

	});



}); /*close forEach*/



}); /*close on pageview load*/









//transitions




var tl_transition01 = gsap.timeline({
	paused: true,
	overwrite: true
});
tl_transition01
	.to("html", 0.5, {
		autoAlpha: 0,
		ease: Power2.easeInOut
	});

tl_transition01.timeScale(0.5);



var info_link = document.querySelector('.info-link');
info_link.addEventListener('click', function() {

	event.stopPropagation();

	tl_transition01.play();

	setTimeout(function() {
		window.location.href = 'https://www.richardsancho.com/info.html';
	}, 1000);



});




var medium_homepages_link = document.querySelector('.medium-homepages-link');
medium_homepages_link.addEventListener('click', function() {

	tl_transition01.play();

	setTimeout(function() {
		window.location.href = 'https://www.richardsancho.com/medium-homepages.html';
	}, 1000);



});



var medium_brand_redesign_link = document.querySelector('.medium-brand-redesign-link');
medium_brand_redesign_link.addEventListener('click', function() {

	tl_transition01.play();

	setTimeout(function() {
		window.location.href = 'https://www.richardsancho.com/medium-brand-redesign.html';
	}, 1000);



});



var new_yorker_documentary_link = document.querySelector('.new-yorker-documentary-link');
new_yorker_documentary_link.addEventListener('click', function() {

	tl_transition01.play();

	setTimeout(function() {
		window.location.href = 'https://www.richardsancho.com/new-yorker-documentary.html';
	}, 1000);



});



var new_yorker_cannabis_link = document.querySelector('.new-yorker-cannabis-link');
new_yorker_cannabis_link.addEventListener('click', function() {

	tl_transition01.play();

	setTimeout(function() {
		window.location.href = 'https://www.richardsancho.com/new-yorker-california-cannabis.html';
	}, 1000);



});




var new_yorker_moon_hours_link = document.querySelector('.new-yorker-moon-hours-link');
new_yorker_moon_hours_link.addEventListener('click', function() {

	tl_transition01.play();

	setTimeout(function() {
		window.location.href = 'https://www.richardsancho.com/new-yorker-moon-hours.html';
	}, 1000);



});



var new_yorker_la_dreaming_link = document.querySelector('.new-yorker-la-dreaming-link');
new_yorker_la_dreaming_link.addEventListener('click', function() {

	tl_transition01.play();

	setTimeout(function() {
		window.location.href = 'https://www.richardsancho.com/new-yorker-la-dreaming.html';
	}, 1000);



});




var new_yorker_touchstones_link = document.querySelector('.new-yorker-touchstones-link');
new_yorker_touchstones_link.addEventListener('click', function() {

	tl_transition01.play();

	setTimeout(function() {
		window.location.href = 'https://www.richardsancho.com/new-yorker-touchstones.html';
	}, 1000);



});


var mtv_news_link = document.querySelector('.mtv-news-link');
mtv_news_link.addEventListener('click', function() {

	tl_transition01.play();

	setTimeout(function() {
		window.location.href = 'https://www.richardsancho.com/mtv-news.html';
	}, 1000);



});




gsap.set(".cursor", {
	autoAlpha: 0,
	scale: 0.8
});




var work_button = document.querySelector('.work_button');


work_button.addEventListener('click', function() {
	event.stopPropagation();
	gsap.to(window, {
		duration: 0.5,
		scrollTo: '.work_section',
		ease: Circ.easeOut
	});
});




//tone.js


const background_sampler = new Tone.Sampler({
	urls: {
		C1: "https://www.richardsancho.com/audio/background01.mp3",
		D1: "https://www.richardsancho.com/audio/background02.mp3"
	}

}).toDestination();

background_sampler.volume.value = -3;

const mainChords = [{
		'time': 0,
		'note': 'C1',
		'duration': '4m'
	},
	{
		'time': '2:0:0',
		'note': 'D1',
		'duration': '4m'
	}
];

var part01 = new Tone.Part(function(time, note) {
	//the notes given as the second element in the array
	//will be passed in as the second argument

	background_sampler.triggerAttackRelease(note.note, note.duration, time);
}, mainChords).start();

part01.loop = true;
part01.loopEnd = '4m';


Tone.Transport.bpm.value = 90;





if (Tone.context.state !== 'running') {
	Tone.context.resume();
}


//audio button

var rotate_audio_button = gsap.timeline({
	paused: true
});
rotate_audio_button.to('.audio_button img', 30, {
	rotation: "360",
	ease: Linear.easeNone,
	repeat: -1,
	roundProps: {
		rotation: 0.5
	}
});








const sampler = new Tone.Sampler({
	urls: {
		C1: "https://www.richardsancho.com/audio/snippets01.mp3",
		D1: "https://www.richardsancho.com/audio/snippets02.mp3",
		E1: "https://www.richardsancho.com/audio/snippets03.mp3",
		F1: "https://www.richardsancho.com/audio/snippets04.mp3",
		G1: "https://www.richardsancho.com/audio/snippets05.mp3",
		A1: "https://www.richardsancho.com/audio/snippets06.mp3",
		B1: "https://www.richardsancho.com/audio/snippets07.mp3",
		C2: "https://www.richardsancho.com/audio/snippets08.mp3",
		D2: "https://www.richardsancho.com/audio/snippets09.mp3",
		E2: "https://www.richardsancho.com/audio/snippets12.mp3"

	}

}).toDestination();

sampler.volume.value = -10;



function a() {
	sampler.triggerAttack("C1");
	gsap.set(material01.color, {
		r: newColor1.r,
		g: newColor1.g,
		b: newColor1.b
	});
}

function b() {
	sampler.triggerAttack("D1");
	gsap.set(material02.color, {
		r: newColor2.r,
		g: newColor2.g,
		b: newColor2.b
	});
}

function c() {
	sampler.triggerAttack("E1");
	gsap.set(material03.color, {
		r: newColor3.r,
		g: newColor3.g,
		b: newColor3.b
	});
}

function d() {
	sampler.triggerAttack("F1");
	gsap.set(material04.color, {
		r: newColor4.r,
		g: newColor4.g,
		b: newColor4.b
	});
}

function e() {
	sampler.triggerAttack("G1");
	gsap.set(material03.color, {
		r: newColor5.r,
		g: newColor5.g,
		b: newColor5.b
	});
}

function f() {
	sampler.triggerAttack("A1");
	gsap.set(material02.color, {
		r: newColor6.r,
		g: newColor6.g,
		b: newColor6.b
	});
}

function g() {
	sampler.triggerAttack("B1");
	gsap.set(material01.color, {
		r: newColor7.r,
		g: newColor7.g,
		b: newColor7.b
	});
}

function h() {
	sampler.triggerAttack("C2");
	gsap.set(material04.color, {
		r: newColor8.r,
		g: newColor8.g,
		b: newColor8.b
	});
}

function i() {
	sampler.triggerAttack("D2");
	gsap.set(material03.color, {
		r: newColor9.r,
		g: newColor9.g,
		b: newColor9.b
	});
}

function j() {
	sampler.triggerAttack("E2");
	gsap.set(material02.color, {
		r: newColor10.r,
		g: newColor10.g,
		b: newColor10.b
	});
}




var myFunctions = [a, b, c, d, e, f, g, h, i, j];



var i = -1;

//var random;

function myFunctionSwitcher() {

	if (i < 9) {

		myFunctions[++i]();
	} else {
		myFunctions[0]();
		i = 0;
	}
	//random = Math.floor(Math.random() * myFunctions.length);
	//myFunctions[random]();
}

var AudioIsOn = false;

var turnAudioOn = (function() {

    return function() {
        if (!AudioIsOn) {
            AudioIsOn = true;
						
	Tone.getDestination().volume.rampTo(0, 0.1);
	Tone.start();
	Tone.Transport.start();
	part01.start();
	rotate_audio_button.play();
	audio_button.classList.add('active');
		gsap.to('#sound_on', 0.3, {
		autoAlpha: 0,
		ease: Power1.easeOut
	});
	gsap.to('#sound_off', 0.3, {
		autoAlpha: 1,
		ease: Power1.easeOut
	});

        }
    };
})();






function turnAudioOff() {
		audio_button.classList.remove('active');
		Tone.getDestination().volume.rampTo(-100, 1);


		gsap.to('#sound_on', 0.3, {
			autoAlpha: 1,
			ease: Power1.easeOut
		});
		gsap.to('#sound_off', 0.3, {
			autoAlpha: 0,
			ease: Power1.easeOut
		});
		rotate_audio_button.pause();
AudioIsOn = false;
	
}



var audio_button = document.querySelector('.audio_button');


var header = document.querySelector('.header');



if ("ontouchstart" in document.documentElement)
{
	
	} else {
		
		var rotate_cursor = gsap.timeline({
	paused: true
});
rotate_cursor.to('.cursor img', 16, {
	rotation: "360",
	ease: Linear.easeNone,
	repeat: -1
});

var show_cursor = gsap.timeline({
	paused: true
});
show_cursor.to('.cursor', 0.3, {
	autoAlpha: 1,
	scale: 1.0,
	ease: Power4.easeInOut
});




window.addEventListener("scroll", function() {
	show_cursor.reverse();
});
		var work_section = document.querySelector('.work_section');
		work_section.addEventListener('mousemove', e => {
		gsap.to(".cursor", {
			x: e.pageX - 60,
			y: e.pageY - 60,
			ease: Power4.easeOut
		});
	});
		

		
		
	} /*close if not touch device*/
	
	
	


 header.addEventListener('click', function() {
	turnAudioOn();
	myFunctionSwitcher();
});
 
 
 audio_button.addEventListener('click', function(event) {


	event.stopPropagation();

	Tone.Master.mute = false;


	if (audio_button.classList.contains('active')) {
turnAudioOff();

	} else {
turnAudioOn();

	}


});
		 
   /* } *//*close if touch device*/
	





function stop_audio_on_scroll() {

AudioIsOn = false;

	Tone.getDestination().volume.rampTo(-50, 2);

	Tone.Transport.stop();
	gsap.to('#sound_on', 0.3, {
		autoAlpha: 1,
		ease: Power1.easeOut
	});
	gsap.to('#sound_off', 0.3, {
		autoAlpha: 0,
		ease: Power1.easeOut
	});
	audio_button.classList.remove('active');
	rotate_audio_button.pause();

}
ScrollTrigger.create({
	trigger: ".work_section",
	start: "5% bottom",
	onEnter: () => stop_audio_on_scroll()
});




//three.js
var camera, scene, renderer, loadedSphere01, copy01, copy02, copy03;

var mouseX = 0,
	mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var clock = new THREE.Clock();

init();
animate();


const newColor1 = new THREE.Color("rgb(102, 178, 154)");
const newColor2 = new THREE.Color("rgb(162, 84, 255)");
const newColor3 = new THREE.Color("rgb(99, 180, 255)");
const newColor4 = new THREE.Color("rgb(192, 62, 62)");
const newColor5 = new THREE.Color("rgb(255, 229, 127)");
const newColor6 = new THREE.Color("rgb(114, 125, 255)");
const newColor7 = new THREE.Color("rgb(255, 148, 106)");
const newColor8 = new THREE.Color("rgb(211, 236, 103)");
const newColor9 = new THREE.Color("rgb(236, 103, 103)");
const newColor10 = new THREE.Color("rgb(75, 196, 247)");



var material01 = new THREE.MeshLambertMaterial({
	color: 0x5949ea,
	transparent: true,
	opacity: 1.0
});

var material02 = new THREE.MeshLambertMaterial({
	color: 0xffc960,
	transparent: true,
	opacity: 1.0
});

var material03 = new THREE.MeshLambertMaterial({
	color: 0xfe5d5d,
	transparent: true,
	opacity: 1.0
});


var material04 = new THREE.MeshLambertMaterial({
	color: 0x000000,
	transparent: true,
	opacity: 1.0
});


function init() {
	// basic scene
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});
	var width = window.innerWidth;
	var height = window.innerHeight;

	renderer.setSize(width, height);

	//renderer.setClearColor(0x000000, 0);

	document.getElementById("webgl_wrapper").appendChild(renderer.domElement);

	scene = new THREE.Scene();



	// near = 100;
	//far = 2000;
	// fogColor = '#000000';
	//  scene.fog = new THREE.Fog(fogColor, near, far);
	//  scene.background = new THREE.Color(fogColor);

	camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
	camera.position.y = 0;
	camera.position.z = 150;




	var manager = new THREE.LoadingManager();
	//manager.onProgress = function(item, loaded, total) {

	//console.log(item, loaded, total);

	//};


	var loader = new THREE.OBJLoader(manager);



	loader.load('../obj/half_sphere.obj', function(loadedobject01) {



		loadedobject01.traverse(function(child) {
			if (child instanceof THREE.Mesh) {


				child.material = material01;

			}
		});

		copy01 = loadedobject01.clone();
		copy02 = loadedobject01.clone();
		copy03 = loadedobject01.clone();

		copy01.traverse(function(child) {
			if (child instanceof THREE.Mesh) {


				child.material = material04;

			}
		});


		copy02.traverse(function(child) {
			if (child instanceof THREE.Mesh) {


				child.material = material02;

			}
		});



		copy03.traverse(function(child) {
			if (child instanceof THREE.Mesh) {


				child.material = material03;

			}
		});




		loadedSphere01 = loadedobject01;


		loadedobject01.scale.set(50, 50, 50);
		loadedobject01.position.set(-40, 20, 0);
		loadedobject01.rotation.z = -45;

		copy01.scale.set(50, 50, 50);
		copy01.position.set(-30, -30, 0);


		copy02.scale.set(50, 50, 50);
		copy02.position.set(40, 0, -20);
		copy02.rotation.z = 45;

		copy03.scale.set(50, 50, 50);
		copy03.position.set(0, 0, -10);
		copy03.rotation.x = -60;
		


		scene.add(loadedobject01);

		scene.add(copy01);
		scene.add(copy02);
		scene.add(copy03);

	});

	var dl02 = new THREE.DirectionalLight(0xffffff, 1.0);
	scene.add(dl02);
	dl02.position.set(40, 200, 200);


} /*close init*/



function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
	mouseX = (event.clientX - windowHalfX) / 10;
	mouseY = (event.clientY - windowHalfY) / 10;
}

var windowWidth = window.innerWidth;
if (windowWidth > 540) {
	window.addEventListener('resize', onWindowResize, false);
}

function animate() {
	setTimeout(function() {

		requestAnimationFrame(animate);

	}, 1000 / 25);
	render();
}

function render() {



	var delta = clock.getDelta();

	if (loadedSphere01) loadedSphere01.rotation.y -= 0.5 * delta;
	if (loadedSphere01) loadedSphere01.rotation.z += 0.3 * delta;

	if (copy01) copy01.rotation.z += 0.5 * delta;

	if (copy02) copy02.rotation.y += 0.3 * delta;
	if (copy02) copy02.rotation.z -= 0.4 * delta;

	if (copy03) copy03.rotation.y += 0.5 * delta;
	if (copy03) copy03.rotation.z -= 0.2 * delta;



	document.addEventListener('mousemove', onDocumentMouseMove, false);
	camera.position.x += (mouseX - camera.position.x) / 20;
	camera.position.y += (mouseY - camera.position.y) / 20;



	camera.lookAt(scene.position);


	renderer.render(scene, camera);
}



console.log("%cThanks for stopping by. This site was designed and developed by Richard Sancho in April of 2021. It utilizes Three.js, Tone.js, GSAP and vanilla javascript.", "color:#2700FF");