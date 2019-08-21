import React, { Component } from 'react';
import TemperatureInput from './TemperatureInput';
import BoilingVerdict from './BoilingVerdict';
class Calculator extends Component {
  constructor(props) {
    super(props);
    this.handleCelsiusChange = this.handleCelsiusChange.bind(this);
    this.handleFahrenheitChange = this.handleFahrenheitChange.bind(this);
    this.state = {
      temperature: '',
      scale: 'Celsius'
    };
  }

  handleCelsiusChange(value) {
    this.setState({ temperature: value, scale: 'Celsius' });
  }
  handleFahrenheitChange(value) {
    this.setState({ temperature: value, scale: 'Fahrenheit' });
  }
  render() {
    const { temperature, scale } = this.state;
    const Celsius = scale === 'Celsius' ? temperature : tryConvert(temperature, toCelsius);
    const Fahrenheit = scale === 'Fahrenheit' ? temperature : tryConvert(temperature, toFahrenheit);
    return (
      <div>
        <TemperatureInput scale='Celsius' onChange={this.handleCelsiusChange} temperature={Celsius} />
        <TemperatureInput scale='Fahrenheit' onChange={this.handleFahrenheitChange} temperature={Fahrenheit} />
        <BoilingVerdict celsius={Celsius}></BoilingVerdict>
      </div>
    );
  }
}
function toCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}
function tryConvert(temperature, convert) {
  const input = parseFloat(temperature);
  if (Number.isNaN(input)) {
    return '';
  }
  const output = convert(input);
  const rounded = Math.round(output * 1000) / 1000;
  return rounded.toString();
}
export default Calculator;
