'use strict'

const minYear = 2013
const maxYear = 2014
const Chart = require('chart.js')
const _ = require('lodash')

const months = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
]

const selectMinYear = document.querySelector('select#min-year')
const selectMaxYear = document.querySelector('select#max-year')

selectMinYear.addEventListener('change', () => {
  console.log('You clicked min year')
})

selectMaxYear.addEventListener('change', () => {
  console.log('You clicked max year')
})

function getColors () {
  const red = Math.round(Math.random() * 255)
  const green = Math.round(Math.random() * 255)
  const blue = Math.round(Math.random() * 255)
  return red + ', ' + green + ', ' + blue
}

function populateSelection (everyYear) {
  const selectMinYear = document.querySelector('select#min-year')
  const selectMaxYear = document.querySelector('select#max-year')
  everyYear.forEach((year) => {
    const eachMinYear = document.createElement('option')
    eachMinYear.setAttribute('value', year)
    eachMinYear.textContent = year
    selectMinYear.appendChild(eachMinYear)
    const eachMaxYear = document.createElement('option')
    eachMaxYear.setAttribute('value', year)
    eachMaxYear.textContent = year
    selectMaxYear.appendChild(eachMaxYear)
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

fetch('assets/data/rainfall.json')
  .then(res => {
    return res.json()
  })
  .then(rainfall => {
    const annualRainfall = addYearToDataset(rainfall)
    const everyYear = getEveryYear(rainfall)
    populateSelection(everyYear)
    const chartData = {
      labels: months,
      datasets: getDatasets(annualRainfall)
    }
    const ctx = document.querySelector('#chart').getContext('2d')
    const chart = new Chart(ctx)
    chart.Bar(chartData)
  })
  .catch(err => {
    throw err
  })
