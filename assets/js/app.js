'use strict'

const Chart = require('chart.js')
const _ = require('lodash')
const fetch = require('whatwg-fetch')
const months = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
]

function getColors () {
  const red = Math.round(Math.random() * 255)
  const green = Math.round(Math.random() * 255)
  const blue = Math.round(Math.random() * 255)
  return red + ', ' + green + ', ' + blue
}

const minYear = 1975
const maxYear = 2015
function range (data) {
  return (data.year >= minYear && data.year <= maxYear)
}

fetch('assets/data/rainfall.json')
  .then(res => {
    return res.json()
  })
  .then(rainfall => {
    rainfall.forEach(monthlyRainfall => {
      const date = monthlyRainfall.month.split('-')
      monthlyRainfall.year = Number(date[0])
      monthlyRainfall.month = Number(date[1])
    })
    const annualRainfall = _.groupBy(rainfall.filter(range), 'year')

    function getDatasets () {
      const datasets = []
      for (const byYear in annualRainfall) {
        const label = byYear
        const data = []
        for (const byMonth in annualRainfall[byYear]) {
          data.push(annualRainfall[byYear][byMonth].total_rainfall)
        }
        const dataset = {
          label: label,
          fillColor: 'rgba(' + getColors() + ' ,0.2)',
          strokeColor: 'rgba(' + getColors() + ' ,1)',
          pointColor: 'rgba(' + getColors() + ' ,1)',
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: 'rgba(' + getColors() + ' ,1)',
          data: data
        }
        datasets.push(dataset)
      }
      return datasets
    } // getDataset()
    const myData = {
      labels: months,
      datasets: getDatasets()
    }
    const ctx = document.querySelector('#chart').getContext('2d')
    const chart = new Chart(ctx).Bar(myData)
  })
  .catch(err => {
    throw err
  })
