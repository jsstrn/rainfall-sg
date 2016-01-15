'use strict'
import 'whatwg-fetch'
import Chart from 'chart.js'
import _ from 'lodash'

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
      labels: months,
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

function triggerNotification () {
  if (window.Notification) {
    const details = {
      'body': 'Heavy Rain Warning',
      'icon': 'http://icons.iconarchive.com/icons/icons8/ios7/64/Weather-Rain-icon.png'
    }
    if (window.Notification.permission === 'granted') {
      const notify = new window.Notification('NEA', details)
    } else {
      window.Notification.requestPermission(permission => {
        if (window.Notification.permission === 'granted') {
          const notify = new window.Notification('NEA', details)
        }
      })
    }
  } else {
    console.log('It\'s raining men!')
  }
}

function parseDateTimeString (dateTimeString) {
  let dt = dateTimeString.split('-')
  let date = dt[0]
  date = date.trim()
  date = date.split(' ')
  let time = dt[1]
  time = time.split(' ')
  time = time[1]
  time = time.split(':')

  const y = Number(date[2])
  const m = 0
  const d = Number(date[0])
  const h = Number(time[0])
  const min = Number(time[1])
  const s = 0
  const datetime = new Date(y, m, d, h, min, s)
  return datetime.toISOString()
}

function checkForHeavyRainWarning () {
  fetch('assets/data/heavy_rain_warning.xml')
    .then(res => {
      return res.text()
    })
    .then(heavyRainWarning => {
      const html = document.createElement('html')
      html.innerHTML = heavyRainWarning
      const dateTimeString = html.querySelector('issue_datentime').textContent
      const dateTimeISO = parseDateTimeString(dateTimeString)
      const today = new Date(Date.now())
      const todayISO = today.toISOString()
      if (dateTimeISO >= todayISO) {
        triggerNotification()
      }
    })
    .catch(err => {
      throw err
    })
}

readRainfallData()
checkForHeavyRainWarning()
