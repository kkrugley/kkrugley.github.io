window.addEventListener("pageshow", function() {
	var tl = gsap.timeline({});
	tl.to("html", 1.0, {
		autoAlpha: 1,
		ease: Power4.easeOut
	}).staggerFromTo(".stagger", 1.0, {
		y: '200',
		skewY: 5,
		autoAlpha: 0
	}, {
		y: '0',
		skewY: 0,
		autoAlpha: 1,
		ease: Power4.easeOut
	}, 0.3, "-=0.5").fromTo(".back_to_main", 1.0, {
		autoAlpha: 0,
		scale: 0.8
	}, {
		autoAlpha: 1,
		scale: 1.0,
		ease: Power4.easeOut
	});
	tl.play();
	setTimeout(function() {
		[...document.querySelectorAll('video')].forEach(function(item) {
			var playVideo = function() {
				item.play();
			};
			var stopVideo = function() {
				item.pause();
			};
			ScrollTrigger.create({
				trigger: item,
				start: "center center",
				onEnter: () => playVideo()
			});
			ScrollTrigger.create({
				trigger: item,
				start: "center center",
				onEnterBack: () => playVideo()
			});
			ScrollTrigger.create({
				trigger: item,
				start: "top bottom",
				onLeaveBack: () => stopVideo()
			});
			ScrollTrigger.create({
				trigger: item,
				start: "top bottom",
				onLeave: () => stopVideo()
			});
		});
	}, 1000);
	setTimeout(function() {
		ScrollTrigger.refresh();
	}, 1200);
});
let rotate_back_tl = gsap.timeline({
	scrollTrigger: {
		trigger: "html",
		start: "top top",
		duration: "100%",
		scrub: 1
	}
});
var workpage_back = document.querySelector('.back_button');
workpage_back.addEventListener('click', function() {
	var tl_transition02 = gsap.timeline();
	tl_transition02.fromTo("html", 0.5, {
		autoAlpha: 1
	}, {
		autoAlpha: 0,
		ease: Power2.easeInOut
	});
	tl_transition02.timeScale(0.5);
	tl_transition02.play();
	setTimeout(function() {
		window.location.href = 'index.html';
	}, 1000);
});
if (workpage_back.classList.contains("info_back_button")) {
	gsap.fromTo(".info_back_button", 30, {
		rotation: 0
	}, {
		rotation: 360,
		repeat: -1,
		ease: Power0.easeNone
	});
} else {
	rotate_back_tl.fromTo(".back_button", {
		rotation: 0
	}, {
		rotation: 360
	});
}
[...document.querySelectorAll('.underline_trigger')].forEach(function(item) {
	var this_underline = item.querySelector('.underline');
	item.addEventListener("mouseover", function() {
		gsap.to(this_underline, 0.4, {
			width: "100%",
			ease: Power4.easeOut,
			overwrite: true
		});
	});
	item.addEventListener("mouseleave", function() {
		gsap.to(this_underline, 0.4, {
			width: "0%",
			ease: Power4.easeOut,
			overwrite: true
		});
	});
});
[...document.querySelectorAll('.stagger_body_trigger')].forEach(function(item) {
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
});

if ("ontouchstart" in document.documentElement)
{
	
	
	var mobile_mute_button_container = document.getElementsByClassName('mobile_mute_button_container');
var videoContainerArray = [...mobile_mute_button_container];

		if (mobile_mute_button_container != null) {
			
			videoContainerArray.forEach(function(item) {
var video = item.querySelector('video'),
  button = item.querySelector('.unmute_button'),
  mute = item.querySelector('.mute'),
  unmute = item.querySelector('.unmute');
  video.muted = true;
  button.addEventListener('click', function() {
    button.classList.toggle('muted');
    if (video.muted === true) {
      video.muted = false;
	  		gsap.to(unmute, 0.4, {autoAlpha:0,ease: Power4.easeOut,overwrite: true});
			gsap.to(mute, 0.4, {autoAlpha:1,ease: Power4.easeOut,overwrite: true});
    }
    else if (video.muted === false) {
      video.muted = true;
	  gsap.to(unmute, 0.4, {autoAlpha:1,ease: Power4.easeOut,overwrite: true});
			gsap.to(mute, 0.4, {autoAlpha:0,ease: Power4.easeOut,overwrite: true});
    }
  });
					
	 });		
} /*close if mobile_mute_button_container class exists*/


	
	} else /*if touchstart else*/ {
		
		var mobile_audio = document.querySelector('.mobile_audio');
		if (mobile_audio != null) {
			
			[...document.querySelectorAll('.mobile_audio')].forEach(function(item) {
  item.muted = !item.muted;
  });
					
			
} /*close if mobile_audio class exists*/







		

		
	} /*close if not touch device*/
	
	
	
	
console.log("%cThanks for stopping by. This site was designed and developed by Richard Sancho in April of 2021. It utilizes Three.js, Tone.js, GSAP and vanilla javascript.", "color:#2700FF");