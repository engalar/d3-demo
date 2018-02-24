import data from './data';

import {scaleTime, scaleLinear} from 'd3-scale';
import {histogram, max} from 'd3-array';
import {timeParse} from 'd3-time-format';
import {format} from 'd3-format';
import {select} from 'd3-selection';
import {csvParse} from 'd3-dsv';
import {timeWeek} from 'd3-time';
import {axisBottom} from 'd3-axis';

let parseDate = timeParse("%m/%d/%Y %H:%M:%S %p"),
    formatCount = format(",.0f");

const margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const x = scaleTime()
    .domain([new Date(2015, 0, 1), new Date(2016, 0, 1)])
    .rangeRound([0, width]);

const y = scaleLinear()
    .range([height, 0]);

const histogramScale = histogram()
    .value(function (d) {
        return d.date;
    })
    .domain(x.domain())
    .thresholds(x.ticks(timeWeek));

const svg = select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x));

function render(data) {
    const bins = histogramScale(data);

    y.domain([0, max(bins, function (d) {
        return d.length;
    })]);

    const bar = svg.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", function (d) {
            return x(d.x1) - x(d.x0) - 1;
        })
        .attr("height", function (d) {
            return height - y(d.length);
        });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", function (d) {
            return (x(d.x1) - x(d.x0)) / 2;
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
            return formatCount(d.length);
        });
}

function type(d) {
    d.date = parseDate(d.date);
    return d;
}

render(csvParse(data, type));