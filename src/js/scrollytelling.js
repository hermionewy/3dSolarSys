// D3 is included by globally by default
// import enterView from 'enter-view';
// import Stickyfill from 'stickyfilljs';


console.log('scrollytelling works!')
const container = d3.select('#main-content');
const stepSel = container.selectAll('.step');

function updateChart(index) {
    console.log('updateChart' + index)
    const sel = container.select(`[data-index='${index}']`);
    stepSel.classed('is-active', (d, i) => i === index);
}

function init() {
    Stickyfill.add(d3.select('.sticky').node());

    enterView({
        selector: stepSel.nodes(),
        offset: 0.5,
        enter: el => {
            const index = +d3.select(el).attr('data-index');
            updateChart(index);
        },
        exit: el => {
            let index = +d3.select(el).attr('data-index');
            index = Math.max(0, index - 1);
            updateChart(index);
        }
    });
}

export default { init };
