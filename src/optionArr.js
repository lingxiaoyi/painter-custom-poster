import _ from 'lodash';
let optionArr = [
  {
    type: 'canvas',
    name: '画布',
    css: {
      width: '654',
      height: '1000',
      backgroundColor: '#f8f8f8'
    }
  },
  {
    type: 'text',
    name: '文字',
    css: {
      text: ' 我是来测试的,请你不要打死我',
      width: 200,
      lineHeight: 1.5,
      color: 'red',
      top: 0,
      left: 100,
      background: 'rgba(0,0,0,0)',
      fontSize: 30,
      fontWeight: ['normal', 'bold'], //文字加粗 可以不写
      maxLines: 2, //最大行数
      textStyle: ['fill', 'stroke'], //fill： 填充样式，stroke：镂空样式
      textAlign: ['left', 'center', 'right'], //文字的对齐方式，分为 left, center, right
      textDecoration: ['none', 'overline', 'underline', 'linethrough'], //overline underline line-through 可组合
      borderRadius: 1,
      borderWidth: 1,
      borderColor: '#000000',
      padding: 0,
      rotate: 0,
      shadow: '10 10 5 #888888',
      fontFamily: ''
    }
  },
  {
    type: 'rect',
    name: '矩形',
    css: {
      background: '#ffffff', //文字区域背景色
      top: 300,
      left: 100,
      width: 500,
      height: 100, //高度,没有的话就自适应
      rotate: 0,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: '#000000',
      //align: ['center', 'left', 'right'], //view 的对齐方式
      shadow: '10 10 5 #888888' //阴影
    }
  },
  {
    type: 'image',
    name: '图片',
    css: {
      url: 'https://operate.maiyariji.com/20190709%2F3da002983292a6950a71ca7392a21827.jpg',
      mode: ['scaleToFill', 'aspectFill', 'auto'],
      top: 100,
      left: 100,
      width: 100,
      height: 100, //高度,没有的话就自适应
      rotate: 0,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: '#000000',
      shadow: ''
    }
  },
  {
    type: 'qrcode',
    name: '二维码',
    css: {
      url: '哈哈哈',
      color: '#000000', //字体颜色 linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)
      background: '#ffffff', //文字区域背景色
      top: 10,
      left: 300,
      width: 200,
      rotate: 0,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#000000',
      //align: ['center', 'left', 'right'], //view 的对齐方式
      //padding: '3'
    }
  }
];

//得到当前默认信息
let newOptionArr = _.cloneDeep(optionArr);
newOptionArr[1].css.textStyle = newOptionArr[1].css.textStyle[0];
newOptionArr[1].css.textAlign = newOptionArr[1].css.textAlign[0];
newOptionArr[1].css.fontWeight = newOptionArr[1].css.fontWeight[0];
newOptionArr[1].css.textDecoration = newOptionArr[1].css.textDecoration[0];
newOptionArr[3].css.mode = newOptionArr[3].css.mode[0];
export { optionArr, newOptionArr };
