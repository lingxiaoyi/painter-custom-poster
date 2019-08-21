import React from 'react';
import fabric from 'fabric';
import _ from 'lodash';
import './App.scss';
import { Upload, Button, Icon, Radio, Input, message, Select } from 'antd';
//import axios from 'axios';
const { Option } = Select;
fabric = fabric.fabric;
message.config({
  maxCount: 1
});
function loadBuffer(file, onload, onerror, onprogress) {
  var fr;
  fr = new FileReader();
  fr.onload = function() {
    onload(this.result);
  };
  fr.onerror = function() {
    if (onerror) {
      onerror(this.error);
    }
  };
  fr.readAsArrayBuffer(file);
}
let commonProps = {
  color: '#000000', //字体颜色 linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)
  bottom: 40, //优先取这个bottom top必须要有一个
  top: 40,
  right: 40, //优先取这个right left必须要有一个
  left: 40,
  width: 10,
  height: 20, //高度,没有的话就自适应
  rotate: 0,
  borderRadius: 50,
  borderWidth: 10,
  borderColor: '#000000',
  align: ['center', 'left', 'right'], //view 的对齐方式
  shadow: '10 10 5 #888888' //阴影
};
class App extends React.Component {
  constructor(props) {
    super(props);
    this.handlerInputChange = this.handlerInputChange.bind(this);
    this.addShape = this.addShape.bind(this);
    this.state = {
      optionArr: [
        {
          type: 'canvas',
          css: {
            width: '654',
            height: '1000',
            background: '#eee'
          }
        },
        {
          type: 'text',
          name: '文字',
          css: {
            ...commonProps,
            text: '我是来测试的',
            background: '#538e60', //文字区域背景色
            fontSize: '30',
            fontWeight: 'bold', //文字加粗 可以不写
            maxLines: '', //最大行数
            lineHeight: '20',
            textStyle: ['fill', 'stroke'], //fill： 填充样式，stroke：镂空样式
            fontFamily: '',
            textAlign: ['center', 'left', 'right'], //文字的对齐方式，分为 left, center, right
            padding: '10',
            textDecoration: ['none', 'overline', 'underline', 'line-through'] //overline underline line-through 可组合
          }
        },
        {
          type: 'rect',
          name: '矩形',
          css: {
            ...commonProps
          }
        },
        {
          type: 'image',
          name: '图片',
          css: {
            ...commonProps,
            mode: ['aspectFill', 'scaleToFill', 'aspectFill']
          }
        },
        {
          type: 'qrcode',
          name: '二维码',
          css: {
            ...commonProps
          }
        }
      ] //初始化数据,initData
    };
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
      let { top, left, width, height } = e.target;
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
      });
    });
  }
  handlerInputChange(file) {
    let that = this;
    if (/gif$/.test(file.type)) {
      loadBuffer(
        file,
        function(buf) {
          var gif;
          gif = new window.Gif();
          gif.onparse = function() {
            setTimeout(function() {
              that.buildView(gif, file.name, true);
            }, 20);
          };
          gif.parse(buf);
        },
        function(e) {
          alert(e);
        }
      );
    } else {
      alert('"' + file.name + '" not GIF');
    }
  }
  buildView(gif, fname, preRender) {
    let canvas_frame = '';
    let context = '';
    let frames = '';
    let canvas_sprite = this.canvas_sprite;
    let that = this;
    canvas_frame = document.createElement('canvas');
    canvas_frame.width = gif.header.width;
    canvas_frame.height = gif.header.height;
    context = canvas_frame.getContext('2d');
    frames = gif.createFrameImages(context, preRender, !preRender);
    canvas_sprite.clear();
    frames.forEach(function(frame, i) {
      let canvas_frame;
      canvas_frame = document.createElement('canvas');
      canvas_frame.width = frame.image.width;
      canvas_frame.height = frame.image.height;
      canvas_frame.getContext('2d').putImageData(frame.image, 0, 0);
      new fabric.Image.fromURL(canvas_frame.toDataURL(), function(img) {
        let width = img.getWidth() * (300 / img.getHeight());
        that.width = width;
        img.set({ selectable: false, fill: '#000000', width: width, height: 300 });
        img.left = img.getWidth() * i;
        canvas_sprite.setHeight(img.getHeight());
        canvas_sprite.setWidth(img.getWidth() * (i + 1)); //画布大小固定成800
        canvas_sprite.add(img);
        //加线进来
        let Line = new fabric.Line([img.getWidth() * i, 0, img.getWidth() * i, img.getHeight()], {
          selectable: false,
          fill: '#000000',
          stroke: 'rgba(0,0,0,0.8)' //笔触颜色
        });
        canvas_sprite.add(Line);
        canvas_sprite.renderAll();

        that.framesLength = frames.length; //图片总帧数
        if (i === frames.length - 1) that.handlerClipPartNum(); //加载为异步,必须在图片加载完成
      });
    });
  }
  //增加矩形 文字到各自的段数上
  renderFramesInit() {
    const { optionArr } = this.state;
    let rects = this.rects;
    let texts = this.texts;
    let canvas_sprite = this.canvas_sprite;
    let left = 0;
    optionArr.forEach((item, i) => {
      let rect = new fabric.Rect({
        left: left, //距离画布左侧的距离，单位是像素
        top: 0, //距离画布上边的距离
        fill: this.bgColorArr[i], //填充的颜色
        width: item.frames * this.width, //方形的宽度
        height: this.height, //方形的高度
        selectable: false
      });
      rects[i] = rect;
      canvas_sprite.add(rect);

      let text = new fabric.Text(item.text, {
        left: left, //距离画布左侧的距离，单位是像素
        top: 0, //距离画布上边的距离
        fontSize: item.fontSize, //文字大小
        lockRotation: true,
        fill: item.fontColor,
        index: i
      });
      texts[i] = text;
      canvas_sprite.add(text);
      left += item.frames * this.width;
    });
  }
  addShape(object) {
    let { type, css } = object;
    let Shape;
    switch (type) {
      case 'text':
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
          borderColor,
          backgroundColor
        } = css;
        console.log('width',width,
        height,);
        let config = {
          width,
          height,
          fill: color,
          backgroundColor,
          fontWeight,
          left, //距离画布左侧的距离，单位是像素
          top, //距离画布上边的距离
          fontSize, //文字大小
          fontFamily,
          lockUniScaling:true, //只能等比缩放
          editingBorderColor: 'blue' // 点击文字进入编辑状态时的边框颜色
          //lockRotation: true
        };
        Shape = new fabric.Textbox(text, config);
        break;

      default:
        break;
    }

    this.shapes[type].push(Shape);
    this.canvas_sprite.add(Shape);
  }
  clearCanvas() {
    this.rects.forEach(function(item, i) {
      item.remove();
    });
    this.texts.forEach(function(item, i) {
      item.remove();
    });
  }
  render() {
    let that = this;
    const props = {
      beforeUpload(file) {
        that.handlerInputChange(file);
      }
    };
    const { optionArr } = this.state;
    return (
      <div id='main'>
        <div className='slide'>
          <canvas id='merge' width='700' height='1000' />
        </div>
        <div className='main-container'>
          <div className='box'>
            <div>
              <Upload {...props}>
                <Button>
                  <Icon type='upload' /> Click to Upload
                </Button>
              </Upload>
            </div>
          </div>
          <div className='option'>
            {optionArr.map((item, i) => {
              if (i === 0) return null;
              return (
                <div key={i} className='option-li'>
                  <div className='row'>
                    <div className='h3'>{item.name} </div>{' '}
                    <div className='btn'>
                      <Button type='primary' onClick={this.addShape.bind(this, item)}>
                        添加
                      </Button>
                    </div>
                  </div>
                  {Object.keys(item.css).map((item2, i2) => {
                    return (
                      <div className='row' key={i2}>
                        <div className='h3'>{item2} </div>
                        {!_.isArray(item.css[item2]) && (
                          <Input placeholder={item.css[item2]} defaultValue={item.css[item2]} value={item.css[item2]} />
                        )}
                        {_.isArray(item.css[item2]) && (
                          <Select
                            defaultValue={item.css[item2][0]}
                            style={{ width: 120 }}
                            onChange={i => {
                              console.log('i', i);
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
