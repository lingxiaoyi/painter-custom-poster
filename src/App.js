import React from 'react';
import fabric from 'fabric';
import _ from 'lodash';
import optionArr from './optionArr';
import './App.scss';
import { Upload, Button, Icon, Input, message, Select } from 'antd';
//import axios from 'axios';
const { Option } = Select;
const { Dragger } = Upload;
fabric = fabric.fabric;
message.config({
  maxCount: 1
});

//得到当前默认信息
let newOptionArr = _.cloneDeep(optionArr);
newOptionArr[1].css.textStyle = newOptionArr[1].css.textStyle[0];
newOptionArr[1].css.textAlign = newOptionArr[1].css.textAlign[0];
newOptionArr[1].css.textDecoration = newOptionArr[1].css.textDecoration[0];
newOptionArr[1].css.hasBorder = newOptionArr[1].css.hasBorder[0];
newOptionArr[3].css.mode = newOptionArr[3].css.mode[0];
class App extends React.Component {
  constructor(props) {
    super(props);
    this.addShape = this.addShape.bind(this);
    this.generateCode = this.generateCode.bind(this);
    this.state = {};
    this.currentOptionArr = newOptionArr; //当前图像数据集合
    this.views = []; //所有元素的信息
    this.canvas_sprite = ''; //渲图片的canvas对象
    this.shapes = {
      text: [],
      rect: [],
      image: [],
      qrcode: []
    };
    this.height = 300; //固定死
    this.width = 0; //通过实际宽高比计算出来的
  }

