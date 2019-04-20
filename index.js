
/* Dimension for the choropleths */
let cWidth = 1600;
let cHeight = 40;
let cMargin = {top:10, bottom:20, right:0, left:0};
let cFWidth = cWidth + cMargin.left + cMargin.right;
let cFHeight = cHeight + cMargin.top + cMargin.bottom;

/* Dimension for the bar charts */

let bWidth = 900;
let bHeight = 200;
let bMargin = {top:50, bottom:20, right:10, left:40};
let bFWidth = bWidth + bMargin.left + bMargin.right;
let bFHeight = bHeight + bMargin.top + bMargin.bottom;

let rWidth = 100;
let rSpacing = 20;

d3.csv("Admission_Predict.csv").then(data => {
  cleanData(data);
  drawIndividual(data);
});

/*
Converts the data from string to int and float as necessary and sorts the
rows by ascending values of chance of admission.
*/
function cleanData(data) {
  // convert from string to appropriate types
  data.forEach(d => {
    d[data.columns[0]] = parseInt(d[data.columns[0]]);
    d[data.columns[1]] = parseInt(d[data.columns[1]]);
    d[data.columns[2]] = parseInt(d[data.columns[2]]);
    d[data.columns[3]] = parseInt(d[data.columns[3]]);
    d[data.columns[4]] = parseFloat(d[data.columns[4]]);
    d[data.columns[5]] = parseFloat(d[data.columns[5]]);
    d[data.columns[6]] = parseFloat(d[data.columns[6]]);
    d[data.columns[7]] = parseInt(d[data.columns[7]]);
    d[data.columns[8]] = parseFloat(d[data.columns[8]]);
  });

  // sort the data by ascending values of chance of admission
  data.sort((a,b) => a[data.columns[8]] - b[data.columns[8]]);
}

const indieBarYScales = [];

function drawIndividual(data) {

  let indieBarSvg = d3.select("#individual-bar")
                      .append("svg")
                        .attr("width", bFWidth)
                        .attr("height", bFHeight);

  for(let i=1; i<8; i++) {
    let maxVal = d3.max(data.map(d=>d[data.columns[i]]));
    let barYscale = d3.scaleLinear()
                        .domain([0, maxVal])
                        .range([0, bHeight]);
    indieBarYScales.push(barYscale);
  }

  let xBScale = d3.scaleLinear()
                  .domain([0, 1])
                  .range([0, bWidth]);

  let yBScale = d3.scaleLinear()
                  .domain([0, 1])
                  .range([bHeight, 0]);

  indieBarSvg.append("g")
       .attr("transform", `translate(${bMargin.left}, ${bHeight + bMargin.top})`)
       .call(d3.axisBottom(xBScale).ticks(0));

  indieBarSvg.append("g")
       .attr("transform", `translate(${bMargin.left}, ${bMargin.top})`)
       .call(d3.axisLeft(yBScale).ticks(0));

  let indieBars = indieBarSvg.append("g")
                              .attr("id", "bar-group")
                              .attr("transform", `translate(${bMargin.left}, ${bMargin.top})`);

  let indieTexts = indieBarSvg.append("g")
                                .attr("id", "text-group")
                                .attr("transform", `translate(${bMargin.left}, ${bMargin.top})`);

  // Draw labels

  let indieLabels = indieBarSvg.append("g")
                              .attr("transform", `translate(${bMargin.left}, 20)`);

  let labels = indieLabels.selectAll("text")
                 .data(data.columns.slice(1,8));

  labels.enter()
      .append("text")
        .attr("x", (d, i) => rSpacing + i*(rWidth + rSpacing))
      .merge(labels)
        .transition()
          .attr("y", (d,i) => 0)
          .text(d => d)

  drawBarChart(data[0]);

  let indieColor = d3.interpolateGreens
  let xiScale = d3.scaleLinear()
                    .domain([0, data.length])
                    .range([0, cWidth]);

  let indieSvg = d3.select("#individual-choropleth")
                   .append("svg")
                   .attr("height", cFHeight)
                   .attr("width", cFWidth);

  let rectWidth = cWidth/data.length;

  let indieChoro = indieSvg.append("g")
                           .selectAll("rect")
                           .data(data)
                           .enter()
                           .append("rect")
                             .attr("id", d=> "individual-" + d[data.columns[0]])
                             .attr("class", "indie-rect")
                             .attr("x", (d,i) => xiScale(i))
                             .attr("y", cMargin.top)
                             .attr("height", cHeight)
                             .attr("width", rectWidth)
                             .attr("fill", d => indieColor(d[data.columns[8]]))
                             .on("mouseover",d => {
                                drawBarChart(d, indieBarYScales, indieBarSvg, indieTexts);
                                d3.select("#individual-" + d[data.columns[0]])
                                  .attr("height", cHeight*1.3);
                              })
                             .on("mouseout",d => {
                                d3.select("#individual-" + d[data.columns[0]])
                                      .attr("height", cHeight);
                               });

}

function drawBarChart(datum) {
  let bars = d3.select("#bar-group");
  let textGroup = d3.select("#text-group");
  let columns = Object.keys(datum);

  let values = Object.values(datum).slice(1, 8);

  let rects = bars.selectAll("rect")
     .data(values);

  // let textGroup = svg.select("#value-texts");

  let texts = textGroup.selectAll("text")
                 .data(values)

  texts.enter()
      .append("text")
        .attr("x", (d, i) => rSpacing + i*(rWidth + rSpacing))
      .merge(texts)
        .transition()
          .attr("y", (d,i) => bHeight - indieBarYScales[i](d) - 10)
          .text(d => d)

  rects.enter()
       .append("rect")
          .attr("x", (d, i) => rSpacing + i*(rWidth + rSpacing))
          .attr("width", d => rWidth)
       .merge(rects)
          .transition()
          .attr("y", (d,i) => bHeight - indieBarYScales[i](d))
          .attr("height", (d, i) => indieBarYScales[i](d));

  d3.select(".card-title").text(datum[columns[8]]);
}
