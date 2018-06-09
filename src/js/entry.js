// D3 is included by globally by default
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import graphic from './graphic';
import enterView from 'enter-view';
import Stickyfill from 'stickyfilljs';

const $body = d3.select('body');
let previousWidth = 0;

const container = d3.select('#main-content');
const stepSel = container.selectAll('.step');

function updateChart(index, camera) {
    console.log('updateChart' + index)
    const sel = container.select(`[data-index='${index}']`);
    stepSel.classed('is-active', (d, i) => i === index);
    if(index===0) {
        cameraTween(camera, {x:375, y:0, z:0}, {x:0, y:0, z:0}, 1)
	} else if(index===1){
        cameraTween(camera, {x:375, y:0, z:0}, {x:0, y:-Math.PI/2, z:0}, 20)
	} else if(index===2){
        cameraTween(camera, {x:375, y:0, z:0}, {x:-Math.PI/2, y:0, z:0},100)
	}
}

function scrollyTelling(camera) {
    Stickyfill.add(d3.select('.sticky').node());

    enterView({
        selector: stepSel.nodes(),
        offset: 0.5,
        enter: el => {
            const index = +d3.select(el).attr('data-index');
            updateChart(index, camera);
        },
        exit: el => {
            let index = +d3.select(el).attr('data-index');
            index = Math.max(0, index - 1);
            updateChart(index, camera);
        }
    });
}

function resize() {
	// only do resize on width changes, not height
	// (remove the conditional if you want to trigger on height change)
	const width = $body.node().offsetWidth;
	if (previousWidth !== width) {
		previousWidth = width;
		graphic.resize();
	}
}

function init() {
	// add mobile class to body tag
	$body.classed('is-mobile', isMobile.any());
	// setup resize event
	window.addEventListener('resize', debounce(resize, 150));
	// kick off graphic code
	graphic.init();
	graphic.animate();
	let camera = graphic.getCamera();
    scrollyTelling(camera);
    // scrollyTelling(graphic.cameraControl);
}

function cameraTween(camera, pos, rot, zoom){
	console.log(camera.position);
	console.log(camera.rotation);
    new TWEEN.Tween(camera)
        .to({position: pos, rotation: rot, zoom: zoom}, 2000)
        // .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function() {
        	camera.zoom = this.zoom;
        	// camera.position= this.position;
        	// camera.rotation = this.rotation;
        })
        .start();
}
init();
