import React from 'react';
class RadioGroup extends React.Component {
  constructor() {
    super();
    this.renderChildren = this.renderChildren.bind(this);
  }
  renderChildren() {
    return React.Children.map(this.props.children, child=>{
      return React.cloneElement(child, {
        checked: this.props.checked,
        name: this.props.name,
        onChange: this.props.onChange
      })
    })
  }
  render () {
    return (
      <div className="group">
        {this.renderChildren()}
      </div>
    );
  }
}
export default RadioGroup;