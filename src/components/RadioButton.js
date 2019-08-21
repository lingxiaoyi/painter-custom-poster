import React from 'react';

function RadioGroup(props) {
  return (
    <label htmlFor=''>
      {props.children}
      <input defaultChecked={props.checked === props.value} value={props.value} type='radio' name={props.name} onChange={props.onChange}/>
    </label>
  );
}
export default RadioGroup;
