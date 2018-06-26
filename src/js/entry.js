// D3 is included by globally by default
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import Graphic from './graphic';
import enterView from 'enter-view';
import Stickyfill from 'stickyfilljs';

const $body = d3.select('body');
let previousWidth = 0;

const container = d3.select('#main-content');
const stepSel = container.selectAll('.step');
const graphic = new Graphic();
// const setTime = function(graphic, t) {
//         new TWEEN.Tween(graphic) //Create a new tween that modifies globe
//             .to({time: t/3},500)
//             .easing(TWEEN.Easing.Cubic.EaseOut)
//             .start();
// };

function updateChart(index, camera) {
    console.log('updateChart' + index)
    const sel = container.select(`[data-index='${index}']`);
    stepSel.classed('is-active', (d, i) => i === index);
    if(index===0) {
        cameraTween(camera, 10000, 10000, 2000, 1)
	} else if(index===1){
        cameraTween(camera, 375, 18, 2000, 20)
	} else if(index===2){
        cameraTween(camera, 375, 8000, 2000, 150)
	} else if(index===3){
        cameraTween(camera, 425, 18, 2000, 200)
    } else if(index===4){
	    setTime(graphic, 0);
    } else if(index===5){
        setTime(graphic, 1);
    }
}



function setTime (graphic, t) {
    let baseMesh = graphic.getBaseMesh();

    new TWEEN.Tween(graphic)
        .to({time: t/3}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function() {
            // console.log(this.time);
            if(baseMesh!= undefined){
                const morphDict = baseMesh.morphTargetDictionary;
                var l = 2; //
                var scaledt = this.time*l+1;
                var index = Math.floor(scaledt);
                for (let i=0;i<l;i++) {
                    baseMesh.morphTargetInfluences[i] = 0;
                }
                var lastIndex = index - 1;
                var leftover = scaledt - index;
                if (lastIndex >= 0) {
                    baseMesh.morphTargetInfluences[lastIndex] = 1 - leftover;
                }
                baseMesh.morphTargetInfluences[index] = leftover;
            }
        })
        .start();
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
}

function cameraTween(camera, x,y,z,zoom){
    new TWEEN.Tween(camera)
        .to({zoom: zoom}, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function() {
        	camera.zoom = this.zoom;
        })
        .start();
    let pos = camera.position;

    new TWEEN.Tween(pos)
        .to({x:x, y:y, z:z}, 2000)
        // .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function() {
            camera.position.x = this.x;
            camera.position.y = this.y;
            camera.position.z = this.z;
        })
        .start();
}
init();
