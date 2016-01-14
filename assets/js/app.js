'use strict'
import 'whatwg-fetch'
import Chart from 'chart.js'
import _ from 'lodash'

function getColors () {
  const red = Math.round(Math.random() * 255)
  const green = Math.round(Math.random() * 255)
  const blue = Math.round(Math.random() * 255)
  return red + ', ' + green + ', ' + blue
}

function getDatasets (newRainfallData) {
  const datasets = []
  for (const eachYear in newRainfallData) {
    const listOfMonthlyDataPoints = []
    for (const eachMonth in newRainfallData[eachYear]) {
      listOfMonthlyDataPoints.push(newRainfallData[eachYear][eachMonth].total_rainfall)
    }
    const color = getColors()
    const dataset = {
      label: eachYear,
      fillColor: 'rgba(' + color + ' ,0.2)',
      strokeColor: 'rgba(' + color + ' ,1)',
      pointColor: 'rgba(' + color + ' ,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(' + color + ' ,1)',
      data: listOfMonthlyDataPoints
    }
    datasets.push(dataset)
  }
  return datasets
}

function renderChart (rawRainfallData) {
  const annualRainfall = []
  annualRainfall.push(filterRainfallData(rawRainfallData, 1975, 1985))
  annualRainfall.push(filterRainfallData(rawRainfallData, 1985, 1995))
  annualRainfall.push(filterRainfallData(rawRainfallData, 1995, 2005))
  annualRainfall.push(filterRainfallData(rawRainfallData, 2005, 2015))
  const allCharts = Array.from(document.querySelectorAll('canvas'))
  allCharts.forEach((thisChart, index) => {
    const context = thisChart.getContext('2d')
    const chart = new Chart(context)
    chart.Bar({
      labels: [
        'January', 'February', 'March',
        'April', 'May', 'June',
        'July', 'August', 'September',
        'October', 'November', 'December'
      ],
      datasets: getDatasets(annualRainfall[index])
    })
  })
}

function filterRainfallData (rawRainfallData, minYear, maxYear) {
  function yearRange (element) {
    return (element.year >= minYear && element.year <= maxYear)
  }
  // group by year
  return _.groupBy(rawRainfallData.filter(yearRange), 'year')
}

function parseRainfallData (rawRainfallData) {
  // add years
  rawRainfallData.forEach(monthlyRainfall => {
    const date = monthlyRainfall.month.split('-')
    monthlyRainfall.year = Number(date[0])
    monthlyRainfall.month = Number(date[1])
  })
}

function readRainfallData () {
  fetch('assets/data/rainfall.json')
    .then(res => {
      return res.json()
    })
    .then(rawRainfallData => {
      parseRainfallData(rawRainfallData)
      window.localStorage.setItem('rawRainfallData', JSON.stringify(rawRainfallData))
      renderChart(rawRainfallData)
    })
    .catch(err => {
      throw err
    })
}

readRainfallData()