  componentDidMount() {
    this.canvas_sprite = new fabric.Canvas('merge');
    let that = this;
    this.canvas_sprite.on('object:moving', function(e) {
      var obj = e.target;
      // if object is too big ignore
      if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
        return;
      }
      obj.setCoords();
      // top-left  corner
      if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
        obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
        obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
      }
      // bot-right corner
      if (
        obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height ||
        obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width
      ) {
        obj.top = Math.min(
          obj.top,
          obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top
        );
        obj.left = Math.min(
          obj.left,
          obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left
        );
      }
      /* let { top, left, width, height } = e.target;
      let { optionArr } = that.state;
      let optionArrIndex = optionArr.findIndex(function(item) {
        return item.text === e.target.text;
      });
      let optionArrNew = JSON.parse(JSON.stringify(optionArr));
      for (let index = 0; index < optionArrIndex; index++) {
        left -= optionArrNew[index].frames * that.width;
      }
      optionArrNew[optionArrIndex] = {
        ...optionArrNew[optionArrIndex],
        textWidth: width,
        textHeight: height,
        left,
        top
      };
      that.setState({
        optionArr: optionArrNew
      }); */
    });
    this.addShape(1);
  }
  async addShape(index) {
    const that = this;
    const currentOptionArr = this.currentOptionArr;
    let { type, css } = currentOptionArr[index];
    let {
      width,
      height,
      text,
      color,
      fontSize,
      left,
      top,
      fontWeight,
      fontFamily,
      padding,
      textDecoration,
      borderRadius,
      borderWidth,
      borderColor,
      background,
      rotate,
      hasBorder,
      align,
      shadow,
      mode
    } = css;
    let Shape;
    switch (type) {
      case 'text':
        let config = {
          width,
          height,
          fill: color,
          //backgroundColor: background,
          fontWeight,
          left, //距离画布左侧的距离，单位是像素
          top, //距离画布上边的距离
          fontSize, //文字大小
          fontFamily,
          padding,
          [textDecoration]: true,
          //lockUniScaling: true, //只能等比缩放
          textAlign: align,
          shadow,
          splitByGrapheme: true, //文字换行
          zIndex:2
        };
        let textBox = new fabric.Textbox(text, config);
        if (hasBorder === 1) {
          let Rect = new fabric.Rect({
            width,
            height,
            left, //距离画布左侧的距离，单位是像素
            top,
            borderRadius,
            strokeWidth: borderWidth,
            stroke: borderColor,
            fill: 'rgba(0,0,0,0)'
          });
          this.canvas_sprite.add(Rect);
          Shape = textBox;
          /* Shape = new fabric.Group([Rect, textBox], {
            left,
            top,
            angle: rotate,
          });
          Shape.on('scaling', function (e) {
            textBox.set({
              fontSize
            })
            that.canvas_sprite.renderAll();
          }) */
        } else {
          Shape = textBox;
        }
        break;
      case 'rect':
        Shape = new fabric.Rect({
          width,
          height,
          left,
          top,
          borderRadius,
          borderWidth,
          borderColor,
          backgroundColor: background,
          align,
          rotate,
          shadow
        });
        break;
      case 'image':
        Shape = await this.loadImageUrl();
        Shape.set({
          width,
          height,
          left,
          top,
          borderRadius,
          borderWidth,
          borderColor,
          backgroundColor: background,
          align,
          rotate,
          mode,
          shadow
        });
        break;
      default:
        break;
    }
    this.shapes[type].push(Shape);
    this.canvas_sprite.add(Shape);
  }
  loadImageUrl() {
    return new Promise(resolve => {
      fabric.Image.fromURL('https://operate.maiyariji.com/20190709%2F3da002983292a6950a71ca7392a21827.jpg', function(
        oImg
      ) {
        resolve(oImg);
      });
    });
  }
  clearCanvas() {
    this.rects.forEach(function(item, i) {
      item.remove();
    });
    this.texts.forEach(function(item, i) {
      item.remove();
    });
  }
  generateCode() {
    let shapes = this.shapes;
    this.views = [];
    Object.keys(shapes).forEach(item => {
      shapes[item].forEach((item2, index) => {
        console.log('shapes[item2]', item2);
        this.views.push(item2);
      });
    });
  }
  render() {
    let that = this;
    const props = {
      name: 'file',
      //multiple: true,
      //action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      onChange(info) {
        const { status } = info.file;
        /* if (status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          console.log('info', info);
          message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        } */
      },
      beforeUpload(file) {
        console.log('file', file);
        var reads = new FileReader();
        reads.οnlοad = function(e) {
          that.result = e.target.result;
          console.log('this.result', e.target.result);
          //that.addShape(3);
        };
        reads.onerror = function(e) {
          console.log('this.result', e);
        };

        reads.readAsDataURL(file);
        return false;
      }
    };
    const currentOptionArr = this.currentOptionArr;
    return (
      <div id='main'>
        <div className='slide'>
          <canvas id='merge' width='700' height='1000' />
        </div>
        <div className='main-container'>
          <div className='box'>
            <Button type='primary' onClick={this.generateCode}>
              生成代码
            </Button>
          </div>
          <div className='option'>
            {optionArr.map((item, i) => {
              if (i === 0) return null;
              return (
                <div key={i} className='option-li'>
                  <div className='row'>
                    <div className='h3'>{item.name} </div>{' '}
                    <div className='btn'>
                      <Button type='primary' onClick={this.addShape.bind(this, i)}>
                        添加
                      </Button>
                    </div>
                  </div>
                  {Object.keys(item.css).map((item2, i2) => {
                    return (
                      <div className='row' key={i2}>
                        <div className='h3'>{item2} </div>
                        {!_.isArray(item.css[item2]) && (
                          <Input
                            //placeholder={item.css[item2]}
                            defaultValue={item.css[item2]}
                            onChange={event => {
                              currentOptionArr[i].css[item2] = event.target.value;
                            }}
                          />
                        )}
                        {_.isArray(item.css[item2]) && (
                          <Select
                            defaultValue={item.css[item2][0]}
                            style={{ width: 120 }}
                            onChange={value => {
                              currentOptionArr[i].css[item2] = value;
                            }}
                          >
                            {item.css[item2].map((item3, i3) => {
                              return (
                                <Option value={item3} key={i3}>
                                  {item3}
                                </Option>
                              );
                            })}
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
