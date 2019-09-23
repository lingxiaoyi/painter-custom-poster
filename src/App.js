import React from 'react';
import fabric from 'fabric';
import _ from 'lodash';
import jrQrcode from 'jr-qrcode';
import { Button, Input, message, Select, Modal, Drawer, Radio } from 'antd';
import copy from 'copy-to-clipboard';
import keydown, { ALL_KEYS } from 'react-keydown';
import ReactMarkdown from 'react-markdown';
import json from 'format-json';
import { optionArr, newOptionArr } from './optionArr';
import './App.scss';
import exampleData from './example/index';
console.log('exampleData', exampleData);
//import importCodeJson from './importCodeJson';
//var FontFaceObserver = require('fontfaceobserver');
const GD = require('./gradient.js');
const { Option } = Select;
const { TextArea } = Input;
fabric = fabric.fabric;
message.config({
  maxCount: 1
});

let QRErrorCorrectLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2
};
let _config = {
  canvasState: [],
  currentStateIndex: -1,
  undoStatus: false,
  redoStatus: false,
  undoFinishedStatus: 1,
  redoFinishedStatus: 1
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.addShape = this.addShape.bind(this);
    this.generateCode = this.generateCode.bind(this);
    this.copyCode = this.copyCode.bind(this);
    this.viewCode = this.viewCode.bind(this);
    this.exportCode = this.exportCode.bind(this);
    this.importCode = this.importCode.bind(this);
    this.handerUndo = this.handerUndo.bind(this);
    this.handerRedo = this.handerRedo.bind(this);
    this.changeActiveObjectValue = this.changeActiveObjectValue.bind(this);
    this.confirmImportCode = this.confirmImportCode.bind(this);
    this.state = {
      redoButtonStatus: '',
      undoButtonStatus: '',
      currentOptionArr: newOptionArr, //当前可设置的数组的值
      currentObjectType: 'text', //当前要添加对象的类型
      importCodeJson: ''
    };
    this.currentOptionArr = newOptionArr; //当前图像数据集合
    this.views = []; //所有元素的信息
    this.canvas_sprite = ''; //渲图片的canvas对象
    this.height = 300; //固定死
    this.width = 0; //通过实际宽高比计算出来的
    this.activeObject = {};
    this.importCodeJson = '' /* importCodeJson */;
  }

  componentDidMount() {
    this.canvas_sprite = new fabric.Canvas('merge', this.state.currentOptionArr[0].css);
    /* var font = new FontFaceObserver('webfont');
    font.load(); */
    //this.confirmImportCode();
    this.addEventListener();
    /* this.addShape(1);
    this.addShape(2);
    this.addShape(3);
    this.addShape(4); */
    /* let canvas = this.canvas_sprite;
    canvas.add(new fabric.Circle({ radius: 30, fill: '#f55', top: 100, left: 100 })); */
    /* let rect = new fabric.Rect({
      width: 200,
      height: 100,
      left: 0,
      top: 0,
      fill: '#000'
    });
    let background = 'linear-gradient(280deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)';
    this.canvas_sprite.add(rect);
    let gradientOption = '';
    if (GD.api.isGradient(background)) {
      gradientOption = GD.api.doGradient(background, 200, 100);
    }

    rect.setGradient('fill', gradientOption); */
  }
  addEventListener() {
    let that = this;
    let throttlechangeActiveObjectValue = _.throttle(that.changeActiveObjectValue, 100);
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

      throttlechangeActiveObjectValue();
    });
    this.canvas_sprite.on('object:scaling', function(e) {
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
      throttlechangeActiveObjectValue();
    });
    this.canvas_sprite.on('mouse:down', function(e) {
      if (e.target) {
        that.activeObject = e.target;
        that.changeActiveObjectValue();
      }
    });
    //解决放大缩小元素位置不对的问题
    this.canvas_sprite.on('object:scaled', function(e) {
      if (e.target) {
        that.activeObject = e.target;
        that.updateObject();
      }
    });
    this.canvas_sprite.on('object:modified', function() {
      that.updateCanvasState();
    });

    this.canvas_sprite.on('object:added', function() {
      that.updateCanvasState();
    });
  }
  @keydown(ALL_KEYS)
  beginEdit(event) {
    let that = this;
    if (that.activeObject) {
      //console.log('that.activeObject', that.activeObject);
      if (event.which === 37) {
        //左
        event.preventDefault();
        that.activeObject.set({
          left: that.activeObject.left - 1
        });
      } else if (event.which === 39) {
        //右
        event.preventDefault();
        that.activeObject.set({
          left: that.activeObject.left + 1
        });
      } else if (event.which === 40) {
        //上
        event.preventDefault();
        that.activeObject.set({
          top: that.activeObject.top + 1
        });
      } else if (event.which === 38) {
        //下
        event.preventDefault();
        that.activeObject.set({
          top: that.activeObject.top - 1
        });
      } else if (event.which === 90) {
        //ctrl+z
        that.handerUndo();
      } else if (event.which === 89) {
        //ctrl+y
        that.handerRedo();
      } else if (event.which === 46) {
        //delete
        this.canvas_sprite.remove(that.activeObject);
      }
      this.changeActiveObjectValue();
      this.canvas_sprite.renderAll();
    }
    //console.log('event', event.which);
    // Start editing
  }
  async addShape(index, action) {
    const currentOptionArr = this.state.currentOptionArr;
    let { type } = currentOptionArr[index];
    let Shape;
    switch (type) {
      case 'text':
        Shape = await this.addTextObject(index, action);
        break;
      case 'rect':
        Shape = await this.addRectObject(index, action);
        break;
      case 'image':
        Shape = await this.addImageObject(index, action);
        break;
      case 'qrcode':
        Shape = await this.addQrcodeObject(index, action);
        break;
      default:
        break;
    }
    this.canvas_sprite.setActiveObject(Shape);
    this.activeObject = Shape;
    this.canvas_sprite.add(Shape);
  }
  async addTextObject(index, action) {
    let currentOptionArr;
    if (action === 'update') {
      currentOptionArr = this.state.currentOptionArr;
    } else {
      currentOptionArr = this.currentOptionArr;
    }
    //console.log('currentOptionArr', currentOptionArr);
    let { css } = currentOptionArr[index];
    let {
      width,
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
      rotate,
      //align,
      shadow,
      lineHeight,
      textAlign,
      maxLines,
      textStyle,
      background
    } = css;
    width = width / 1;
    left = left / 1;
    top = top / 1;
    borderRadius = borderRadius / 1;
    borderWidth = borderWidth / 1;
    rotate = rotate / 1;
    fontSize = fontSize / 1;
    maxLines = maxLines / 1;
    padding = 0 /*  padding / 1 */;
    lineHeight = lineHeight / 1; //和painter调试得出的值
    shadow = shadow
      .trim()
      .split(/\s+/)
      .join(' ');
    let Shape;
    let config = {
      width, //文字的高度随行高
      fill: color,
      fontWeight,
      left: 0, //距离画布左侧的距离，单位是像素
      top: 0,
      fontSize, //文字大小
      fontFamily,
      padding,
      [textDecoration]: true,
      textAlign,
      textStyle,
      shadow,
      myshadow: shadow,
      splitByGrapheme: true, //文字换行
      zIndex: 2,
      lineHeight,
      editable: true,
      maxLines: maxLines,
      textDecoration: textDecoration,
      lockScalingY: true,
      originX: 'center',
      originY: 'center'
    };
    if (textStyle === 'stroke') {
      config = {
        ...config,
        stroke: color,
        fill: 'rgba(0,0,0)'
      };
    }

    let textBox = new fabric.Textbox(text, config);
    textBox.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          maxLines,
          textDecoration,
          textStyle
        });
      };
    })(textBox.toObject);
    //通过最大行高计算高度,并删除多余文字,多出文字..表示,三个会换行
    if (textBox.textLines.length > maxLines) {
      let text = '';
      for (let index = 0; index < maxLines; index++) {
        const element = textBox.textLines[index];
        if (index === maxLines - 1) {
          text = text + element + '...';
        } else {
          text += element;
        }
      }
      textBox.set({
        text
      });
      if (textBox.textLines.length > maxLines) {
        let text = '';
        for (let index = 0; index < maxLines; index++) {
          const element = textBox.textLines[index];
          if (index === maxLines - 1) {
            text = text + element.substring(0, element.length - 3) + '...';
          } else {
            text += element;
          }
        }
        textBox.set({
          text
        });
      }
    }
    let height = textBox.height / 1 + (textBox.lineHeight / 1 - 1) * textBox.fontSize + padding * 2;
    left = css.left - padding + borderWidth;
    top = css.top - padding + borderWidth;
    /*  textBox.set({
      top: top + height / 2
    }); */

    let Rect = new fabric.Rect({
      width: width + borderWidth,
      height: height + borderWidth,
      left: 0, //距离画布左侧的距离，单位是像素
      top: 0,
      originX: 'center',
      originY: 'center',
      //padding,
      rx: borderRadius,
      strokeWidth: borderWidth / 1,
      stroke: borderColor,
      fill: 'rgba(0,0,0,0)',
      shadow,
      selectable: false
    });
    //this.canvas_sprite.add(Rect);
    let gradientOption = '';
    if (GD.api.isGradient(background)) {
      gradientOption = GD.api.doGradient(background, width, height);
    }
    if (gradientOption) Rect.setGradient('fill', gradientOption);
    Shape = new fabric.Group([], {
      width: width + borderWidth,
      height: height + borderWidth,
      left: left + width / 2, //距离画布左侧的距离，单位是像素
      top: top + height / 2,
      angle: rotate,
      mytype: 'textGroup',
      oldText: text,
      originX: 'center',
      originY: 'center',
      rx: borderRadius,
      strokeWidth: borderWidth / 1,
      stroke: borderColor,
      fill: background,
      shadow,
      myshadow: shadow,
      lockScalingY: true
    });
    Shape.add(Rect);
    Shape.add(textBox);

    Shape.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          mytype: 'textGroup',
          oldText: text,
          rx: borderRadius,
          myshadow: shadow
        });
      };
    })(Shape.toObject);
    return Shape;
  }
  async addRectObject(index, action) {
    let currentOptionArr;
    if (action === 'update') {
      currentOptionArr = this.state.currentOptionArr;
    } else {
      currentOptionArr = this.currentOptionArr;
    }
    let { css } = currentOptionArr[index];
    let {
      width,
      height,
      left,
      top,
      borderRadius,
      borderWidth,
      borderColor,
      background,
      rotate,
      //align,
      shadow
    } = css;
    width = width / 1;
    height = height / 1;
    left = left / 1;
    top = top / 1;
    borderRadius = borderRadius / 1;
    borderWidth = borderWidth / 1;
    rotate = rotate / 1;
    shadow = shadow
      .trim()
      .split(/\s+/)
      .join(' ');
    let group = new fabric.Group([], {
      left: left + width / 2 + borderWidth,
      top: top + height / 2 + borderWidth,
      width: width + borderWidth,
      height: height + borderWidth,
      rx: borderRadius / 1,
      strokeWidth: borderWidth / 1,
      stroke: borderColor,
      fill: background,
      originX: 'center',
      originY: 'center',
      angle: rotate,
      myshadow: shadow,
      mytype: 'rect',
      lockUniScaling: true //只能等比缩放
    });
    let gradientOption = '';
    if (GD.api.isGradient(background)) {
      gradientOption = GD.api.doGradient(background, width, height);
    }
    let rect = new fabric.Rect({
      width,
      height,
      left: 0,
      top: 0,
      rx: borderRadius,
      fill: background,
      originX: 'center',
      originY: 'center'
    });
    if (gradientOption) rect.setGradient('fill', gradientOption);
    group.add(rect);
    //添加边框
    group.add(
      new fabric.Rect({
        width: width + borderWidth,
        height: height + borderWidth,
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center',
        //padding,
        rx: borderRadius + borderWidth / 2,
        strokeWidth: borderWidth / 1,
        stroke: borderColor,
        fill: 'rgba(0,0,0,0)',
        shadow,
        selectable: false
      })
    );
    group.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          mytype: 'rect',
          rx: borderRadius + borderWidth / 2,
          myshadow: shadow
        });
      };
    })(group.toObject);
    return group;
  }
  async addImageObject(index, action) {
    let currentOptionArr;
    if (action === 'update') {
      currentOptionArr = this.state.currentOptionArr;
    } else {
      currentOptionArr = this.currentOptionArr;
    }
    let { css } = currentOptionArr[index];
    let {
      width,
      height,
      left,
      top,
      borderRadius,
      borderWidth,
      borderColor,
      background,
      rotate,
      //align,
      shadow,
      mode,
      url
    } = css;
    width = width / 1;
    height = height / 1;
    left = left / 1;
    top = top / 1;
    borderRadius = borderRadius / 1;
    borderWidth = borderWidth / 1;
    rotate = rotate / 1;
    shadow = shadow
      .trim()
      .split(/\s+/)
      .join(' ');
    let Shape = await this.loadImageUrl(url);
    let imgWidth = Shape.width;
    let imgHeight = Shape.height;
    Shape.set({
      url,
      //align,
      mode,
      shadow,
      originX: 'center',
      originY: 'center'
    });
    if (mode === 'scaleToFill') {
      Shape.set({
        width: imgWidth,
        height: imgHeight,
        scaleX: width / imgWidth,
        scaleY: height / imgHeight,
        oldScaleX: width / imgWidth,
        oldScaleY: height / imgHeight
      });
      Shape.clipPath = new fabric.Rect({
        width,
        height,
        originX: 'center',
        originY: 'center',
        rx: borderRadius,
        scaleX: imgWidth / width,
        scaleY: imgHeight / height
      });
    } else if (mode === 'auto') {
      //忽略高度会自适应宽度,等比缩放图片
      Shape.set({
        width: imgWidth,
        height: imgHeight,
        scaleX: width / imgWidth,
        scaleY: width / imgWidth,
        oldScaleX: width / imgWidth,
        oldScaleY: height / imgHeight
      });
      Shape.clipPath = new fabric.Rect({
        width,
        height,
        originX: 'center',
        originY: 'center',
        rx: borderRadius,
        scaleX: imgWidth / width,
        scaleY: imgHeight / height
      });
    } else if (mode === 'aspectFill') {
      Shape.clipPath = new fabric.Rect({
        width: width / 1,
        height: height / 1,
        originX: 'center',
        originY: 'center',
        rx: borderRadius / 1
      });
      Shape.set({
        width,
        height
      });
    }
    let group = new fabric.Group([Shape], {
      left: left + width / 2 + borderWidth,
      top: top + height / 2 + borderWidth,
      width: width + borderWidth,
      height: height + borderWidth,
      rx: borderRadius / 1,
      strokeWidth: borderWidth / 1,
      stroke: borderColor,
      fill: background,
      angle: rotate,
      shadow,
      myshadow: shadow,
      originX: 'center',
      originY: 'center',
      mytype: 'image',
      mode,
      url,
      lockUniScaling: true //只能等比缩放
    });
    //添加边框
    group.add(
      new fabric.Rect({
        width: width + borderWidth,
        height: height + borderWidth,
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center',
        //padding,
        rx: borderRadius + borderWidth / 2,
        strokeWidth: borderWidth / 1,
        stroke: borderColor,
        fill: 'rgba(0,0,0,0)',
        shadow,
        selectable: false
      })
    );
    group.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          mytype: 'image',
          mode,
          url,
          rx: borderRadius + borderWidth / 2,
          oldScaleX: width / imgWidth,
          oldScaleY: height / imgHeight,
          myshadow: shadow
        });
      };
    })(group.toObject);
    //console.log('group', group);
    return group;
  }
  async addQrcodeObject(index, action) {
    let currentOptionArr;
    if (action === 'update') {
      currentOptionArr = this.state.currentOptionArr;
    } else {
      currentOptionArr = this.currentOptionArr;
    }
    let { css } = currentOptionArr[index];
    let {
      width,
      left,
      top,
      color,
      borderRadius,
      //borderWidth,
      //borderColor,
      background,
      rotate,
      url
      //align,
    } = css;
    width = width / 1;
    left = left / 1 + width / 2;
    top = top / 1 + width / 2;
    rotate = rotate / 1;
    let imgBase64 = jrQrcode.getQrBase64(url, {
      padding: 0, // 二维码四边空白（默认为10px）
      width: width / 1, // 二维码图片宽度（默认为256px）
      height: width / 1, // 二维码图片高度（默认为256px）
      correctLevel: QRErrorCorrectLevel.H, // 二维码容错level（默认为高）
      reverse: false, // 反色二维码，二维码颜色为上层容器的背景颜色
      background: background, // 二维码背景颜色（默认白色）
      foreground: color // 二维码颜色（默认黑色）
    });
    let Shape = await this.loadImageUrl(imgBase64);
    Shape.set({
      url,
      width: width / 1,
      height: width / 1,
      left,
      top,
      color,
      background,
      rx: borderRadius / 1,
      //strokeWidth: borderWidth / 1,
      //stroke: borderColor,
      //align,
      angle: rotate / 1,
      lockUniScaling: true, //只能等比缩放
      originX: 'center',
      originY: 'center',
      mytype: 'qrcode'
    });
    Shape.clipPath = new fabric.Rect({
      width,
      height: width / 1,
      originX: 'center',
      originY: 'center',
      rx: borderRadius,
      angle: rotate / 1
    });
    Shape.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          mytype: 'qrcode',
          url,
          color,
          background,
          rx: borderRadius / 1
        });
      };
    })(Shape.toObject);
    return Shape;
  }
  loadImageUrl(imgUrl) {
    return new Promise(resolve => {
      fabric.Image.fromURL(imgUrl, function(oImg) {
        resolve(oImg);
      });
    });
  }
  async updateObject() {
    let type = this.activeObject.mytype;
    this.canvas_sprite.remove(this.activeObject);
    switch (type) {
      case 'textGroup':
        await this.addShape(1, 'update');
        break;
      case 'rect':
        await this.addShape(2, 'update');
        break;
      case 'image':
        await this.addShape(3, 'update');
        break;
      case 'qrcode':
        await this.addShape(4, 'update');
        break;
      default:
        break;
    }
    this.canvas_sprite.renderAll();
  }

  changeActiveObjectValue() {
    this.setState({
      visible: true
    });
    let type = this.activeObject.mytype;
    if (!type) return;
    let item2 = this.activeObject;
    let width = `${(item2.width - item2.strokeWidth) * item2.scaleX}`;
    let height = `${(item2.height - item2.strokeWidth) * item2.scaleY}`;
    let left = `${(item2.left / item2.scaleY - (item2.width - item2.strokeWidth) / 2 - item2.strokeWidth).toFixed(2)}`;
    let top = `${(item2.top / item2.scaleY - (item2.height - item2.strokeWidth) / 2 - item2.strokeWidth).toFixed(2)}`;
    //console.log('item2.strokeWidth', `${item2.shadow}`, item2.scaleY);
    let css = {
      width,
      height,
      left,
      top,
      color: `${item2.color}`,
      background: `${item2.fill}`,
      rotate: `${item2.angle}`,
      borderRadius: `${item2.rx * item2.scaleY}`,
      borderWidth: `${item2.strokeWidth * item2.scaleY}`,
      borderColor: `${item2.stroke}`,
      shadow: `${item2.myshadow}`
    };
    let index = '';
    switch (type) {
      case 'textGroup':
        index = 1;
        item2._objects.forEach(ele => {
          let css2 = {
            text: '',
            width,
            lineHeight: '',
            left,
            top,
            color: `${item2.color}`,
            background: `${item2.fill}`,
            fontSize: '',
            fontWeight: '',
            textDecoration: '',
            rotate: `${item2.angle}`,
            //padding: 0,
            borderRadius: `${item2.rx * item2.scaleY}`,
            borderWidth: `${item2.strokeWidth * item2.scaleY}`,
            borderColor: `${item2.stroke}`,
            shadow: `${item2.shadow}`,
            textStyle: '',
            textAlign: '',
            fontFamily: ''
          };
          if (ele.type === 'rect') {
          } else {
            css = {
              ...css2,
              text: `${item2.oldText}`,
              maxLines: `${ele.maxLines}`,
              lineHeight: `${ele.lineHeight}`,
              color: ele.fill,
              padding: `${ele.padding}`,
              fontSize: `${ele.fontSize}`,
              fontWeight: `${ele.fontWeight}`,
              textStyle: `${ele.textStyle}`,
              textDecoration: `${ele.textDecoration === 'linethrough' ? 'line-through' : ele.textDecoration}`,
              fontFamily: `${ele.fontFamily}`,
              textAlign: `${ele.textAlign}`,
              shadow: `${item2.myshadow}`
            };
          }
        });
        break;
      case 'rect':
        index = 2;
        delete css.color;
        css = {
          ...css,
          shadow: `${item2.myshadow}`
        };
        break;
      case 'image':
        index = 3;
        delete css.color;
        delete css.background;
        css = {
          url: item2.url,
          ...css,
          mode: `${item2.mode}`,
          shadow: `${item2.myshadow}`
        };
        break;
      case 'qrcode':
        index = 4;
        delete css.height;
        delete css.borderWidth;
        delete css.borderColor;
        delete css.shadow;
        css = {
          url: item2.url,
          ...css,
          color: item2.color,
          background: item2.background
        };
        break;
      default:
        break;
    }
    let currentOptionArr = _.cloneDeep(this.state.currentOptionArr);
    //console.log('currentOptionArr', currentOptionArr[index].css);
    currentOptionArr[index].css = css;
    this.setState({
      currentOptionArr
    });
  }
  onClose = () => {
    this.setState({
      visible: false
    });
  };
  generateCode() {
    let canvas_sprite = this.canvas_sprite;
    this.views = [];
    let times = this.currentOptionArr[0].css.times;
    function changeShadowTimes(shadow, times) {
      if (!shadow) return '';
      let arr = shadow.trim().split(/\s+/);
      return `${arr[0] * times} ${arr[1] * times} ${arr[2] * times} ${arr[3]}`;
    }
    canvas_sprite.getObjects().forEach((item2, index) => {
      let view = {};
      let width = item2.width * item2.scaleX * times;
      let height = item2.height * item2.scaleY * times;
      let left = item2.left * times;
      let top = item2.top * times;
      let strokeWidth = item2.strokeWidth * times;

      let css = {
        color: `${item2.color}`,
        background: `${item2.fill}`,
        width: `${width}px`,
        height: `${height}px`,
        top: `${top - height / 2 + strokeWidth / 2}px`,
        left: `${left - width / 2 + strokeWidth / 2}px`,
        rotate: `${item2.angle}`,
        borderRadius: `${item2.rx * item2.scaleY * times}px`,
        borderWidth: `${strokeWidth ? strokeWidth * item2.scaleY + 'px' : ''}`,
        borderColor: `${item2.stroke}`,
        //align: `${item2.align}`,
        shadow: changeShadowTimes(item2.myshadow, times)
      };
      //console.log('canvas_sprite.toObject(item2)', canvas_sprite.toObject(item2));
      //console.log('height', height);
      let type = item2.mytype;
      if (type === 'image') {
        delete css.color;
        delete css.background;
        view = {
          type,
          url: `${item2.url}`,
          css: {
            ...css,
            mode: `${item2.mode}`,
            width: `${(item2.width - item2.strokeWidth) * item2.scaleX * times}px`,
            height: `${(item2.height - item2.strokeWidth) * item2.scaleY * times}px`
          }
        };
      } else if (type === 'qrcode') {
        delete css.borderWidth;
        delete css.borderColor;
        delete css.shadow;
        view = {
          type,
          content: `${item2.url}`,
          css: {
            ...css,
            background: item2.background
          }
        };
      } else if (type === 'textGroup') {
        item2._objects.forEach(ele => {
          if (ele.type === 'rect') {
          } else {
            view = {
              ...view,
              type: 'text',
              text: `${item2.oldText}`,
              css: {
                ...css,
                ...view.css,
                width: `${ele.width * times}px`,
                color: ele.fill,
                padding: `${ele.padding * times}px`,
                fontSize: `${ele.fontSize * times}px`,
                fontWeight: `${ele.fontWeight}`,
                maxLines: `${ele.maxLines}`,
                lineHeight: `${ele.lineHeight * 1.11 * ele.fontSize * times}px`,
                textStyle: `${ele.textStyle}`,
                textDecoration: `${ele.textDecoration === 'linethrough' ? 'line-through' : ele.textDecoration}`,
                fontFamily: `${ele.fontFamily}`,
                textAlign: `${ele.textAlign}`
              }
            };
          }
        });
      } else if (type === 'rect') {
        delete css.color;
        if (item2.strokeWidth === 0) {
          delete css.borderWidth;
          delete css.borderColor;
        }
        view = {
          type,
          css: {
            ...css,
            color: item2.fill,
            width: `${(item2.width - item2.strokeWidth) * item2.scaleX * times}px`,
            height: `${(item2.height - item2.strokeWidth) * item2.scaleY * times}px`
          }
        };
      }
      this.views.push(view);
    });
    this.finallObj = {
      width: `${canvas_sprite.width * times}px`,
      height: `${canvas_sprite.height * times}px`,
      background: canvas_sprite.backgroundColor,
      views: this.views
    };
    this.miniCode = `
    export default class LastMayday {
      palette() {
        return (
${json.plain(this.finallObj).replace(/px/g, 'px')}
        );
      }
    }
    `;
    this.MarkdownCode = `${json.plain(this.finallObj).replace(/px/g, 'px')}`;
    //console.log('finallObj', json.plain(this.finallObj).replace(/px/g, 'rpx'));
  }
  clearCanvas() {
    this.rects.forEach(function(item, i) {
      item.remove();
    });
    this.texts.forEach(function(item, i) {
      item.remove();
    });
  }
  copyCode() {
    this.generateCode();
    if (copy(this.miniCode)) {
      message.success(`复制成功,请赶快去painter粘贴代码查看效果`, 2);
    } else {
      message.error(`复制失败,请重试或者去谷歌浏览器尝试`, 2);
    }
  }
  viewCode() {
    this.generateCode();
    this.setState({
      visibleCode: true
    });
  }
  exportCode() {
    let canvas_sprite = this.canvas_sprite;
    var jsonData = canvas_sprite.toJSON();
    var canvasAsJson = JSON.stringify(jsonData);
    if (copy(/* 'export default' +  */ canvasAsJson)) {
      message.success(`导出成功,请复制查看代码`, 2);
    } else {
      message.error(`复制失败,请重试或者去谷歌浏览器尝试`, 2);
    }
  }
  importCode() {
    this.setState({
      visibleImportCode: true
    });
  }
  confirmImportCode() {
    let canvas_sprite = this.canvas_sprite;
    canvas_sprite.loadFromJSON(this.state.importCodeJson, async () => {
      this.setState({
        visibleImportCode: false
      });
      let Objects = canvas_sprite.getObjects();
      for (let index = 0; index < Objects.length; index++) {
        const element = Objects[index];
        this.activeObject = element;
        this.changeActiveObjectValue();
        await this.updateObject();
      }
      this.setState({
        importCodeJson: ''
      });
      message.success(`画面加载成功`, 2);
    });
  }
  updateCanvasState() {
    let that = this;
    let canvas_sprite = this.canvas_sprite;
    if (_config.undoStatus === false && _config.redoStatus === false) {
      var jsonData = canvas_sprite.toJSON();
      var canvasAsJson = JSON.stringify(jsonData);
      if (_config.currentStateIndex < _config.canvasState.length - 1) {
        var indexToBeInserted = _config.currentStateIndex + 1;
        _config.canvasState[indexToBeInserted] = canvasAsJson;
        var numberOfElementsToRetain = indexToBeInserted + 1;
        _config.canvasState = _config.canvasState.splice(0, numberOfElementsToRetain);
      } else {
        _config.canvasState.push(canvasAsJson);
      }
      _config.currentStateIndex = _config.canvasState.length - 1;
      if (_config.currentStateIndex === _config.canvasState.length - 1 && _config.currentStateIndex !== -1) {
        that.setState({
          redoButtonStatus: 'disabled'
        });
      }
    }
  }
  handerUndo() {
    let that = this;
    let canvas_sprite = this.canvas_sprite;
    if (_config.undoFinishedStatus) {
      if (_config.currentStateIndex === -1) {
        _config.undoStatus = false;
      } else {
        if (_config.canvasState.length >= 1) {
          _config.undoFinishedStatus = 0;
          if (_config.currentStateIndex !== 0) {
            _config.undoStatus = true;
            canvas_sprite.loadFromJSON(_config.canvasState[_config.currentStateIndex - 1], async function() {
              let Objects = canvas_sprite.getObjects();
              for (let index = 0; index < Objects.length; index++) {
                const element = Objects[index];
                that.activeObject = element;
                that.changeActiveObjectValue();
                await that.updateObject();
              }
              canvas_sprite.renderAll();
              _config.undoStatus = false;
              _config.currentStateIndex -= 1;
              that.setState({
                undoButtonStatus: ''
              });
              if (_config.currentStateIndex !== _config.canvasState.length - 1) {
                that.setState({
                  redoButtonStatus: ''
                });
              }
              _config.undoFinishedStatus = 1;
            });
          } else if (_config.currentStateIndex === 0) {
            canvas_sprite.clear();
            _config.undoFinishedStatus = 1;
            that.setState({
              redoButtonStatus: '',
              undoButtonStatus: 'disabled'
            });
            _config.currentStateIndex -= 1;
          }
        }
      }
    }
  }
  handerRedo() {
    let that = this;
    let canvas_sprite = this.canvas_sprite;
    if (_config.redoFinishedStatus) {
      if (_config.currentStateIndex === _config.canvasState.length - 1 && _config.currentStateIndex !== -1) {
        that.setState({
          redoButtonStatus: 'disabled'
        });
      } else {
        if (_config.canvasState.length > _config.currentStateIndex && _config.canvasState.length !== 0) {
          _config.redoFinishedStatus = 0;
          _config.redoStatus = true;
          canvas_sprite.loadFromJSON(_config.canvasState[_config.currentStateIndex + 1], async function() {
            let Objects = canvas_sprite.getObjects();
            for (let index = 0; index < Objects.length; index++) {
              const element = Objects[index];
              that.activeObject = element;
              that.changeActiveObjectValue();
              await that.updateObject();
            }
            canvas_sprite.renderAll();
            _config.redoStatus = false;
            _config.currentStateIndex += 1;
            if (_config.currentStateIndex !== -1) {
              that.setState({
                undoButtonStatus: ''
              });
            }
            _config.redoFinishedStatus = 1;
            if (_config.currentStateIndex === _config.canvasState.length - 1 && _config.currentStateIndex !== -1) {
              that.setState({
                redoButtonStatus: 'disabled'
              });
            }
          });
        }
      }
    }
  }
  render() {
    const { visible, visibleCode, visibleImportCode, currentOptionArr, currentObjectType } = this.state;
    return (
      <div id='main'>
        <div className='slide'>
          <canvas id='merge' width='700' height='1000' />
        </div>
        <div className='main-container'>
          <div className='box'>
            <div className='btns'>
              <div className='btn'>
                <Button type='primary' onClick={this.copyCode}>
                  复制代码
                </Button>
              </div>
              <div className='btn'>
                <Button type='primary' onClick={this.viewCode}>
                  查看代码
                </Button>
              </div>
              <div className='btn'>
                <Button type='primary' onClick={this.exportCode}>
                  导出json
                </Button>
              </div>
              <div className='btn'>
                <Button type='primary' onClick={this.importCode}>
                  导入json
                </Button>
              </div>
            </div>
            <div className='code' />
          </div>
          <div className='option'>
            <div className='box'>
              <div className='btns'>
                <Radio.Group
                  value={currentObjectType}
                  onChange={e => {
                    this.setState({ currentObjectType: e.target.value });
                  }}
                >
                  {optionArr.map((item, i) => {
                    return (
                      <Radio.Button value={item.type} key={i}>
                        {item.name}
                      </Radio.Button>
                    );
                  })}
                </Radio.Group>
              </div>
            </div>
            {optionArr.map((item, i) => {
              if (item.type === currentObjectType) {
                return (
                  <div key={i} className='option-li'>
                    <div className='row'>
                      <div className='h3'>{item.name} </div>
                      {item.type !== 'canvas' && (
                        <div className='btn'>
                          <Button type='primary' onClick={this.addShape.bind(this, i)}>
                            添加
                          </Button>
                        </div>
                      )}
                    </div>
                    {Object.keys(item.css).map((item2, i2) => {
                      return (
                        <div className='row' key={i2}>
                          <div className='h3'>{item2} </div>
                          {!_.isArray(item.css[item2]) && (
                            <Input
                              defaultValue={item.css[item2]}
                              onChange={event => {
                                this.currentOptionArr[i].css[item2] = event.target.value;
                                if (item.type === 'canvas') {
                                  if (item2 === 'width') {
                                    this.canvas_sprite.setWidth(event.target.value);
                                  } else if (item2 === 'height') {
                                    this.canvas_sprite.setHeight(event.target.value);
                                  } else if (item2 === 'backgroundColor') {
                                    this.canvas_sprite.setBackgroundColor(event.target.value);
                                    this.canvas_sprite.renderAll();
                                  } else if (item2 === 'times') {
                                    this.currentOptionArr[i].css[item2] = event.target.value;
                                  }
                                }
                              }}
                            />
                          )}
                          {_.isArray(item.css[item2]) && (
                            <Select
                              defaultValue={item.css[item2][0]}
                              style={{ width: 120 }}
                              onChange={value => {
                                this.currentOptionArr[i].css[item2] = value;
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
              }
            })}
          </div>
        </div>
        <div className='example'>
          {exampleData.map((item, i) => {
            //console.log('item', item);
            return (
              <div
                className='li'
                key={i}
                onClick={() => {
                  let that = this;
                  Modal.confirm({
                    title: '提示',
                    content: '确定要导入这个模板吗?',
                    okText: '确认',
                    cancelText: '取消',
                    onOk() {
                      that.setState(
                        {
                          importCodeJson: item.json
                        },
                        that.confirmImportCode
                      );
                    },
                    onCancel() {}
                  });
                }}
              >
                <img src={item.src} alt='' />
              </div>
            );
          })}
        </div>
        <Drawer
          title='修改当前激活对象'
          width={400}
          onClose={this.onClose}
          visible={visible}
          mask={false}
          placement='right'
        >
          <div className='option option-drawer'>
            {currentOptionArr.map((item, i) => {
              let type = this.activeObject.mytype;
              if (type === 'textGroup') {
                type = 'text';
              }
              if (item.type === type) {
                return (
                  <div key={i} className='option-li'>
                    <div className='row'>
                      <div className='h3'>当前{item.name} </div>
                    </div>
                    {Object.keys(item.css).map((item2, i2) => {
                      return (
                        <div className='row' key={i2}>
                          <div className='h3'>{item2} </div>
                          {!_.isArray(optionArr[i].css[item2]) && (
                            <Input
                              defaultValue={item.css[item2]}
                              value={item.css[item2]}
                              onChange={event => {
                                let currentOptionArr = _.cloneDeep(this.state.currentOptionArr);
                                currentOptionArr[i].css[item2] = event.target.value;
                                this.setState(
                                  {
                                    currentOptionArr
                                  },
                                  () => {
                                    this.updateObject();
                                  }
                                );
                              }}
                            />
                          )}
                          {_.isArray(optionArr[i].css[item2]) && (
                            <Select
                              defaultValue={item.css[item2]}
                              value={item.css[item2]}
                              style={{ width: 120 }}
                              onChange={value => {
                                let currentOptionArr = _.cloneDeep(this.state.currentOptionArr);
                                currentOptionArr[i].css[item2] = value;
                                this.setState(
                                  {
                                    currentOptionArr
                                  },
                                  () => {
                                    this.updateObject();
                                  }
                                );
                              }}
                            >
                              {optionArr[i].css[item2].map((item3, i3) => {
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
              }
            })}
          </div>
        </Drawer>
        <Modal
          title='view code'
          visible={visibleCode}
          onCancel={() => {
            this.setState({
              visibleCode: false
            });
          }}
          footer={[
            <Button key='submit' type='primary' onClick={this.copyCode}>
              复制代码
            </Button>
          ]}
        >
          <ReactMarkdown
            source={`\`\`\`
${this.MarkdownCode}
          `}
          />
        </Modal>
        <Modal
          title='导入代码'
          visible={visibleImportCode}
          onCancel={() => {
            this.setState({
              visibleImportCode: false
            });
          }}
          footer={[
            <Button key='submit' type='primary' onClick={this.confirmImportCode}>
              确定
            </Button>
          ]}
        >
          <TextArea
            placeholder='请将代码复制进来'
            value={this.state.importCodeJson}
            autosize={{ minRows: 10, maxRows: 6 }}
            onChange={e => {
              this.setState({
                importCodeJson: e.target.value
              });
              //this.importCodeJson = e.target.value;
            }}
          />
        </Modal>
      </div>
    );
  }
}
export default App;
