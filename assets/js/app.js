'use strict'
import 'whatwg-fetch'
import Chart from 'chart.js'
import _ from 'lodash'

let minYear = 2013
let maxYear = 2015

const months = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
]

const selectMinYear = document.querySelector('select#min-year')
const selectMaxYear = document.querySelector('select#max-year')

selectMinYear.addEventListener('change', (e) => {
  minYear = e.target.value
  const everyYear = JSON.parse(window.localStorage.getItem('everyYear'))
  populateSelection(everyYear, minYear)
  e.target.value = minYear
})

selectMaxYear.addEventListener('change', (e) => {
  console.log('You clicked max year')
})

function getColors () {
  const red = Math.round(Math.random() * 255)
  const green = Math.round(Math.random() * 255)
  const blue = Math.round(Math.random() * 255)
  return red + ', ' + green + ', ' + blue
}

function populateSelection (everyYear, minYear) {
  const selectMinYear = document.querySelector('select#min-year')
  const selectMaxYear = document.querySelector('select#max-year')
  selectMinYear.innerHTML = ''
  selectMaxYear.innerHTML = ''
  everyYear.forEach((year) => {
    const eachMinYear = document.createElement('option')
    eachMinYear.setAttribute('value', year)
    eachMinYear.textContent = year
    selectMinYear.appendChild(eachMinYear)
    if (year >= minYear) {
      const eachMaxYear = document.createElement('option')
      eachMaxYear.setAttribute('value', year)
      eachMaxYear.textContent = year
      selectMaxYear.appendChild(eachMaxYear)
    }
  })
}

function getYearRange (data) {
  return (data.year >= minYear && data.year <= maxYear)
}

function getEveryYear (rainfall) {
  const everyYear = []
  const years = _.groupBy(rainfall, 'year')
  for (const year in years) {
    everyYear.push(year)
  }
  return everyYear
}

function addYearToDataset (rainfall) {
  rainfall.forEach(monthlyRainfall => {
    const date = monthlyRainfall.month.split('-')
    monthlyRainfall.year = Number(date[0])
    monthlyRainfall.month = Number(date[1])
  })
  return _.groupBy(rainfall.filter(getYearRange), 'year')
}

function getDatasets (annualRainfall) {
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
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(' + getColors() + ' ,1)',
      data: data
    }
    datasets.push(dataset)
  }
  return datasets
}

function getChartData (annualRainfall) {
  return {
    labels: months,
    datasets: getDatasets(annualRainfall)
  }
}

function drawChart (barChartData) {
  const ctx = document.querySelector('#chart').getContext('2d')
  const chart = new Chart(ctx)
  chart.Bar(barChartData)
}

fetch('assets/data/rainfall.json')
  .then(res => {
    return res.json()
  })
  .then(rainfall => {
    const annualRainfall = addYearToDataset(rainfall)
    window.localStorage.setItem('annualRainfall', JSON.stringify(annualRainfall))

    const everyYear = getEveryYear(rainfall)
    window.localStorage.setItem('everyYear', JSON.stringify(everyYear))
    populateSelection(everyYear, 0)

    const barChartData = getChartData(annualRainfall)
    window.localStorage.setItem('barChartData', JSON.stringify(barChartData))

    drawChart(barChartData)
  })
  .catch(err => {
    throw err
  })
