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
import importCodeJson from './importCodeJson';
var FontFaceObserver = require('fontfaceobserver');
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
    this.handerEditObject = this.handerEditObject.bind(this);
    this.confirmImportCode = this.confirmImportCode.bind(this);
    this.state = {
      redoButtonStatus: '',
      undoButtonStatus: '',
      currentOptionArr: newOptionArr, //当前可设置的数组的值
      currentObjectType: 'text'
    };
    this.currentOptionArr = newOptionArr; //当前图像数据集合
    this.views = []; //所有元素的信息
    this.canvas_sprite = ''; //渲图片的canvas对象
    this.height = 300; //固定死
    this.width = 0; //通过实际宽高比计算出来的
    this.activeObject = {};
    this.importCodeJson = importCodeJson;
  }

  componentDidMount() {
    this.canvas_sprite = new fabric.Canvas('merge', this.state.currentOptionArr[0].css);
    let that = this;
    let throttleHanderEditObject = _.throttle(that.handerEditObject, 100);
    var font = new FontFaceObserver('webfont');
    font.load();
    this.confirmImportCode();
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

      throttleHanderEditObject();
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
      throttleHanderEditObject();
    });
    this.canvas_sprite.on('mouse:down', function(e) {
      if (e.target) {
        that.activeObject = e.target;
        that.handerEditObject();
      }
    });
    this.canvas_sprite.on('object:modified', function() {
      that.updateCanvasState();
    });

    this.canvas_sprite.on('object:added', function() {
      that.updateCanvasState();
    });
    this.addShape(1);
    /* this.addShape(2);
    this.addShape(3);
    this.addShape(4); */
    /* let canvas = this.canvas_sprite;
    canvas.add(new fabric.Circle({ radius: 30, fill: '#f55', top: 100, left: 100 })); */
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
        event.preventDefault();
        that.handerUndo();
      } else if (event.which === 89) {
        //ctrl+y
        event.preventDefault();
        that.handerRedo();
      } else if (event.which === 46) {
        //delete
        event.preventDefault();
        this.canvas_sprite.remove(that.activeObject);
      }
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
    const that = this;
    let currentOptionArr;
    if (action === 'update') {
      currentOptionArr = this.state.currentOptionArr;
    } else {
      currentOptionArr = this.currentOptionArr;
    }
    console.log('currentOptionArr', currentOptionArr);
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
    padding = padding / 1;
    lineHeight = lineHeight / 1.08; //和painter调试得出的值
    let Shape;
    let config = {
      width, //文字的高度随行高
      fill: color,
      fontWeight,
      left: left, //距离画布左侧的距离，单位是像素
      top: top,
      fontSize, //文字大小
      fontFamily,
      padding,
      [textDecoration]: true,
      //lockUniScaling: true, //只能等比缩放
      textAlign,
      textStyle,
      shadow,
      angle: rotate,
      splitByGrapheme: true, //文字换行
      zIndex: 2,
      lineHeight,
      editable: true,
      maxLines: maxLines,
      textDecoration: textDecoration,
      lockScalingY: true
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
    let height = textBox.height / 1 + (textBox.lineHeight / 1 - 1) * textBox.fontSize + padding * 2 + borderWidth * 2;
    width = textBox.width + padding * 2 + borderWidth * 2;
    left = textBox.left - padding;
    top = css.top - padding;
    /*  textBox.set({
      top: top + height / 2
    }); */
    let Rect = new fabric.Rect({
      width,
      height,
      left, //距离画布左侧的距离，单位是像素
      top,
      padding,
      rx: borderRadius,
      //ry:borderRadius,
      strokeWidth: borderWidth / 1,
      stroke: borderColor,
      fill: background,
      angle: rotate,
      shadow,
      selectable: false
    });
    Shape = new fabric.Group([Rect, textBox], {
      width,
      height,
      left: left + width / 2, //距离画布左侧的距离，单位是像素
      top: top + height / 2,
      angle: rotate,
      mytype: 'textGroup',
      lockScalingY: true,
      oldText: text,
      originX: 'center',
      originY: 'center',
      centeredRotation: true
    });
    Shape.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          mytype: 'textGroup',
          oldText: text
        });
      };
    })(Shape.toObject);
    Shape.on('scaling', function(e) {
      let obj = this;
      let width = obj.width;
      let height = obj.height;
      let w = obj.width * obj.scaleX;
      let h = obj.height * obj.scaleY;
      let oldText = obj.oldText;
      Rect.set({
        left: -(w - width / 2),
        top: -(h - height / 2),
        height: h,
        width: w,
        rx: borderRadius,
        strokeWidth: borderWidth
      });
      textBox.set({
        left: -(w - width / 2),
        top: -(h - height / 2),
        width,
        height,
        fontSize,
        scaleX: 1,
        scaleY: 1,
        text: oldText
      });
      //控制行内文字
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
      obj.set({
        height: h,
        width: w,
        scaleX: 1,
        scaleY: 1,
        originX: 'center'
      });

      that.canvas_sprite.renderAll();
    });
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
    left = left / 1 + width / 2;
    top = top / 1 + height / 2;
    borderRadius = borderRadius / 1;
    borderWidth = borderWidth / 1;
    rotate = rotate / 1;
    let config = {
      width,
      height,
      left,
      top,
      rx: borderRadius,
      //ry:borderRadius,
      strokeWidth: borderWidth,
      stroke: borderColor,
      fill: background,
      //align,
      angle: rotate,
      shadow,
      originX: 'center',
      originY: 'center',
      mytype: 'rect'
    };
    let Shape = new fabric.Rect(config);
    Shape.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          mytype: 'rect'
        });
      };
    })(Shape.toObject);
    return Shape;
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
    left = left / 1 + width / 2;
    top = top / 1 + height / 2;
    borderRadius = borderRadius / 1;
    borderWidth = borderWidth / 1;
    rotate = rotate / 1;

    let Shape = await this.loadImageUrl(url);
    let imgWidth = Shape.width;
    let imgHeight = Shape.height;

    Shape.set({
      url,
      left,
      top,
      rx: borderRadius / 1,
      ry: borderRadius / 1,
      strokeWidth: borderWidth / 1,
      stroke: borderColor,
      backgroundColor: background,
      //align,
      angle: rotate / 1,
      mode,
      shadow,
      originX: 'center',
      originY: 'center',
      mytype: 'image'
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
        angle: rotate / 1,
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
        angle: rotate / 1,
        scaleX: imgWidth / width,
        scaleY: imgHeight / height
      });
    } else if (mode === 'aspectFill') {
      Shape.clipPath = new fabric.Rect({
        width: width / 1,
        height: height / 1,
        originX: 'center',
        originY: 'center',
        rx: borderRadius / 1,
        angle: rotate / 1
      });
      Shape.set({
        width,
        height
      });
    }

    Shape.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          mytype: 'image',
          mode,
          url,
          rx: borderRadius / 1,
          oldScaleX: width / imgWidth,
          oldScaleY: height / imgHeight
        });
      };
    })(Shape.toObject);
    return Shape;
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
      borderWidth,
      borderColor,
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
      strokeWidth: borderWidth / 1,
      stroke: borderColor,
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
          background
        });
      };
    })(Shape.toObject);
    return Shape;
  }
  loadImageUrl(imgUrl) {
    return new Promise(resolve => {
      fabric.Image.fromURL(imgUrl, function(oImg) {
        //console.log('Shape', oImg);
        resolve(oImg);
      });
    });
  }
  updateObject() {
    let type = this.activeObject.mytype;
    this.canvas_sprite.remove(this.activeObject);
    switch (type) {
      case 'textGroup':
        this.addShape(1, 'update');
        break;
      case 'rect':
        this.addShape(2, 'update');
        break;
      case 'image':
        this.addShape(3, 'update');
        break;
      case 'qrcode':
        this.addShape(4, 'update');
        break;
      default:
        break;
    }
    this.canvas_sprite.renderAll();
  }

  handerEditObject() {
    this.setState({
      visible: true
    });
    let type = this.activeObject.mytype;
    let item2 = this.activeObject;
    let oldScaleY = item2.oldScaleY || 1;
    let css = {
      color: `${item2.color}`,
      background: `${item2.fill}`,
      width: `${item2.width * item2.scaleX}`,
      height: `${item2.height * item2.scaleY}`,
      top: `${item2.top - (item2.height * item2.scaleY) / 2 - item2.strokeWidth / 2}`,
      left: `${item2.left - (item2.width * item2.scaleX) / 2 - item2.strokeWidth / 2}`,
      rotate: `${item2.angle}`,
      borderRadius: `${item2.rx * (item2.scaleY / oldScaleY)}`,
      borderWidth: `${item2.strokeWidth}`,
      borderColor: `${item2.stroke}`,
      //align: `${item2.align}`,
      shadow: `${item2.shadow}`
    };
    let index = '';
    console.log('item2', item2);
    switch (type) {
      case 'textGroup':
        index = 1;
        item2._objects.forEach(ele => {
          if (ele.type === 'rect') {
            delete css.height;
            css = {
              ...css,
              background: `${ele.fill}`,
              borderRadius: `${ele.rx}`,
              borderWidth: `${ele.strokeWidth}`,
              borderColor: `${ele.stroke}`
            };
          } else {
            delete css.height;
            css = {
              text: `${item2.oldText}`,
              maxLines: `${ele.maxLines}`,
              ...css,
              color: ele.fill,
              padding: `${ele.padding}`,
              fontSize: `${ele.fontSize}`,
              fontWeight: `${ele.fontWeight}`,
              lineHeight: `${ele.lineHeight * 1.08}`,
              textStyle: `${ele.textStyle}`,
              textDecoration: `${ele.textDecoration === 'linethrough' ? 'line-through' : ele.textDecoration}`,
              fontFamily: `${ele.fontFamily}`,
              textAlign: `${ele.textAlign}`,
              shadow: `${ele.shadow}`
            };
          }
        });
        break;
      case 'rect':
        index = 2;
        delete css.color;
        css = {
          ...css
        };
        break;
      case 'image':
        index = 3;
        delete css.color;
        delete css.background;
        css = {
          url: item2.url,
          ...css,
          mode: `${item2.mode}`
        };
        break;
      case 'qrcode':
        index = 4;
        delete css.height;
        delete css.borderRadius;
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
    canvas_sprite.getObjects().forEach((item2, index) => {
      let view = {};
      //let oldScaleX = item2.oldScaleX || 1;
      let oldScaleY = item2.oldScaleY || 1;
      let width = item2.width * item2.scaleX;
      let height = item2.height * item2.scaleY;
      let css = {
        color: `${item2.color}`,
        background: `${item2.fill}`,
        width: `${width}px`,
        height: `${height}px`,
        top: `${item2.top - height / 2 + item2.strokeWidth / 2}px`,
        left: `${item2.left - width / 2 + item2.strokeWidth / 2}px`,
        rotate: `${item2.angle}`,
        borderRadius: `${item2.rx * (item2.scaleY / oldScaleY)}px`,
        borderWidth: `${item2.strokeWidth ? item2.strokeWidth + 'px' : ''}`,
        borderColor: `${item2.stroke}`,
        //align: `${item2.align}`,
        shadow: `${item2.shadow}`
      };
      //console.log('canvas_sprite.toObject(item2)', canvas_sprite.toObject(item2));

      let type = item2.mytype;
      if (type === 'image') {
        delete css.color;
        delete css.background;
        view = {
          type,
          url: `${item2.url}`,
          css: {
            ...css,
            mode: `${item2.mode}`
          }
        };
      } else if (type === 'qrcode') {
        /* delete css.borderRadius;
        delete css.borderWidth;
        delete css.borderColor; */
        delete css.shadow;
        view = {
          type,
          content: `${item2.url}`,
          css: {
            ...css,
            background: item2.background /* ,
              padding: `${item2.padding}rpx` */
          }
        };
      } else if (type === 'textGroup') {
        item2._objects.forEach(ele => {
          if (ele.type === 'rect') {
            view = {
              ...view,
              type: 'text',
              css: {
                ...css,
                ...view.css,
                left: `${item2.left - width / 2 + ele.padding + ele.strokeWidth}px`,
                top: `${item2.top - height / 2 + ele.padding + ele.strokeWidth}px`,
                background: `${ele.fill}`,
                borderRadius: `${ele.rx}px`,
                borderWidth: `${ele.strokeWidth ? ele.strokeWidth + 'px' : ''}`,
                borderColor: `${ele.stroke}`
              }
            };
          } else {
            view = {
              ...view,
              type: 'text',
              text: `${ele.text}`,
              css: {
                ...css,
                ...view.css,
                width: `${ele.width}px`,
                height: `${ele.height}px`,
                color: ele.fill,
                padding: `${ele.padding}px`,
                fontSize: `${ele.fontSize}px`,
                fontWeight: `${ele.fontWeight}`,
                maxLines: `${ele.maxLines}`,
                lineHeight: `${ele.lineHeight * 1.08 * ele.fontSize}px`,
                textStyle: `${ele.textStyle}`,
                textDecoration: `${ele.textDecoration === 'linethrough' ? 'line-through' : ele.textDecoration}`,
                fontFamily: `${ele.fontFamily}`,
                textAlign: `${ele.textAlign}`,
                shadow: `${ele.shadow}`
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
            color: item2.fill
          }
        };
      }
      this.views.push(view);
    });
    this.finallObj = {
      width: `${canvas_sprite.width}px`,
      height: `${canvas_sprite.height}px`,
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
    console.log('finallObj', json.plain(this.finallObj).replace(/px/g, 'rpx'));
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
    console.log('exportCode', _config.canvasState[_config.canvasState.length - 1]);
    copy('export default' + _config.canvasState[_config.canvasState.length - 1]);
  }
  importCode() {
    this.setState({
      visibleImportCode: true
    });
  }
  confirmImportCode() {
    let canvas_sprite = this.canvas_sprite;
    canvas_sprite.loadFromJSON(this.importCodeJson, () => {
      this.setState({
        visibleImportCode: false
      });
      canvas_sprite.getObjects().forEach(item => {
        this.activeObject = item;
        this.handerEditObject();
        setTimeout(() => {
          this.updateObject();
        }, 10);
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
            canvas_sprite.loadFromJSON(_config.canvasState[_config.currentStateIndex - 1], function() {
              //var jsonData = JSON.parse(_config.canvasState[_config.currentStateIndex - 1]);
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
          canvas_sprite.loadFromJSON(_config.canvasState[_config.currentStateIndex + 1], function() {
            //var jsonData = JSON.parse(_config.canvasState[_config.currentStateIndex + 1]);
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
              {/* <div className='btn'>
                <Button type='primary' onClick={this.handerUndo}>
                  撤销
                </Button>
              </div>
              <div className='btn'>
                <Button type='primary' onClick={this.handerRedo}>
                  恢复
                </Button>
              </div> */}
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
                      if (item2 === 'rotate') {
                        return null;
                      }
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
        {
          <div className='edit-modal'>
            <Drawer title='编辑对象' width={400} onClose={this.onClose} visible={visible} mask={false} placement='left'>
              {currentOptionArr.map((item, i) => {
                let type = this.activeObject.mytype;
                if (type === 'textGroup') {
                  type = 'text';
                }
                if (item.type === type) {
                  return (
                    <div key={i} className='option-li'>
                      <div className='row'>
                        <div className='h3'>{item.name} </div>
                      </div>
                      {Object.keys(item.css).map((item2, i2) => {
                        if (item2 === 'rotate') {
                          return null;
                        }
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
            </Drawer>
          </div>
        }
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
${this.miniCode}
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
            autosize={{ minRows: 10, maxRows: 6 }}
            onChange={e => {
              this.importCodeJson = e.target.value;
            }}
          />
        </Modal>
      </div>
    );
  }
}
export default App;
