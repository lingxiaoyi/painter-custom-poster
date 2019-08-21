import React, { Component } from 'react';
import Student from './Student';

function EnhanceWrapper(WrappedComponent) {
  return class WrapperComponent extends Component {
    static wrappedComponentStaic() {
      WrappedComponent.sayHello();
    }
    constructor(props) {
      super(props);
      console.log('WrapperComponent constructor'); // eslint-disable-line
      this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount(...argus) {
      console.log('WrapperComponent componentDidMount'); // eslint-disable-line
      /* if (didMount) {
              didMount.apply(this, argus);
          } */
    }
    handleClick() {
      this.inputElement.focus();
    }
    render() {
      return (
        <div>
          <WrappedComponent
            inputRef={el => {
              this.inputElement = el;
            }}
            {...this.props}
          />
          <input type='button' value='focus子组件input' onClick={this.handleClick} />
          <input type='button' value='调用子组件static' onClick={this.constructor.wrappedComponentStaic} />
        </div>
      );
    }
  };
}

const WrapperComponent = EnhanceWrapper(Student);
export default WrapperComponent;
